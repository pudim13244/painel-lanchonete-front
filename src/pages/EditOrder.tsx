import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { MenuCard } from "@/components/MenuCard";
import { CartSidebar } from "@/components/CartSidebar";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { EstablishmentService } from "@/services/establishment";
import api from "@/lib/axios";

const EditOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [order, setOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pedido = await EstablishmentService.getOrderDetails(Number(id));
        setOrder(pedido);
        setCartItems(pedido.items.map(item => ({ 
          ...item, 
          id: item.product_id?.toString() || item.id?.toString(),
          price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
          selectedOptions: item.additions || [],
          quantity: item.quantity || 1
        })));
        const res = await api.get(`/products?establishment_id=${pedido.establishment_id}`);
        
        const formattedProducts = res.data.products.map((product: any) => ({
          id: product.id.toString(),
          name: product.name,
          description: product.description || '',
          price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
          image_url: product.image_url,
          category: {
            id: product.category.id,
            name: product.category.name
          },
          additional_groups: product.additional_groups || []
        }));
        
        setMenuItems(formattedProducts);
      } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar o pedido.", variant: "destructive" });
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, toast, navigate]);

  const openProductDetails = (item: any) => {
    const formattedProduct = {
      ...item,
      price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0)
    };
    setSelectedProduct(formattedProduct);
    setIsProductModalOpen(true);
  };

  const addToCart = (product: any, selectedOptions: any[], obs: string) => {
    const cartItem = {
      ...product,
      id: product.id.toString(),
      price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
      quantity: 1,
      selectedOptions: selectedOptions.map(option => ({
        ...option,
        price: typeof option.price === 'string' ? parseFloat(option.price) : (option.price || 0)
      })),
      obs,
      establishment_id: order.establishment_id
    };
    setCartItems(prev => [...prev, cartItem]);
    setIsCartOpen(true);
    toast({ title: "Item adicionado!", description: `${product.name} foi adicionado ao pedido.` });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const categories = ["Todos", ...Array.from(new Set(menuItems.map(item => item.category.name)))];
  const filteredItems = menuItems.filter(item => selectedCategory === "Todos" || item.category.name === selectedCategory);

  // Remover item do carrinho
  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Alterar quantidade
  const handleChangeQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item));
  };

  // Função para limpar undefined recursivamente
  function cleanObject(obj: any) {
    if (Array.isArray(obj)) {
      return obj.map(cleanObject);
    } else if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanObject(obj[key]);
        }
      });
      return cleaned;
    }
    return obj;
  }

  // Salvar alterações
  const handleSave = async (customerInfo?: any, paymentMethod?: string, amountPaid?: string) => {
    if (!order) return;
    setSaving(true);
    try {
      const total = cartItems.reduce((acc, item) => {
        const base = Number(item.price || 0) * (item.quantity || 1);
        const adds = (item.selectedOptions || []).reduce((sum, add) => sum + (Number(add.price || 0) * (add.quantity || 1)), 0);
        return acc + base + adds;
      }, 0);
      
      const payload: any = {
        status: order.status ?? null,
        payment_method: paymentMethod ?? order.payment_method ?? null,
        amount_paid: paymentMethod === 'CASH' ? (amountPaid ? Number(amountPaid) : 0) : null,
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: item.price,
          obs: item.obs || null,
          additions: (item.selectedOptions || [])
            .filter(opt => opt.id && !isNaN(Number(opt.id)) && Number(opt.id) >= 2 && Number(opt.id) <= 23)
            .map(opt => ({
              id: Number(opt.id),
              name: opt.name,
              quantity: opt.quantity,
              price: opt.price
            }))
        })),
        total_amount: total ?? null
      };
      const cleanedPayload = cleanObject(payload);
      await EstablishmentService.updateOrder(order.id, cleanedPayload);
      toast({ title: "Pedido atualizado!", description: `Pedido #${order.id} foi atualizado com sucesso.` });
      navigate("/orders");
    } catch (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !order) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Editar Pedido <span className="text-orange-600">#{order.id}</span>
          </h1>
          <div className="text-center mb-2">
            <span className="text-lg font-semibold text-gray-700">Cliente: {order.customer_name || '---'}</span>
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-600">
              Produtos do estabelecimento: <span className="font-semibold">{order.establishment_name}</span>
            </p>
          </div>
          {menuItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Categorias</h2>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="flex flex-wrap h-auto">
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="flex-shrink-0">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onAddToCart={() => openProductDetails(item)}
              />
            ))}
          </div>
        )}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsCartOpen(true)}
            className="h-16 w-16 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600"
                  variant="secondary"
                >
                  {totalItems}
                </Badge>
              )}
            </div>
          </Button>
        </div>
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateItems={setCartItems}
          orderType={order.order_type || "delivery"}
          initialCustomerInfo={{
            name: order.customer_name || "",
            phone: order.customer_phone || "",
            address: order.customer_address || "",
            notes: order.notes || "",
            table: order.table_number || ""
          }}
          initialPaymentMethod={order.payment_method || "CASH"}
          initialAmountPaid={order.amount_paid?.toString() || ""}
          onSave={handleSave}
          saving={saving}
          editMode={true}
        />
        {selectedProduct && (
          <ProductDetailsModal
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            product={selectedProduct}
            onAddToCart={addToCart}
          />
        )}
      </div>
    </div>
  );
};

export default EditOrderPage; 
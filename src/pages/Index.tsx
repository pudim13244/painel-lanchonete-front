import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Home, Package, Clock } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { MenuCard } from "@/components/MenuCard";
import { CartSidebar } from "@/components/CartSidebar";
import { EstablishmentSelector } from "@/components/EstablishmentSelector";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

interface Option {
  id: number;
  name: string;
  price: number;
  description?: string;
  quantity: number;
}

interface AdditionalGroup {
  id: number;
  name: string;
  type: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  options: Option[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: {
    id: number;
    name: string;
  };
  additional_groups: AdditionalGroup[];
}

interface CartItem extends MenuItem {
  quantity: number;
  selectedOptions: Option[];
  obs: string;
  establishment_id?: number;
}

interface CartContextType {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  total: number;
}

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<"local" | "delivery" | "pickup">("local");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ESTABLISHMENT' && user.id) {
      if(selectedEstablishmentId !== user.id) {
        setSelectedEstablishmentId(user.id);
      }
    }
  }, [isAuthenticated, user, selectedEstablishmentId]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedEstablishmentId) {
        setLoading(false);
        setMenuItems([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/products?establishment_id=${selectedEstablishmentId}`);
        
        const formattedProducts: MenuItem[] = response.data.products.map((product: any) => ({
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
        console.error('Erro ao buscar produtos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos.",
          variant: "destructive",
        });
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedEstablishmentId, toast]);

  const openProductDetails = (item: MenuItem) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSelectedProduct(item);
    setIsProductModalOpen(true);
  };

  const addToCart = (
    product: MenuItem,
    selectedOptions: Option[],
    obs: string
  ) => {
    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      selectedOptions,
      obs,
      establishment_id: selectedEstablishmentId || undefined
    };

    setCartItems(prev => [...prev, cartItem]);
    setIsCartOpen(true);
    
    toast({
      title: "Item adicionado!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleEstablishmentSelect = (establishmentId: number) => {
    setSelectedEstablishmentId(establishmentId);
  };

  const categories = ["Todos", ...Array.from(new Set(menuItems.map(item => item.category.name)))];

  const filteredItems = menuItems.filter(item => 
    selectedCategory === "Todos" || item.category.name === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            <span className="text-3xl font-bold">
              QuickPainel
            </span>
          </h1>
          
          {isAuthenticated && user && user.role === 'ESTABLISHMENT' && (
            <div className="text-center mb-4">
              <p className="text-gray-600">
                Exibindo produtos do seu estabelecimento: <span className="font-semibold">{user.name}</span>
              </p>
            </div>
            
          )}
          
          {isAuthenticated && user && user.role === 'CUSTOMER' && (
            <>
              <EstablishmentSelector 
                onSelect={handleEstablishmentSelect}
                selectedId={selectedEstablishmentId || undefined}
              />
              {selectedEstablishmentId && (
                <div className="text-center mb-4">
                  <p className="text-gray-600">
                    Estabelecimento selecionado
                  </p>
                </div>
              )}
            </>
          )}
          
          {isAuthenticated && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Tipo de Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="local" className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Consumo Local
                    </TabsTrigger>
                    <TabsTrigger value="delivery" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Entrega
                    </TabsTrigger>
                    <TabsTrigger value="pickup" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Retirada
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="local" className="mt-4">
                    <p className="text-gray-600">Pedido para consumo no local. A mesa será definida no checkout.</p>
                  </TabsContent>
                  <TabsContent value="delivery" className="mt-4">
                    <p className="text-gray-600">Entrega em domicílio. Taxa de entrega será calculada no checkout.</p>
                  </TabsContent>
                  <TabsContent value="pickup" className="mt-4">
                    <p className="text-gray-600">Retirada no balcão. Tempo estimado: 15-20 minutos.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : menuItems.length === 0 ? (
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
      </div>

      {isAuthenticated && (
        <>
          <Button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
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

          <CartSidebar
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateItems={setCartItems}
            orderType={orderType}
          />
        </>
      )}

      {selectedProduct && (
        <ProductDetailsModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProduct}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default Index;

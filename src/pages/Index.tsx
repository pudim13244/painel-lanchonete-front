
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Home, Package, Clock } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { MenuCard } from "@/components/MenuCard";
import { CartSidebar } from "@/components/CartSidebar";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"local" | "delivery" | "pickup">("local");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const menuItems = [
    {
      id: "1",
      name: "X-Burguer Especial",
      description: "Hambúrguer artesanal com queijo, alface, tomate e molho especial",
      price: 25.90,
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center",
      category: "Hambúrguers"
    },
    {
      id: "2",
      name: "Pizza Margherita",
      description: "Massa artesanal, molho de tomate, mussarela e manjericão",
      price: 35.00,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&crop=center",
      category: "Pizzas"
    },
    {
      id: "3",
      name: "Batata Frita Especial",
      description: "Batatas crocantes com tempero especial da casa",
      price: 15.50,
      image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop&crop=center",
      category: "Acompanhamentos"
    },
    {
      id: "4",
      name: "Refrigerante 350ml",
      description: "Coca-Cola, Guaraná ou Sprite",
      price: 6.00,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&crop=center",
      category: "Bebidas"
    }
  ];

  const addToCart = (item: any) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    
    toast({
      title: "Item adicionado!",
      description: `${item.name} foi adicionado ao carrinho.`,
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Lanchonete <span className="text-orange-600">Sabor</span><span className="text-green-600">Express</span>
          </h1>
          
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
                  <p className="text-gray-600">Pedido para consumo no local. Mesa será definida no checkout.</p>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>

      <Button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        size="lg"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
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
    </div>
  );
};

export default Index;

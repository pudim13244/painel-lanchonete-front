
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Package, CheckCircle, Truck, Edit3, Eye } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { OrderModal } from "@/components/OrderModal";

interface Order {
  id: string;
  customer: string;
  phone: string;
  type: "local" | "delivery" | "pickup";
  status: "pending" | "preparing" | "ready" | "delivering" | "completed";
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  createdAt: string;
  table?: string;
  address?: string;
  deliveryPerson?: string;
}

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const orders: Order[] = [
    {
      id: "001",
      customer: "João Silva",
      phone: "(11) 99999-9999",
      type: "local",
      status: "pending",
      items: [
        { name: "X-Burguer Especial", quantity: 2, price: 25.90 },
        { name: "Batata Frita", quantity: 1, price: 15.50 }
      ],
      total: 67.30,
      createdAt: "14:30",
      table: "5"
    },
    {
      id: "002",
      customer: "Maria Santos",
      phone: "(11) 88888-8888",
      type: "delivery",
      status: "preparing",
      items: [
        { name: "Pizza Margherita", quantity: 1, price: 35.00 }
      ],
      total: 40.00,
      createdAt: "14:15",
      address: "Rua das Flores, 123 - Centro",
      deliveryPerson: "Carlos"
    },
    {
      id: "003",
      customer: "Pedro Costa",
      phone: "(11) 77777-7777",
      type: "pickup",
      status: "ready",
      items: [
        { name: "X-Burguer Especial", quantity: 1, price: 25.90 },
        { name: "Refrigerante", quantity: 2, price: 6.00 }
      ],
      total: 37.90,
      createdAt: "14:00"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "preparing": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivering": return "bg-orange-100 text-orange-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendente";
      case "preparing": return "Preparando";
      case "ready": return "Pronto";
      case "delivering": return "Em Entrega";
      case "completed": return "Concluído";
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "local": return "Consumo Local";
      case "delivery": return "Entrega";
      case "pickup": return "Retirada";
      default: return type;
    }
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === "all") return orders;
    return orders.filter(order => order.status === status);
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Pedidos</h1>
          <p className="text-gray-600">Acompanhe todos os pedidos em tempo real</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="preparing">Preparando</TabsTrigger>
            <TabsTrigger value="ready">Prontos</TabsTrigger>
            <TabsTrigger value="delivering">Em Entrega</TabsTrigger>
          </TabsList>

          {["all", "pending", "preparing", "ready", "delivering"].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterOrdersByStatus(status).map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                          <p className="text-sm text-gray-500">{order.createdAt}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-600">{order.phone}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {order.type === "local" && <Clock className="w-4 h-4" />}
                        {order.type === "delivery" && <Truck className="w-4 h-4" />}
                        {order.type === "pickup" && <Package className="w-4 h-4" />}
                        <span className="text-sm">{getTypeText(order.type)}</span>
                        {order.table && <span className="text-sm">- Mesa {order.table}</span>}
                      </div>
                      
                      {order.address && (
                        <p className="text-sm text-gray-600">📍 {order.address}</p>
                      )}
                      
                      {order.deliveryPerson && (
                        <p className="text-sm text-blue-600">🚗 {order.deliveryPerson}</p>
                      )}
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-green-600">R$ {order.total.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOrderModal(order)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openOrderModal(order)}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filterOrdersByStatus(status).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pedido encontrado</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default Orders;

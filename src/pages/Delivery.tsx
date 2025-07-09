import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Phone, MapPin, Plus, Edit3, Trash2, Clock } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  status: "available" | "busy" | "offline";
  currentOrders: number;
  totalDeliveries: number;
  rating: number;
}

interface DeliveryOrder {
  id: string;
  customer: string;
  address: string;
  deliveryPersonId: string;
  status: "assigned" | "picked_up" | "delivering" | "delivered";
  estimatedTime: string;
}

const Delivery = () => {
  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryPerson[]>([
    {
      id: "1",
      name: "Carlos Silva",
      phone: "(11) 99999-9999",
      status: "available",
      currentOrders: 0,
      totalDeliveries: 145,
      rating: 4.8
    },
    {
      id: "2",
      name: "Ana Santos",
      phone: "(11) 88888-8888",
      status: "busy",
      currentOrders: 2,
      totalDeliveries: 98,
      rating: 4.9
    },
    {
      id: "3",
      name: "João Costa",
      phone: "(11) 77777-7777",
      status: "offline",
      currentOrders: 0,
      totalDeliveries: 67,
      rating: 4.6
    }
  ]);

  const [deliveryOrders] = useState<DeliveryOrder[]>([
    {
      id: "002",
      customer: "Maria Santos",
      address: "Rua das Flores, 123 - Centro",
      deliveryPersonId: "2",
      status: "delivering",
      estimatedTime: "20 min"
    }
  ]);

  const [newDeliveryPerson, setNewDeliveryPerson] = useState({
    name: "",
    phone: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "busy": return "bg-orange-100 text-orange-800";
      case "offline": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available": return "Disponível";
      case "busy": return "Ocupado";
      case "offline": return "Offline";
      default: return status;
    }
  };

  const handleAddDeliveryPerson = () => {
    if (!newDeliveryPerson.name || !newDeliveryPerson.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e telefone do entregador.",
      });
      return;
    }

    const newPerson: DeliveryPerson = {
      id: Date.now().toString(),
      name: newDeliveryPerson.name,
      phone: newDeliveryPerson.phone,
      status: "available",
      currentOrders: 0,
      totalDeliveries: 0,
      rating: 5.0
    };

    setDeliveryPeople([...deliveryPeople, newPerson]);
    setNewDeliveryPerson({ name: "", phone: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Entregador adicionado!",
      description: `${newPerson.name} foi adicionado à equipe.`,
    });
  };

  const toggleStatus = (id: string) => {
    setDeliveryPeople(deliveryPeople.map(person => {
      if (person.id === id) {
        const newStatus = person.status === "available" ? "offline" : "available";
        return { ...person, status: newStatus };
      }
      return person;
    }));
  };

  const removeDeliveryPerson = (id: string) => {
    const person = deliveryPeople.find(p => p.id === id);
    setDeliveryPeople(deliveryPeople.filter(p => p.id !== id));
    
    toast({
      title: "Entregador removido",
      description: `${person?.name} foi removido da equipe.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Entregadores</h1>
            <p className="text-gray-600">Gerencie sua equipe de entrega</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Entregador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Entregador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newDeliveryPerson.name}
                    onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, name: e.target.value })}
                    placeholder="Nome do entregador"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newDeliveryPerson.phone}
                    onChange={(e) => setNewDeliveryPerson({ ...newDeliveryPerson, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddDeliveryPerson} className="flex-1">
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery People */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Entregadores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveryPeople.map((person) => (
                <Card key={person.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#B21735] rounded-full flex items-center justify-center text-white font-bold">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{person.name}</CardTitle>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {person.phone}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(person.status)}>
                        {getStatusText(person.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Pedidos Atuais</p>
                        <p className="font-semibold">{person.currentOrders}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Entregas</p>
                        <p className="font-semibold">{person.totalDeliveries}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Avaliação:</span>
                      <span className="font-semibold text-yellow-600">⭐ {person.rating}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(person.id)}
                        className="flex-1"
                      >
                        {person.status === "available" ? "Colocar Offline" : "Colocar Online"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeDeliveryPerson(person.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Active Deliveries */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Entregas em Andamento</h2>
            <div className="space-y-4">
              {deliveryOrders.map((order) => {
                const deliveryPerson = deliveryPeople.find(p => p.id === order.deliveryPersonId);
                
                return (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">Pedido #{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <p className="text-sm">{order.address}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <p className="text-sm">{deliveryPerson?.name}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <p className="text-sm">Previsão: {order.estimatedTime}</p>
                        </div>
                        
                        <Badge className="bg-orange-100 text-orange-800">
                          Em Entrega
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {deliveryOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma entrega em andamento</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;

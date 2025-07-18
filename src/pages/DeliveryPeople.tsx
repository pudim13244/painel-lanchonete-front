import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Navigation } from '@/components/Navigation';
import { 
  User, 
  Phone, 
  Mail, 
  Star, 
  Users, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface DeliveryPerson {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_default: boolean;
  active_orders: number;
  is_available: boolean;
  apply_fee: boolean;
}

const DeliveryPeople: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const [linkLoading, setLinkLoading] = useState(false);

  const fetchDeliveryPeople = async () => {
    setLoading(true);
    try {
      const res = await api.get('/establishment/delivery-people');
      setDeliveryPeople(Array.isArray(res.data.delivery_people) ? res.data.delivery_people : []);
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao buscar entregadores', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryPeople();
  }, []);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkLoading(true);
    try {
      await api.post('/establishment/delivery-people/link', { email });
      toast({ title: 'Sucesso', description: 'Entregador vinculado!' });
      setEmail('');
      fetchDeliveryPeople();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.response?.data?.message || 'Erro ao vincular entregador', variant: 'destructive' });
    } finally {
      setLinkLoading(false);
    }
  };

  const handleSetPriority = async (delivery_id: number) => {
    try {
      await api.post('/establishment/delivery-people/set-priority', { delivery_id });
      toast({ title: 'Sucesso', description: 'Entregador prioritário definido!' });
      fetchDeliveryPeople();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.response?.data?.message || 'Erro ao definir prioridade', variant: 'destructive' });
    }
  };

  const handleUnlink = async (delivery_id: number) => {
    if (!window.confirm('Tem certeza que deseja desvincular este entregador?')) return;
    try {
      await api.delete(`/establishment/delivery-people/${delivery_id}`);
      toast({ title: 'Desvinculado', description: 'Entregador desvinculado com sucesso!' });
      fetchDeliveryPeople();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao desvincular entregador';
      const activeOrders = err.response?.data?.activeOrders;
      
      let description = errorMessage;
      if (activeOrders && activeOrders > 0) {
        description = `${errorMessage} (${activeOrders} pedido${activeOrders > 1 ? 's' : ''} ativo${activeOrders > 1 ? 's' : ''})`;
      }
      
      toast({ 
        title: 'Erro', 
        description, 
        variant: 'destructive' 
      });
    }
  };

  // Filtrar entregadores duplicados por id
  const uniqueDeliveryPeople = Array.isArray(deliveryPeople)
    ? deliveryPeople.filter(
        (person, index, self) =>
          index === self.findIndex((p) => p.id === person.id)
      )
    : [];

  const getStatusColor = (isAvailable: boolean, activeOrders: number) => {
    if (!isAvailable) return 'bg-red-100 text-red-800';
    if (activeOrders === 0) return 'bg-green-100 text-green-800';
    if (activeOrders < 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (isAvailable: boolean, activeOrders: number) => {
    if (!isAvailable) return 'Indisponível';
    if (activeOrders === 0) return 'Disponível';
    if (activeOrders < 3) return `${activeOrders} pedidos ativos`;
    return 'Máximo de pedidos';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entregadores Vinculados</h1>
          <p className="text-gray-600">Gerencie os entregadores vinculados ao seu estabelecimento</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Vincular Novo Entregador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLink} className="flex gap-2 items-center">
              <Input
                type="email"
                placeholder="E-mail do entregador"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="max-w-xs"
              />
              <Button type="submit" disabled={linkLoading}>
                {linkLoading ? 'Vinculando...' : 'Vincular'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Entregadores Vinculados ({uniqueDeliveryPeople.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B21735]"></div>
              </div>
            ) : uniqueDeliveryPeople.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum entregador vinculado</p>
                <p className="text-gray-400">Vincule um entregador usando o formulário acima</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueDeliveryPeople.map((delivery) => (
                  <Card key={delivery.id} className={`transition-all hover:shadow-lg ${
                    delivery.is_default ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#B21735] rounded-full flex items-center justify-center text-white font-bold">
                            {delivery.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {delivery.name}
                              {delivery.is_default && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </CardTitle>
                            <Badge className={getStatusColor(delivery.is_available, delivery.active_orders)}>
                              {getStatusText(delivery.is_available, delivery.active_orders)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {delivery.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {delivery.phone || 'Não informado'}
                        </div>

                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Pedidos ativos:</span>
                          <span className="font-semibold">{delivery.active_orders}</span>
                        </div>
                        {delivery.is_default && (
                          <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mt-1">
                            <CheckCircle className="w-4 h-4" />
                            Entregador Prioritário
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3">
                        {!delivery.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPriority(delivery.id)}
                            className="flex-1"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Definir Prioritário
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUnlink(delivery.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Desvincular
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryPeople; 
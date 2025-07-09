import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface DeliveryPerson {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  vehicle_model: string;
  is_default: boolean;
  active_orders: number;
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
      setDeliveryPeople(Array.isArray(res.data) ? res.data : []);
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
      toast({ title: 'Erro', description: err.response?.data?.message || 'Erro ao desvincular entregador', variant: 'destructive' });
    }
  };

  // Filtrar entregadores duplicados por id
  const uniqueDeliveryPeople = Array.isArray(deliveryPeople)
    ? deliveryPeople.filter(
        (person, index, self) =>
          index === self.findIndex((p) => p.id === person.id)
      )
    : [];

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vincular Entregador</CardTitle>
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
          <CardTitle>Entregadores Vinculados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando...</div>
          ) : (Array.isArray(deliveryPeople) && deliveryPeople.length === 0) ? (
            <div>Nenhum entregador vinculado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(uniqueDeliveryPeople || []).map((delivery, idx) => (
                <div key={delivery.id || idx} className={`border rounded p-4 ${delivery.is_default ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="font-bold text-lg">{delivery.name}</div>
                  <div className="text-sm text-gray-600">{delivery.email}</div>
                  <div className="text-sm text-gray-600">{delivery.phone}</div>
                  <div className="text-sm text-gray-600">{delivery.vehicle_type} {delivery.vehicle_model}</div>
                  <div className="text-sm mt-2">Pedidos ativos: {delivery.active_orders}</div>
                  {delivery.is_default && <div className="text-green-700 font-semibold mt-1">Prioritário</div>}
                  <Button
                    variant={delivery.is_default ? 'outline' : 'secondary'}
                    className="mt-2 mr-2"
                    onClick={() => handleSetPriority(delivery.id)}
                    disabled={delivery.is_default}
                  >
                    {delivery.is_default ? 'Já é prioritário' : 'Definir como prioritário'}
                  </Button>
                  <Button
                    variant="destructive"
                    className="mt-2"
                    onClick={() => handleUnlink(delivery.id)}
                  >
                    Desvincular
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryPeople; 
import React, { useState, useEffect } from 'react';
import { 
  getOrdersReadyForDelivery, 
  getDeliveryPeople, 
  assignDeliveryToOrder, 
  assignDeliveryAuto, 
  removeDeliveryFromOrder,
  OrderForDelivery,
  DeliveryPerson,
  EstablishmentService,
  EstablishmentProfile,
  getOrderOffers
} from '@/services/establishment';
import { useToast } from '@/hooks/use-toast';
import { 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Users,
  AlertCircle
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DeliveryControl: React.FC = () => {
  const [orders, setOrders] = useState<OrderForDelivery[]>([]);
  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningOrder, setAssigningOrder] = useState<number | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<{ [key: number]: number }>({});
  const { toast } = useToast();
  const [profile, setProfile] = useState<EstablishmentProfile | null>(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [deliveryOrders, setDeliveryOrders] = useState<OrderForDelivery[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderOffers, setOrderOffers] = useState<{ [orderId: number]: any[] }>({});

  useEffect(() => {
    loadData();
    EstablishmentService.getProfile().then(setProfile).catch(() => {});
  }, []);

  const loadOrderOffers = async (ordersList: OrderForDelivery[]) => {
    const offersObj: { [orderId: number]: any[] } = {};
    await Promise.all(
      ordersList.map(async (order) => {
        try {
          const offers = await getOrderOffers(order.id);
          offersObj[order.id] = offers;
        } catch {
          offersObj[order.id] = [];
        }
      })
    );
    setOrderOffers(offersObj);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, deliveryData] = await Promise.all([
        getOrdersReadyForDelivery(),
        getDeliveryPeople()
      ]);
      setOrders(ordersData);
      setDeliveryPeople(deliveryData);
      await loadOrderOffers(ordersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDelivery = async (orderId: number, deliveryId: number) => {
    try {
      setAssigningOrder(orderId);
      await assignDeliveryToOrder(orderId, deliveryId);
      toast({
        title: "Sucesso",
        description: "Entregador atribuído com sucesso!",
      });
      loadData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao atribuir entregador:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || 'Erro ao atribuir entregador',
        variant: "destructive"
      });
    } finally {
      setAssigningOrder(null);
    }
  };

  const handleAssignAuto = async (orderId: number) => {
    try {
      setAssigningOrder(orderId);
      const result = await assignDeliveryAuto(orderId);
      toast({
        title: "Sucesso",
        description: `${result.message}: ${result.delivery_name}`,
      });
      loadData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao atribuir automaticamente:', error);
      
      // Verificar se é o erro de entregadores não vinculados
      if (error.message?.includes('Nenhum entregador vinculado disponível')) {
        toast({
          title: "Vincule Entregadores",
          description: "Nenhum entregador vinculado disponível. Clique para vincular entregadores ao seu estabelecimento.",
          variant: "destructive",
          action: (
            <button
              onClick={() => window.location.href = '/delivery-people'}
              className="bg-[#B21735] text-white px-3 py-1 rounded text-sm hover:bg-[#361617] transition-colors"
            >
              Vincular Entregadores
            </button>
          )
        });
      } else {
        toast({
          title: "Erro",
          description: error.message || 'Erro ao atribuir automaticamente',
          variant: "destructive"
        });
      }
    } finally {
      setAssigningOrder(null);
    }
  };

  const handleRemoveDelivery = async (orderId: number) => {
    try {
      setAssigningOrder(orderId);
      await removeDeliveryFromOrder(orderId);
      toast({
        title: "Sucesso",
        description: "Entregador removido com sucesso!",
      });
      loadData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao remover entregador:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || 'Erro ao remover entregador',
        variant: "destructive"
      });
    } finally {
      setAssigningOrder(null);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <DollarSign className="w-4 h-4" />;
      case 'CREDIT':
      case 'DEBIT':
        return <CreditCard className="w-4 h-4" />;
      case 'PIX':
        return <div className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center">P</div>;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Dinheiro';
      case 'CREDIT':
        return 'Crédito';
      case 'DEBIT':
        return 'Débito';
      case 'PIX':
        return 'PIX';
      default:
        return method;
    }
  };

  const handleOpenDeliveryModal = async (delivery: DeliveryPerson) => {
    setSelectedDeliveryPerson(delivery);
    setModalOpen(true);
    // Buscar pedidos desse entregador
    try {
      const orders = await getOrdersReadyForDelivery();
      setDeliveryOrders(orders.filter(o => o.delivery_id === delivery.id));
    } catch (e) {
      setDeliveryOrders([]);
    }
  };

  const handleCloseDeliveryModal = () => {
    setModalOpen(false);
    setSelectedDeliveryPerson(null);
    setDeliveryOrders([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#B21735]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="w-8 h-8 text-[#B21735]" />
                Controle de Entregadores
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie a distribuição dos pedidos entre os entregadores
              </p>
            </div>
            <button
              onClick={loadData}
              className="bg-[#B21735] hover:bg-[#361617] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Aviso sobre configuração de entregadores */}
        {profile && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${profile.only_linked_delivery ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-green-50 border-green-300 text-green-900'}`}>
            <AlertCircle className="w-6 h-6" />
            <div>
              {profile.only_linked_delivery ? (
                <span><b>Somente entregadores vinculados</b> podem receber pedidos automaticamente neste estabelecimento.</span>
              ) : (
                <span><b>Qualquer entregador disponível</b> pode receber pedidos automaticamente neste estabelecimento.</span>
              )}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Prontos</p>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(orders) ? orders.length : 0}</p>
              </div>
              <div className="p-3 bg-[#EDE2DC] rounded-full">
                <AlertCircle className="w-6 h-6 text-[#B21735]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregadores</p>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(deliveryPeople) ? deliveryPeople.length : 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">
                  {Array.isArray(deliveryPeople) ? deliveryPeople.filter(d => d.is_available).length : 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atribuídos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Array.isArray(orders) ? orders.filter(o => o.delivery_id).length : 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Truck className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Entregadores */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Entregadores Disponíveis</h2>
          </div>
          <div className="p-6">
            {Array.isArray(deliveryPeople) && deliveryPeople.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum entregador cadastrado</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const filtered = (Array.isArray(deliveryPeople) ? deliveryPeople : []).filter(delivery => delivery.active_orders && delivery.active_orders > 0);
                  if (filtered.length === 0) {
                    return <div className="text-center text-gray-500 py-8">Nenhum entregador está em rota para este estabelecimento no momento.</div>;
                  }
                  return filtered.map((delivery) => (
                    <div
                      key={`delivery-${delivery.id}`}
                      className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        delivery.is_available 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                      onClick={() => handleOpenDeliveryModal(delivery)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#EDE2DC] rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-[#B21735]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{delivery.name}</h3>
                            <p className="text-sm text-gray-600">{delivery.vehicle_type}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          delivery.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {delivery.is_available ? 'Disponível' : 'Ocupado'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{delivery.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {delivery.vehicle_model} {delivery.has_plate && delivery.plate && `(${delivery.plate})`}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[#EDE2DC] rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#B21735]">{delivery.active_orders}</span>
                          </div>
                          <span className="text-gray-600">
                            {delivery.active_orders} pedido{delivery.active_orders !== 1 ? 's' : ''} ativo{delivery.active_orders !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Pedidos Prontos para Entrega</h2>
          </div>
          <div className="p-6">
            {Array.isArray(orders) && orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum pedido pronto para entrega</p>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(orders) ? orders : []).map((order) => {
                  const offers = orderOffers[order.id] || [];
                  let mainOffer = null;
                  if (offers.length > 0) {
                    mainOffer = offers.find(o => o.offer_status === 'pending')
                      || offers.find(o => o.offer_status === 'accepted')
                      || offers.find(o => o.offer_status === 'rejected')
                      || offers[0]; // mais recente (expirada ou qualquer outra)
                  }
                  return (
                    <div
                      key={`order-${order.id}`}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Pedido #{order.id.toString().padStart(3, '0')}
                            </h3>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(order.payment_method)}
                              <span className="text-sm text-gray-600">
                                {getPaymentMethodText(order.payment_method)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{order.time_ago}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{order.customer_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{order.customer_phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{order.delivery_address}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Valores</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span className="font-medium">R$ {(order.total_amount - order.delivery_fee).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Taxa de entrega:</span>
                                  <span className="font-medium">R$ {order.delivery_fee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1">
                                  <span className="font-medium text-gray-900">Total:</span>
                                  <span className="font-bold text-lg text-gray-900">R$ {order.total_amount.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Entregador Atual */}
                      {order.delivery_id && order.delivery_person_name && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-800">
                                  Entregador: {order.delivery_person_name}
                                </p>
                                <p className="text-sm text-green-600">
                                  {order.delivery_person_phone}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveDelivery(order.id)}
                              disabled={assigningOrder === order.id}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              {assigningOrder === order.id ? 'Removendo...' : 'Remover'}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Oferta de entregador mais relevante */}
                      {mainOffer && (
                        <div className={
                          `mb-4 p-3 rounded border flex items-center gap-3 ` +
                          (mainOffer.offer_status === 'accepted' ? 'bg-green-50 border-green-200' : '') +
                          (mainOffer.offer_status === 'pending' ? 'bg-yellow-50 border-yellow-200' : '') +
                          (mainOffer.offer_status === 'rejected' ? 'bg-red-50 border-red-200' : '') +
                          (mainOffer.offer_status === 'expired' ? 'bg-gray-50 border-gray-200' : '')
                        }>
                          <span className="font-medium">{mainOffer.delivery_name || 'Entregador desconhecido'}</span>
                          <span className="text-xs text-gray-500">{mainOffer.delivery_phone}</span>
                          <span className="text-xs ml-2">
                            Status: <b>{mainOffer.offer_status === 'pending' && 'Pendente'}{mainOffer.offer_status === 'accepted' && 'Aceito'}{mainOffer.offer_status === 'rejected' && 'Recusado'}{mainOffer.offer_status === 'expired' && 'Expirado'}</b>
                          </span>
                          {mainOffer.vehicle_type && (
                            <span className="text-xs text-gray-600 ml-2">{mainOffer.vehicle_type} {mainOffer.vehicle_model} {mainOffer.plate}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Ações */}
                      <div className="flex items-center gap-3">
                        {!order.delivery_id ? (
                          <>
                            {profile?.only_linked_delivery === true && (
                              <>
                                <select
                                  value={selectedDelivery[order.id] || ''}
                                  onChange={(e) => setSelectedDelivery({
                                    ...selectedDelivery,
                                    [order.id]: Number(e.target.value)
                                  })}
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B21735]"
                                >
                                  <option value="">Selecionar entregador...</option>
                                  {Array.isArray(deliveryPeople) && deliveryPeople
                                    .filter(d => d.is_available)
                                    .map((delivery) => (
                                      <option key={`option-${delivery.id}`} value={delivery.id}>
                                        {delivery.name} ({delivery.active_orders} pedidos ativos)
                                      </option>
                                    ))
                                  }
                                </select>
                                
                                <button
                                  onClick={() => handleAssignDelivery(order.id, selectedDelivery[order.id])}
                                  disabled={!selectedDelivery[order.id] || assigningOrder === order.id}
                                  className="bg-[#B21735] hover:bg-[#361617] disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                  {assigningOrder === order.id ? 'Atribuindo...' : 'Atribuir'}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleAssignAuto(order.id)}
                              disabled={assigningOrder === order.id}
                              className="bg-[#B21735] hover:bg-[#361617] disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              {assigningOrder === order.id ? 'Atribuindo...' : 'Auto'}
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Entregador atribuído</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal de entregador */}
        <Dialog open={modalOpen} onOpenChange={handleCloseDeliveryModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Entregador</DialogTitle>
            </DialogHeader>
            {selectedDeliveryPerson && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedDeliveryPerson.name}</h3>
                  <p className="text-sm text-gray-600">{selectedDeliveryPerson.phone}</p>
                  <p className="text-sm text-gray-600">{selectedDeliveryPerson.vehicle_type} {selectedDeliveryPerson.vehicle_model}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pedidos Ativos</h4>
                  {deliveryOrders.length === 0 ? (
                    <p className="text-gray-500">Nenhum pedido ativo</p>
                  ) : (
                    <ul className="space-y-2">
                      {deliveryOrders.map(order => (
                        <li key={`modal-order-${order.id}`} className="border rounded p-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Pedido #{order.id}</span>
                            <span className="text-xs text-gray-500">{(order as any).status ?? "-"}</span>
                          </div>
                          <div className="text-sm text-gray-700">Cliente: {order.customer_name}</div>
                          <div className="text-sm text-gray-700">Endereço: {order.delivery_address}</div>
                          <div className="text-sm text-gray-700">Valor: R$ {order.total_amount.toFixed(2)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DeliveryControl; 
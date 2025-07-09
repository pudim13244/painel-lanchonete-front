import React, { useState, useEffect, useCallback, useRef, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Package, CheckCircle, Truck, Edit3, Eye, Loader2, RefreshCw, Printer, AlertCircle, Plus } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { OrderModal } from "@/components/OrderModal";
import { CreateOrderModal } from "@/components/CreateOrderModal";
import { useToast } from "@/hooks/use-toast";
import { EstablishmentService, Order } from "@/services/establishment";
import { PrintOrder } from "@/components/PrintOrder";
import { VirtualizedOrderList } from "@/components/VirtualizedOrderList";
import { useOrders } from "@/hooks/useOrders";
import notificationSound from '@/assets/notification.mp3';
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";

// Componente otimizado para card de pedido
const OrderCard = React.memo(({ 
  order, 
  onStatusUpdate, 
  onOpenModal, 
  onPrint,
  getStatusColor,
  getStatusText,
  getTypeText,
  getPaymentMethodText,
  formatDateTime
}: {
  order: Order;
  onStatusUpdate: (orderId: number, status: Order['status']) => void;
  onOpenModal: (order: Order) => void;
  onPrint: (orderId: number) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getTypeText: (type: string) => string;
  getPaymentMethodText: (method: string) => string;
  formatDateTime: (dateString: string) => string;
}) => {
  const totalAmount = useMemo(() => 
    (Number(order.total_amount || 0) + Number(order.delivery_fee || 0)).toFixed(2), 
    [order.total_amount, order.delivery_fee]
  );

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onOpenModal(order);
  }, [order, onOpenModal]);

  const handleStatusClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = order.status === 'PENDING' ? 'PREPARING' : 'DELIVERED';
    onStatusUpdate(order.id, newStatus);
  }, [order.status, order.id, onStatusUpdate]);

  const handlePrintClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint(order.id);
  }, [order.id, onPrint]);

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group w-full max-w-full border-l-4 border-l-blue-500"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">#{order.id}</CardTitle>
            <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} font-semibold`}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-gray-900">{order.customer_name || `Cliente #${order.customer_id}`}</p>
          <p className="text-sm text-gray-600">{order.customer_phone || 'Telefone não informado'}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {order.order_type === "DINE_IN" && <Clock className="w-4 h-4 text-blue-600" />}
          {order.order_type === "DELIVERY" && <Truck className="w-4 h-4 text-green-600" />}
          {order.order_type === "PICKUP" && <Package className="w-4 h-4 text-orange-600" />}
          <span className="text-sm font-medium">{getTypeText(order.order_type)}</span>
        </div>
        
        {order.delivery_address && (
          <p className="text-sm text-gray-600 flex items-start gap-1">
            <span className="text-gray-400">📍</span>
            <span className="flex-1">{order.delivery_address}</span>
          </p>
        )}
        
        {order.delivery_person_name && (
          <p className="text-sm text-blue-600 flex items-center gap-1">
            <span>🚗</span>
            <span>{order.delivery_person_name}</span>
          </p>
        )}
        
        <div className="text-sm text-gray-600">
          <p className="font-medium">Pagamento: {getPaymentMethodText(order.payment_method)}</p>
          {order.payment_status === 'PAID' && (
            <p className="text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Pago
            </p>
          )}
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-900">Total:</span>
            <span className="font-bold text-green-600 text-lg">R$ {totalAmount}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={order.status === 'PENDING' ? "default" : "outline"}
              onClick={handleStatusClick}
              className={`flex-1 font-semibold ${
                order.status === 'PENDING' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'hover:bg-green-50'
              }`}
            >
              {order.status === 'PENDING' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aceitar
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Finalizar
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handlePrintClick}
              className="flex-1 hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-1" />
              Imprimir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OrderCard.displayName = 'OrderCard';

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<string>("DELIVERY");
  const [printData, setPrintData] = useState(null);
  const [isPending, startTransition] = useTransition();
  
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Usar o hook personalizado para gerenciar pedidos
  const {
    orders,
    isLoading,
    isRefreshing,
    error,
    loadOrders,
    updateOrderStatus,
    updateOrder,
    refresh,
    addOrder,
    getOrdersByTypeAndStatus,
    getOrderCounts
  } = useOrders({
    autoRefresh: true,
    refreshInterval: 30000,
    initialStatus: 'all'
  });

  // Configurações otimizadas
  const orderTypeTabs = useMemo(() => [
    { value: "DELIVERY", label: "Entrega" },
    { value: "DINE_IN", label: "Consumo Local" },
    { value: "PICKUP", label: "Retirada" },
  ], []);

  // Filtrar pedidos pelo tipo selecionado e remover os entregues
  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.order_type === orderType && order.status !== 'DELIVERED');
  }, [orders, orderType]);

  // Funções utilitárias (getStatusText, getTypeText, etc.)
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PREPARING": return "bg-blue-100 text-blue-800 border-blue-200";
      case "READY": return "bg-green-100 text-green-800 border-green-200";
      case "DELIVERING": return "bg-orange-100 text-orange-800 border-orange-200";
      case "DELIVERED": return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case "PENDING": return "Pendente";
      case "PREPARING": return "Preparando";
      case "READY": return "Pronto";
      case "DELIVERING": return "Em Entrega";
      case "DELIVERED": return "Entregue";
      case "CANCELLED": return "Cancelado";
      default: return status;
    }
  }, []);

  const getTypeText = useCallback((type: string) => {
    switch (type) {
      case "DINE_IN": return "Consumo Local";
      case "DELIVERY": return "Entrega";
      case "PICKUP": return "Retirada";
      default: return type;
    }
  }, []);

  const getPaymentMethodText = useCallback((method: string) => {
    switch (method) {
      case "CASH": return "Dinheiro";
      case "CREDIT": return "Cartão Crédito";
      case "DEBIT": return "Cartão Débito";
      case "PIX": return "PIX";
      default: return method;
    }
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Efeitos otimizados
  useEffect(() => {
    if (!audioRef.current) return;
    
    const hasPendingOrders = orders.some(order => order.status === 'PENDING');
    
    if (hasPendingOrders) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {
        // Ignora erros de autoplay
      });
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [orders]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_ORDER" || data.type === "ORDER_UPDATE") {
        startTransition(() => {
          loadOrders(orderType);
        });
      }
    };

    ws.onerror = (error) => {
      console.warn('WebSocket error:', error);
    };

    return () => ws.close();
  }, [orderType, loadOrders]);

  // Adicionar useEffect para recarregar pedidos sempre que orderType mudar
  useEffect(() => {
    loadOrders(orderType);
  }, [orderType, loadOrders]);

  // Loading state otimizado
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header otimizado */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Gestão de Pedidos</h1>
            <p className="text-gray-600">Acompanhe todos os pedidos em tempo real</p>
          </div>
          <div className="flex items-center gap-3">
            {isPending && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Atualizando...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Erro de conexão</span>
              </div>
            )}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Pedido
            </Button>
            <Button
              onClick={refresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Abas de tipo de pedido */}
        <div className="mb-4">
          <Tabs
            value={orderType}
            onValueChange={(type) => {
              setOrderType(type);
              loadOrders(type);
            }}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3">
              {orderTypeTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="w-full">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Lista de pedidos em formato de tabela */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço/Mesa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    Nenhum pedido encontrado para este tipo.
                  </TableCell>
                </TableRow>
              )}
              {filteredOrders.map(order => (
                <TableRow key={order.id} className="hover:bg-gray-50 cursor-pointer">
                  <TableCell className="font-bold">#{order.id}</TableCell>
                  <TableCell>{order.customer_name || `Cliente #${order.customer_id}`}</TableCell>
                  <TableCell>{order.customer_phone || '-'}</TableCell>
                  <TableCell>{order.delivery_address || '-'}</TableCell>
                  <TableCell>{getTypeText(order.order_type)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-green-700">
                    R$ {(Number(order.total_amount || 0) + Number(order.delivery_fee || 0)).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, order.status === 'PENDING' ? 'PREPARING' : 'DELIVERED')}>
                        {order.status === 'PENDING' ? 'Aceitar' : 'Finalizar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de detalhes do pedido */}
      <OrderModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={updateOrderStatus}
        onOrderUpdate={updateOrder}
      />

      {/* Modal de criação de pedido */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={(newOrder) => {
          toast({
            title: "Pedido criado",
            description: `Pedido #${newOrder.id} criado com sucesso!`,
          });
          refresh();
          setIsCreateModalOpen(false);
        }}
        establishmentId={user?.id}
      />

      {printData && (
        <div id="print-cupom" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <PrintOrder order={printData} />
        </div>
      )}

      <audio ref={audioRef} src={notificationSound} />
    </div>
  );
};

export default Orders;

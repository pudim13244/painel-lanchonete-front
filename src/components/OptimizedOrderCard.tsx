import React, { useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, CheckCircle, Truck, Printer, MapPin, Utensils } from "lucide-react";
import { Order } from "@/services/establishment";

interface OptimizedOrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: number, status: Order['status']) => void;
  onOpenModal: (order: Order) => void;
  onPrint: (orderId: number) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getTypeText: (type: string) => string;
  getPaymentMethodText: (method: string) => string;
  formatDateTime: (dateString: string) => string;
}

export const OptimizedOrderCard = React.memo<OptimizedOrderCardProps>(({ 
  order, 
  onStatusUpdate, 
  onOpenModal, 
  onPrint,
  getStatusColor,
  getStatusText,
  getTypeText,
  getPaymentMethodText,
  formatDateTime
}) => {
  // Memoizar cálculos custosos
  const totalAmount = useMemo(() => 
    (Number(order.total_amount || 0) + Number(order.delivery_fee || 0)).toFixed(2), 
    [order.total_amount, order.delivery_fee]
  );

  const formattedDateTime = useMemo(() => 
    formatDateTime(order.created_at), 
    [order.created_at, formatDateTime]
  );

  const statusColor = useMemo(() => 
    getStatusColor(order.status), 
    [order.status, getStatusColor]
  );

  const statusText = useMemo(() => 
    getStatusText(order.status), 
    [order.status, getStatusText]
  );

  const typeText = useMemo(() => 
    getTypeText(order.order_type), 
    [order.order_type, getTypeText]
  );

  const paymentText = useMemo(() => 
    getPaymentMethodText(order.payment_method), 
    [order.payment_method, getPaymentMethodText]
  );

  // Callbacks otimizados
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

  // Renderizar ícone baseado no tipo de pedido
  const renderTypeIcon = () => {
    switch (order.order_type) {
      case "DINE_IN":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "DELIVERY":
        return <Truck className="w-4 h-4 text-green-600" />;
      case "PICKUP":
        return <Package className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group w-full max-w-full border-l-4 border-l-blue-500 hover:border-l-blue-600"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">#{order.id}</CardTitle>
            <p className="text-sm text-gray-500">{formattedDateTime}</p>
          </div>
          <Badge className={`${statusColor} font-semibold`}>
            {statusText}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-gray-900 truncate">
            {order.customer_name || `Cliente #${order.customer_id}`}
          </p>
          <p className="text-sm text-gray-600">
            {order.customer_phone || 'Telefone não informado'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {renderTypeIcon()}
          <span className="text-sm font-medium">{typeText}</span>
        </div>
        
        {/* Endereço/Informações */}
        {order.order_type === "DELIVERY" && order.delivery_address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{order.delivery_address}</span>
          </div>
        )}
        
        {order.order_type === "DINE_IN" && order.delivery_address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Utensils className="w-4 h-4" />
            <span>Mesa: {order.delivery_address}</span>
          </div>
        )}
        
        {order.order_type === "PICKUP" && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <span>Retirada no local</span>
          </div>
        )}
        
        {order.delivery_person_name && (
          <p className="text-sm text-blue-600 flex items-center gap-1">
            <span>🚗</span>
            <span className="truncate">{order.delivery_person_name}</span>
          </p>
        )}
        
        <div className="text-sm text-gray-600">
          <p className="font-medium">Pagamento: {paymentText}</p>
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
              className={`flex-1 font-semibold transition-colors ${
                order.status === 'PENDING' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'hover:bg-green-50 hover:text-green-700'
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
              className="flex-1 hover:bg-gray-50 transition-colors"
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

OptimizedOrderCard.displayName = 'OptimizedOrderCard'; 
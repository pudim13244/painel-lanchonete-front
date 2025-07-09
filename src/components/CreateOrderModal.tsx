import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { useModal } from '../hooks/useModal';
import { AddressSelector } from './AddressSelector';
import { UserWithAddresses } from '../services/userAddresses';
import { EstablishmentService } from '../services/establishment';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (order: any) => void;
  establishmentId?: number;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
  establishmentId
}) => {
  const [orderType, setOrderType] = useState<'DELIVERY' | 'DINE_IN' | 'PICKUP'>('DELIVERY');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT' | 'DEBIT' | 'PIX'>('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithAddresses | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const modal = useModal({ delay: 300, onClose });

  // Sincronizar com o estado externo
  useEffect(() => {
    if (isOpen) {
      modal.open();
    } else {
      modal.close();
    }
  }, [isOpen, modal]);

  // Resetar formulário quando fechar
  useEffect(() => {
    if (!modal.isOpen) {
      setOrderType('DELIVERY');
      setCustomerPhone('');
      setCustomerName('');
      setDeliveryAddress('');
      setNotes('');
      setPaymentMethod('CASH');
      setAmountPaid('');
      setSelectedUser(null);
    }
  }, [modal.isOpen]);

  // Handler para seleção de endereço
  const handleAddressSelect = (address: string, userId?: number) => {
    setDeliveryAddress(address);
  };

  // Handler para seleção de usuário
  const handleUserSelect = (user: UserWithAddresses) => {
    setSelectedUser(user);
    setCustomerName(user.name);
    setCustomerPhone(user.phone);
  };

  // Handler para mudança de tipo de pedido
  const handleOrderTypeChange = (type: 'DELIVERY' | 'DINE_IN' | 'PICKUP') => {
    setOrderType(type);
    
    // Limpar endereço se não for entrega
    if (type !== 'DELIVERY') {
      setDeliveryAddress('');
    }
  };

  // Validar formulário
  const validateForm = () => {
    if (!customerPhone.trim()) {
      toast({
        title: "Erro",
        description: "Telefone é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!customerName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      toast({
        title: "Erro",
        description: "Endereço é obrigatório para pedidos de entrega",
        variant: "destructive"
      });
      return false;
    }

    if (orderType === 'DINE_IN' && !deliveryAddress.trim()) {
      toast({
        title: "Erro",
        description: "Número da mesa é obrigatório para consumo local",
        variant: "destructive"
      });
      return false;
    }

    if (paymentMethod === 'CASH' && !amountPaid.trim()) {
      toast({
        title: "Erro",
        description: "Valor pago é obrigatório para pagamento em dinheiro",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // Criar pedido
  const handleCreateOrder = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      const orderData = {
        establishment_id: establishmentId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_id: selectedUser?.id,
        order_type: orderType,
        delivery_address: deliveryAddress,
        notes: notes,
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'CASH' ? Number(amountPaid) : null,
        items: [] // Será preenchido na próxima etapa
      };

      const newOrder = await EstablishmentService.createOrder(orderData);
      
      toast({
        title: "Pedido criado",
        description: "Pedido criado com sucesso! Agora adicione os itens.",
      });

      if (onOrderCreated) {
        onOrderCreated(newOrder);
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pedido",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getOrderTypeText = (type: string) => {
    switch (type) {
      case 'DELIVERY': return 'Entrega';
      case 'DINE_IN': return 'Consumo Local';
      case 'PICKUP': return 'Retirada';
      default: return type;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'CASH': return 'Dinheiro';
      case 'CREDIT': return 'Cartão Crédito';
      case 'DEBIT': return 'Cartão Débito';
      case 'PIX': return 'PIX';
      default: return method;
    }
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de Pedido */}
          <div className="space-y-3">
            <Label>Tipo de Pedido</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['DELIVERY', 'DINE_IN', 'PICKUP'] as const).map((type) => (
                <Button
                  key={type}
                  variant={orderType === type ? "default" : "outline"}
                  onClick={() => handleOrderTypeChange(type)}
                  className="h-12"
                >
                  {getOrderTypeText(type)}
                </Button>
              ))}
            </div>
          </div>

          {/* Dados do Cliente */}
          {orderType === 'DELIVERY' ? (
            <AddressSelector
              onAddressSelect={handleAddressSelect}
              onUserSelect={handleUserSelect}
              selectedAddress={deliveryAddress}
            />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefone *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  placeholder="Nome completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Endereço/Mesa (para DINE_IN) */}
          {orderType === 'DINE_IN' && (
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Número da Mesa *</Label>
              <Input
                id="tableNumber"
                placeholder="Ex: Mesa 1, Mesa 2..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          )}

          {/* Endereço (para PICKUP) */}
          {orderType === 'PICKUP' && (
            <div className="space-y-2">
              <Label htmlFor="pickupInfo">Informações para Retirada</Label>
              <Input
                id="pickupInfo"
                placeholder="Ex: Nome para retirada, horário preferido..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          )}

          {/* Método de Pagamento */}
          <div className="space-y-3">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['CASH', 'CREDIT', 'DEBIT', 'PIX'] as const).map((method) => (
                <Button
                  key={method}
                  variant={paymentMethod === method ? "default" : "outline"}
                  onClick={() => setPaymentMethod(method)}
                  className="h-10"
                >
                  {getPaymentMethodText(method)}
                </Button>
              ))}
            </div>
            
            {paymentMethod === 'CASH' && (
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Valor Pago *</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o pedido..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Separator />

          {/* Resumo */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-medium">Resumo do Pedido</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Tipo:</span> {getOrderTypeText(orderType)}</p>
              <p><span className="font-medium">Cliente:</span> {customerName || 'Não informado'}</p>
              <p><span className="font-medium">Telefone:</span> {customerPhone || 'Não informado'}</p>
              {deliveryAddress && (
                <p><span className="font-medium">
                  {orderType === 'DINE_IN' ? 'Mesa:' : orderType === 'PICKUP' ? 'Info:' : 'Endereço:'}
                </span> {deliveryAddress}</p>
              )}
              <p><span className="font-medium">Pagamento:</span> {getPaymentMethodText(paymentMethod)}</p>
              {paymentMethod === 'CASH' && amountPaid && (
                <p><span className="font-medium">Valor Pago:</span> R$ {Number(amountPaid).toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isCreating}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateOrder}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? 'Criando...' : 'Criar Pedido'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
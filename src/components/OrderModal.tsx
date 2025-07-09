import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Package, Truck, User, Phone, MapPin, FileText, Loader2, ChevronDown, Check, Edit3, Plus, Minus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModal } from "@/hooks/useModal";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Order } from "@/services/establishment";
import { EstablishmentService } from "@/services/establishment";
import { ProductDetailsModal } from "./ProductDetailsModal";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (orderId: number, status: Order['status']) => Promise<void>;
  onOrderUpdate?: (orderId: number, updatedOrder: any) => Promise<void>;
}

// Componente de select customizado para evitar problemas de DOM
const CustomSelect = ({ 
  value, 
  onValueChange, 
  disabled,
  options 
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  options: { value: string; label: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const { handleError } = useErrorHandler({ context: 'CustomSelect' });

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      } catch (error) {
        handleError(error as Error, 'handleClickOutside');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleError]);

  const selectedOption = options.find(option => option.value === value);

  const handleOptionClick = useCallback((optionValue: string) => {
    try {
      onValueChange(optionValue);
      setIsOpen(false);
    } catch (error) {
      handleError(error as Error, 'handleOptionClick');
    }
  }, [onValueChange, handleError]);

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedOption ? "" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : "Selecione um status"}
        </span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {value === option.value && <Check className="h-4 w-4" />}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const OrderModal = ({ order, isOpen, onClose, onStatusUpdate, onOrderUpdate }: OrderModalProps) => {
  const [status, setStatus] = useState<Order['status']>(order?.status || "PENDING");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Campos editáveis
  const [paymentMethod, setPaymentMethod] = useState(order?.payment_method || "CASH");
  const [amountPaid, setAmountPaid] = useState(order?.amount_paid?.toString() || "");
  const [deliveryAddress, setDeliveryAddress] = useState(order?.delivery_address || "");
  const [editedItems, setEditedItems] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { handleError, wrapAsync } = useErrorHandler({ context: 'OrderModal' });
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  // Opções do select de status
  const statusOptions = [
    { value: "PENDING", label: "Pendente" },
    { value: "PREPARING", label: "Preparando" },
    { value: "READY", label: "Pronto" },
    { value: "DELIVERING", label: "Em Entrega" },
    { value: "DELIVERED", label: "Entregue" },
    { value: "CANCELLED", label: "Cancelado" }
  ];

  // Opções de método de pagamento
  const paymentOptions = [
    { value: "CASH", label: "Dinheiro" },
    { value: "CREDIT", label: "Cartão Crédito" },
    { value: "DEBIT", label: "Cartão Débito" },
    { value: "PIX", label: "PIX" }
  ];

  // Usar o hook personalizado para gerenciar o modal
  const modal = useModal({
    delay: 300,
    onClose: () => {
      // Resetar estado quando o modal fechar
      setStatus(order?.status || "PENDING");
      setNotes("");
      setIsUpdating(false);
      setHasError(false);
      setIsEditing(false);
      setPaymentMethod(order?.payment_method || "CASH");
      setAmountPaid(order?.amount_paid?.toString() || "");
      setDeliveryAddress(order?.delivery_address || "");
      setEditedItems([]);
    }
  });

  // Sincronizar com o estado externo
  useEffect(() => {
    try {
      if (isOpen) {
        modal.open();
      } else {
        modal.close();
      }
    } catch (error) {
      handleError(error as Error, 'modal sync');
    }
  }, [isOpen, modal, handleError]);

  // Atualizar status quando o pedido mudar
  useEffect(() => {
    try {
      if (order) {
        setStatus(order.status);
        setPaymentMethod(order.payment_method || "CASH");
        setAmountPaid(order.amount_paid?.toString() || "");
        setDeliveryAddress(order.delivery_address || "");
        setNotes(order.notes || '');
        setEditedItems(order.items || []);
        setHasError(false);
      }
    } catch (error) {
      handleError(error as Error, 'status update');
    }
  }, [order, handleError]);

  // Definir todos os callbacks ANTES de qualquer retorno condicional
  const handleStatusChange = useCallback((value: string) => {
    try {
      setStatus(value as Order['status']);
    } catch (error) {
      handleError(error as Error, 'status change');
    }
  }, [handleError]);

  const handlePaymentMethodChange = useCallback((value: string) => {
    try {
      setPaymentMethod(value as any);
    } catch (error) {
      handleError(error as Error, 'payment method change');
    }
  }, [handleError]);

  const handleItemQuantityChange = useCallback((index: number, newQuantity: number) => {
    try {
      if (newQuantity < 1) return;
      setEditedItems(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      handleError(error as Error, 'item quantity change');
    }
  }, [handleError]);

  const handleItemRemove = useCallback((index: number) => {
    try {
      setEditedItems(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      handleError(error as Error, 'item remove');
    }
  }, [handleError]);

  const handleSave = wrapAsync(async () => {
    if (!onStatusUpdate) {
      toast({
        title: "Funcionalidade não disponível",
        description: "Atualização de status não está configurada.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    console.log('Tentando atualizar pedido:', { 
      orderId: order?.id, 
      status, 
      paymentMethod, 
      amountPaid, 
      deliveryAddress,
      editedItems 
    });
    
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    try {
      // Primeiro atualizar o status do pedido
      await onStatusUpdate(order.id, status);
      
      // Se houver outras alterações (endereço, itens, etc.), atualizar via API separada
      const hasOtherChanges = 
        deliveryAddress !== (order.delivery_address || '') ||
        notes !== (order.notes || '') ||
        JSON.stringify(editedItems) !== JSON.stringify(order.items);

      if (hasOtherChanges) {
        // Calcular novo total
        const newSubtotal = editedItems.reduce((acc, item) => {
          const itemBase = Number(item.price || 0) * (item.quantity || 0);
          const additionsTotal = item.additions?.reduce((sum: number, add: any) => {
            return sum + (Number(add.price || 0) * (add.quantity || 1));
          }, 0) || 0;
          return acc + itemBase + additionsTotal;
        }, 0);

        const newTotal = newSubtotal + Number(order.delivery_fee || 0);

        // Atualizar pedido completo via API
        await EstablishmentService.updateOrder(order.id, {
          payment_method: paymentMethod,
          amount_paid: paymentMethod === 'CASH' ? Number(amountPaid) || 0 : null,
          delivery_address: deliveryAddress,
          notes: notes,
          items: editedItems,
          total_amount: newTotal
        });
      }
      
      toast({
        title: "Pedido atualizado",
        description: "O pedido foi atualizado com sucesso.",
      });
      
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar pedido:', error);
      
      const errorMessage = error.response?.data?.message || error.message || "Ocorreu um erro ao atualizar o pedido.";
      
      toast({
        title: "Erro ao atualizar pedido",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  });

  const formatDateTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      handleError(error as Error, 'formatDateTime');
      return 'Data inválida';
    }
  }, [handleError]);

  const getPaymentMethodText = useCallback((method: string) => {
    switch (method) {
      case "CASH": return "Dinheiro";
      case "CREDIT": return "Cartão Crédito";
      case "DEBIT": return "Cartão Débito";
      case "PIX": return "PIX";
      default: return method;
    }
  }, []);

  // Funções auxiliares
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PREPARING": return "bg-blue-100 text-blue-800";
      case "READY": return "bg-green-100 text-green-800";
      case "DELIVERING": return "bg-orange-100 text-orange-800";
      case "DELIVERED": return "bg-gray-100 text-gray-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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

  const [isProductModalOpen, setIsProductOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductLoading, setIsProductLoading] = useState(false);

  // Buscar produtos ao abrir modal de edição
  useEffect(() => {
    if (isEditing && products.length === 0 && order?.establishment_id) {
      setIsProductLoading(true);
      api.get(`/products?establishment_id=${order.establishment_id}`)
        .then(res => setProducts(res.data.products || []))
        .catch(() => setProducts([]))
        .finally(() => setIsProductLoading(false));
    }
  }, [isEditing, order?.establishment_id, products.length]);

  const handleOpenProductModal = () => {
    if (products.length > 0) {
      setSelectedProduct(products[0]);
      setIsProductOpen(true);
    } else {
      setIsProductLoading(true);
      api.get(`/products?establishment_id=${order.establishment_id}`)
        .then(res => {
          setProducts(res.data.products || []);
          if (res.data.products && res.data.products.length > 0) {
            setSelectedProduct(res.data.products[0]);
            setIsProductOpen(true);
          }
        })
        .catch(() => setProducts([]))
        .finally(() => setIsProductLoading(false));
    }
  };

  // Handler para adicionar item do modal de produto
  const handleAddProductToOrder = (product, selectedOptions, obs) => {
    const price = Number(product.price) || 0;
    const additions = selectedOptions.map(opt => ({
      id: opt.id,
      name: opt.name,
      price: opt.price,
      quantity: opt.quantity || 1,
      acrescimo_id: opt.id
    }));
    setEditedItems(prev => [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        price,
        quantity: 1,
        obs,
        additions
      }
    ]);
    setIsProductOpen(false);
    setSelectedProduct(null);
  };

  // Verificação de segurança para evitar erros de renderização
  if (!order || !modal.isMounted) return null;

  // Verificar se o pedido tem os campos básicos necessários
  if (!order.id || !order.status) {
    console.warn('Pedido sem campos obrigatórios:', order);
    return null;
  }

  // Garantir que os campos numéricos sejam números (permitir 0)
  const safeTotalAmount = Number(order.total_amount || 0);
  const safeDeliveryFee = Number(order.delivery_fee || 0);

  // Calcular total dos itens editados
  const subtotal = editedItems.reduce((acc, item) => {
    const itemBase = Number(item.price || 0) * (item.quantity || 0);
    const additionsTotal = item.additions?.reduce((sum: number, add: any) => {
      return sum + (Number(add.price || 0) * (add.quantity || 1));
    }, 0) || 0;
    return acc + itemBase + additionsTotal;
  }, 0);

  const total = subtotal + safeDeliveryFee;
  const currentAmountPaid = Number(amountPaid) || 0;

  // Verificar se o endereço foi alterado
  const addressChanged = deliveryAddress !== (order?.delivery_address || '');

  // Se houve erro, mostrar mensagem simples
  if (hasError) {
    return (
      <Dialog open={modal.isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Erro ao carregar pedido</DialogTitle>
            <DialogDescription>
              Ocorreu um erro ao carregar os detalhes do pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  try {
    return (
      <Dialog open={modal.isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Pedido #{order.id}</span>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? 'Visualizar' : 'Editar'}
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Editar detalhes do pedido' : 'Detalhes do pedido e informações do cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{order.customer_name || `Cliente #${order.customer_id}`}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{order.customer_phone || 'Telefone não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {order.order_type === "DINE_IN" && <Clock className="w-4 h-4 text-gray-500" />}
                  {order.order_type === "DELIVERY" && <Truck className="w-4 h-4 text-gray-500" />}
                  {order.order_type === "PICKUP" && <Package className="w-4 h-4 text-gray-500" />}
                  {order.order_type === "DINE_IN" ? (
                    <span>MESA: {order.delivery_address}</span>
                  ) : (
                    <span>{getTypeText(order.order_type)}</span>
                  )}
                </div>
                
                {/* Endereço editável */}
                {isEditing ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Endereço/Informações</label>
                    <Input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Endereço, mesa, ou observações"
                      disabled={isUpdating}
                    />
                  </div>
                ) : (
                  order.delivery_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm">{order.delivery_address}</span>
                    </div>
                  )
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Horário do Pedido</p>
                  <p className="font-medium">{formatDateTime(order.created_at)}</p>
                </div>
                
                {/* Método de pagamento editável */}
                <div>
                  <p className="text-sm text-gray-500">Forma de Pagamento</p>
                  {isEditing ? (
                    <div className="space-y-2">
                      <CustomSelect 
                        value={paymentMethod} 
                        onValueChange={handlePaymentMethodChange}
                        disabled={isUpdating}
                        options={paymentOptions}
                      />
                      {paymentMethod === 'CASH' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Valor Pago</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            placeholder="0.00"
                            disabled={isUpdating}
                          />
                          {currentAmountPaid > total && (
                            <p className="text-sm text-blue-600">Troco: R$ {(currentAmountPaid - total).toFixed(2)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">{getPaymentMethodText(order.payment_method)}</p>
                      {order.payment_method === 'CASH' && order.amount_paid && (
                        <>
                          <p className="text-sm text-gray-600">Valor para Troco: <span className="font-medium">R$ {Number(order.amount_paid).toFixed(2)}</span></p>
                          {Number(order.amount_paid) > total && (
                            <p className="text-sm text-blue-600">Troco a devolver: <span className="font-medium">R$ {(Number(order.amount_paid) - total).toFixed(2)}</span></p>
                          )}
                        </>
                      )}
                      {order.payment_status === 'PAID' && (
                        <p className="text-green-600 text-sm">✓ Pago</p>
                      )}
                    </>
                  )}
                </div>
                
                {order.delivery_person_name && (
                  <div>
                    <p className="text-sm text-gray-500">Entregador</p>
                    <p className="font-medium">{order.delivery_person_name}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Itens do Pedido
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-4"
                    onClick={() => navigate(`/edit-order/${order.id}`)}
                    disabled={isProductLoading}
                  >
                    {isProductLoading ? 'Carregando...' : '+ Adicionar item'}
                  </Button>
                )}
              </h3>
              <div className="space-y-2">
                {editedItems.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex-1">
                        <span className="font-medium">{item.product_name || `Produto #${item.product_id}`}</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleItemQuantityChange(index, (item.quantity || 1) - 1)}
                              disabled={isUpdating || (item.quantity || 1) <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium min-w-[2rem] text-center">{item.quantity || 1}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleItemQuantityChange(index, (item.quantity || 1) + 1)}
                              disabled={isUpdating}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleItemRemove(index)}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-500 ml-2">x{item.quantity || 1}</span>
                        )}
                      </div>
                      <span className="font-medium">R$ {(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                    {item.obs && (
                      <p className="text-sm text-gray-600 italic">Obs: {item.obs}</p>
                    )}
                    {/* Exibir adicionais/acréscimos */}
                    {item.additions && item.additions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.additions.map((addition, addIndex) => (
                          <div key={addIndex} className="flex justify-between items-center text-sm text-gray-600">
                            <span>
                              + {addition.name}
                              {addition.quantity && addition.quantity > 1 && (
                                <> x{addition.quantity}</>
                              )}
                            </span>
                            {addition.price !== undefined && (
                              <span className="ml-2">
                                R$ {(Number(addition.price) * (addition.quantity || 1)).toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Taxa de Entrega:</span>
                  <span>R$ {safeDeliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-green-600 text-lg">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status Update */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Atualizar Status</label>
                <CustomSelect 
                  value={status} 
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                  options={statusOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Observações
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre o pedido..."
                  rows={3}
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1" disabled={isUpdating}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  } catch (error) {
    console.error('Erro ao renderizar OrderModal:', error);
    setHasError(true);
    return null;
  }
};

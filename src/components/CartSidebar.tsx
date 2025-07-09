import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from '@/lib/axios';
import { PrintOrder } from "./PrintOrder";
import { EstablishmentService } from '@/services/establishment';

interface Option {
  id: number;
  name: string;
  price: number;
  description?: string;
  quantity: number;
}

interface AdditionalGroup {
  id: number;
  name: string;
  type: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  options: Option[];
}

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: {
    id: number;
    name: string;
  };
  additional_groups: AdditionalGroup[];
  quantity: number;
  selectedOptions: Option[];
  obs: string;
  establishment_id?: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateItems: (items: CartItem[]) => void;
  orderType: "local" | "delivery" | "pickup";
  initialCustomerInfo?: {
    name: string;
    phone: string;
    address: string;
    notes: string;
    table: string;
  };
  initialPaymentMethod?: 'CASH' | 'CREDIT' | 'DEBIT' | 'PIX';
  initialAmountPaid?: string;
  onSave?: (customerInfo: any, paymentMethod: string, amountPaid: string) => void;
  saving?: boolean;
  editMode?: boolean;
}

export const CartSidebar = ({ isOpen, onClose, items, onUpdateItems, orderType, initialCustomerInfo, initialPaymentMethod, initialAmountPaid, onSave, saving, editMode }: CartSidebarProps) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: initialCustomerInfo?.name || "",
    phone: initialCustomerInfo?.phone || "",
    address: initialCustomerInfo?.address || "",
    notes: initialCustomerInfo?.notes || "",
    table: initialCustomerInfo?.table || ""
  });
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<typeof initialPaymentMethod>(initialPaymentMethod || 'CASH');
  const [amountPaid, setAmountPaid] = useState<typeof initialAmountPaid>(initialAmountPaid || "");
  const { toast } = useToast();
  const { user } = useAuth();
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<string[]>(['CASH', 'PIX', 'CREDIT', 'DEBIT']);

  // Atualizar dados quando props iniciais mudarem
  useEffect(() => {
    if (initialCustomerInfo) {
      setCustomerInfo(initialCustomerInfo);
    }
    if (initialPaymentMethod) {
      setPaymentMethod(initialPaymentMethod);
    }
    if (initialAmountPaid) {
      setAmountPaid(initialAmountPaid);
    }
  }, [initialCustomerInfo, initialPaymentMethod, initialAmountPaid]);

  useEffect(() => {
    const fetchDeliveryFee = async () => {
      if (orderType === "delivery" && items.length > 0 && items[0].establishment_id) {
        try {
          console.log('Establishment ID:', items[0].establishment_id);
          const response = await api.get(`/establishments/${items[0].establishment_id}`);
          console.log('Resposta da API de estabelecimento:', response.data);
          let fee = response.data.establishment?.delivery_fee;
          console.log('Taxa recebida:', fee, typeof fee);
          fee = Number(fee);
          if (!isNaN(fee)) setDeliveryFee(fee);
        } catch (error) {
          console.error('Erro ao buscar taxa de entrega do estabelecimento:', error);
        }
      } else {
        console.log('Condições para buscar taxa de entrega não atendidas:', { orderType, items });
      }
    };
    fetchDeliveryFee();
  }, [orderType, items]);

  useEffect(() => {
    const fetchEstablishmentInfo = async () => {
      try {
        // Se temos items no carrinho, buscar informações do estabelecimento dos produtos
        if (items.length > 0 && items[0].establishment_id) {
          const response = await api.get(`/establishments/${items[0].establishment_id}`);
          const establishment = response.data.establishment;
          
          if (establishment) {
            // Garantir que delivery_fee seja um número
            const fee = Number(establishment.delivery_fee) || 0;
            setDeliveryFee(fee);
            
            // Se o estabelecimento tem perfil com métodos aceitos, usar eles
            if (establishment.accepted_payment_methods) {
              let methods = establishment.accepted_payment_methods;
              if (typeof methods === 'string') {
                try {
                  methods = JSON.parse(methods);
                } catch (e) {
                  methods = ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
                }
              }
              const validMethods = Array.isArray(methods) ? methods : ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
              setAcceptedPaymentMethods(validMethods);
              
              // Se o método de pagamento atual não está aceito, mudar para o primeiro aceito
              if (!validMethods.includes(paymentMethod)) {
                setPaymentMethod(validMethods[0] as 'CASH' | 'CREDIT' | 'DEBIT' | 'PIX' || 'CASH');
              }
            }
          }
        } else {
          // Fallback: buscar perfil do estabelecimento logado
          const profile = await EstablishmentService.getProfile();
          const fee = Number(profile.delivery_fee) || 0;
          setDeliveryFee(fee);
          
          let methods = profile.accepted_payment_methods || ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
          if (typeof methods === 'string') {
            try {
              methods = JSON.parse(methods);
            } catch (e) {
              methods = ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
            }
          }
          const validMethods = Array.isArray(methods) ? methods : ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
          setAcceptedPaymentMethods(validMethods);
          
          // Se o método de pagamento atual não está aceito, mudar para o primeiro aceito
          if (!validMethods.includes(paymentMethod)) {
            setPaymentMethod(validMethods[0] as 'CASH' | 'CREDIT' | 'DEBIT' | 'PIX' || 'CASH');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar informações do estabelecimento:', error);
      }
    };

    if (isOpen && items.length > 0) {
      fetchEstablishmentInfo();
    }
  }, [isOpen, items, paymentMethod]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      onUpdateItems(items.filter(item => item.id !== id));
    } else {
      onUpdateItems(items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    onUpdateItems(items.filter(item => item.id !== id));
  };

  const calculateItemTotal = (item: CartItem) => {
    const optionsTotal = item.selectedOptions.reduce((total, option) => {
      return total + (Number(option.price) * option.quantity);
    }, 0);
    return (Number(item.price) + optionsTotal) * item.quantity;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const total = subtotal + (orderType === "delivery" ? Number(deliveryFee || 0) : 0);

  const handleSubmit = async () => {
    // Se estiver em modo de edição, usar onSave
    if (editMode && onSave) {
      onSave(customerInfo, paymentMethod, amountPaid);
      return;
    }

    // Verificar se o usuário está autenticado como cliente ou estabelecimento
    if (!user || (user.role !== 'CUSTOMER' && user.role !== 'ESTABLISHMENT')) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado como cliente ou estabelecimento para fazer pedidos.",
        variant: "destructive"
      });
      return;
    }

    // Validar informações do cliente
    if (orderType === "delivery" && (!customerInfo.name || !customerInfo.phone || !customerInfo.address)) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (orderType === "local" && !customerInfo.table) {
      toast({
        title: "Erro",
        description: "Por favor, informe o número da mesa.",
        variant: "destructive"
      });
      return;
    }

    if (orderType === "pickup" && (!customerInfo.name || !customerInfo.phone)) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu nome e telefone.",
        variant: "destructive"
      });
      return;
    }

    // Montar payload do pedido
    const establishment_id = items[0]?.establishment_id || (user.role === 'ESTABLISHMENT' ? user.id : null);
    const payload = {
      establishment_id,
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        selected_options: item.selectedOptions,
        obs: item.obs || ''
      })),
      name: customerInfo.name,
      phone: customerInfo.phone,
      address: customerInfo.address,
      orderType,
      payment_method: paymentMethod,
      amount_paid: paymentMethod === 'CASH' ? Number(amountPaid) || 0 : null
    };

    try {
      console.log('CartSidebar: Usuário atual:', user);
      console.log('CartSidebar: Token disponível:', !!localStorage.getItem('auth_token'));
      console.log('CartSidebar: Enviando pedido:', payload);
      console.log('CartSidebar: URL da requisição:', '/orders');
      
      const response = await api.post('/orders', payload);
      console.log('CartSidebar: Resposta do servidor:', response.data);
      
      toast({
        title: 'Sucesso!',
        description: 'Seu pedido foi enviado com sucesso.',
      });
      onUpdateItems([]);
      onClose();
    } catch (error) {
      console.error('CartSidebar: Erro ao enviar pedido:', error);
      console.error('CartSidebar: Detalhes do erro:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      toast({
        title: 'Erro ao enviar pedido',
        description: error.response?.data?.message || 'Não foi possível finalizar o pedido.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrinho ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            R$ {Number(item.price).toFixed(2)}
                          </p>
                          {item.selectedOptions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-600">Adicionais:</p>
                              {item.selectedOptions.map((option) => (
                                <p key={option.id} className="text-sm text-gray-500">
                                  {option.quantity}x {option.name} (R$ {Number(option.price).toFixed(2)})
                                </p>
                              ))}
                            </div>
                          )}
                          {item.obs && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-600">Observações:</p>
                              <p className="text-sm text-gray-500">{item.obs}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-right font-medium text-green-600 mt-2">
                        Total: R$ {calculateItemTotal(item).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-4">
                  {orderType === "delivery" && (
                    <>
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Endereço</Label>
                        <Textarea
                          id="address"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                          placeholder="Endereço completo para entrega"
                        />
                      </div>
                      <div>
                        <Label>Método de Pagamento</Label>
                        <div className="flex flex-col gap-2 mt-2">
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('CASH') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="CASH"
                                checked={paymentMethod === 'CASH'}
                                onChange={() => setPaymentMethod('CASH')}
                              />
                              <span className="text-green-600">💵</span>
                              Dinheiro
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('PIX') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="PIX"
                                checked={paymentMethod === 'PIX'}
                                onChange={() => setPaymentMethod('PIX')}
                              />
                              <span className="text-blue-600">📱</span>
                              PIX
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('CREDIT') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="CREDIT"
                                checked={paymentMethod === 'CREDIT'}
                                onChange={() => setPaymentMethod('CREDIT')}
                              />
                              <span className="text-purple-600">💳</span>
                              Cartão de Crédito
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('DEBIT') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="DEBIT"
                                checked={paymentMethod === 'DEBIT'}
                                onChange={() => setPaymentMethod('DEBIT')}
                              />
                              <span className="text-orange-600">💳</span>
                              Cartão de Débito
                            </label>
                          )}
                        </div>
                        {paymentMethod === 'CASH' && (
                          <div className="mt-2">
                            <Label htmlFor="amountPaid">Valor para troco</Label>
                            <Input
                              id="amountPaid"
                              type="number"
                              min={total}
                              step="0.01"
                              value={amountPaid}
                              onChange={e => setAmountPaid(e.target.value)}
                              placeholder="Ex: 100.00"
                            />
                            <div className="text-sm text-gray-600 mt-1">
                              Troco: R$ {amountPaid && Number(amountPaid) > total ? (Number(amountPaid) - total).toFixed(2) : "0.00"}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {orderType === "local" && (
                    <>
                      <div>
                        <Label htmlFor="table">Número da Mesa</Label>
                        <Input
                          id="table"
                          value={customerInfo.table}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, table: e.target.value })}
                          placeholder="Ex: 10"
                        />
                      </div>
                      <div>
                        <Label>Método de Pagamento</Label>
                        <div className="flex flex-col gap-2 mt-2">
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('CASH') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="CASH"
                                checked={paymentMethod === 'CASH'}
                                onChange={() => setPaymentMethod('CASH')}
                              />
                              <span className="text-green-600">💵</span>
                              Dinheiro
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('PIX') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="PIX"
                                checked={paymentMethod === 'PIX'}
                                onChange={() => setPaymentMethod('PIX')}
                              />
                              <span className="text-blue-600">📱</span>
                              PIX
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('CREDIT') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="CREDIT"
                                checked={paymentMethod === 'CREDIT'}
                                onChange={() => setPaymentMethod('CREDIT')}
                              />
                              <span className="text-purple-600">💳</span>
                              Cartão de Crédito
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('DEBIT') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="DEBIT"
                                checked={paymentMethod === 'DEBIT'}
                                onChange={() => setPaymentMethod('DEBIT')}
                              />
                              <span className="text-orange-600">💳</span>
                              Cartão de Débito
                            </label>
                          )}
                        </div>
                        {paymentMethod === 'CASH' && (
                          <div className="mt-2">
                            <Label htmlFor="amountPaid">Valor para troco</Label>
                            <Input
                              id="amountPaid"
                              type="number"
                              min={total}
                              step="0.01"
                              value={amountPaid}
                              onChange={e => setAmountPaid(e.target.value)}
                              placeholder="Ex: 100.00"
                            />
                            <div className="text-sm text-gray-600 mt-1">
                              Troco: R$ {amountPaid && Number(amountPaid) > total ? (Number(amountPaid) - total).toFixed(2) : "0.00"}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {orderType === "pickup" && (
                    <>
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <Label>Método de Pagamento</Label>
                        <div className="flex flex-col gap-2 mt-2">
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('CASH') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="CASH"
                                checked={paymentMethod === 'CASH'}
                                onChange={() => setPaymentMethod('CASH')}
                              />
                              <span className="text-green-600">💵</span>
                              Dinheiro
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('PIX') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="PIX"
                                checked={paymentMethod === 'PIX'}
                                onChange={() => setPaymentMethod('PIX')}
                              />
                              <span className="text-blue-600">📱</span>
                              PIX
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('CREDIT') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="CREDIT"
                                checked={paymentMethod === 'CREDIT'}
                                onChange={() => setPaymentMethod('CREDIT')}
                              />
                              <span className="text-purple-600">💳</span>
                              Cartão de Crédito
                            </label>
                          )}
                          {Array.isArray(acceptedPaymentMethods) && acceptedPaymentMethods.includes('DEBIT') && (
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment_method"
                                value="DEBIT"
                                checked={paymentMethod === 'DEBIT'}
                                onChange={() => setPaymentMethod('DEBIT')}
                              />
                              <span className="text-orange-600">💳</span>
                              Cartão de Débito
                            </label>
                          )}
                        </div>
                        {paymentMethod === 'CASH' && (
                          <div className="mt-2">
                            <Label htmlFor="amountPaid">Valor para troco</Label>
                            <Input
                              id="amountPaid"
                              type="number"
                              min={total}
                              step="0.01"
                              value={amountPaid}
                              onChange={e => setAmountPaid(e.target.value)}
                              placeholder="Ex: 100.00"
                            />
                            <div className="text-sm text-gray-600 mt-1">
                              Troco: R$ {amountPaid && Number(amountPaid) > total ? (Number(amountPaid) - total).toFixed(2) : "0.00"}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="notes">Observações Gerais</Label>
                    <Textarea
                      id="notes"
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                      placeholder="Alguma observação adicional?"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === "delivery" && (
                    <div className="flex justify-between">
                      <span>Taxa de entrega</span>
                      <span>R$ {Number(deliveryFee || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full" disabled={saving}>
                  {editMode ? (saving ? 'Salvando...' : 'Salvar Alterações') : 'Finalizar Pedido'}
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

// Adicionar CSS global para imprimir apenas o conteúdo do PrintOrder
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * { visibility: hidden !important; }
      #root > div[style*='-9999px'] { visibility: visible !important; position: static !important; }
      #root > div[style*='-9999px'] * { visibility: visible !important; }
    }
  `;
  document.head.appendChild(style);
}

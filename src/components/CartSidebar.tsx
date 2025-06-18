
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateItems: (items: CartItem[]) => void;
  orderType: "local" | "delivery" | "pickup";
}

export const CartSidebar = ({ isOpen, onClose, items, onUpdateItems, orderType }: CartSidebarProps) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    table: ""
  });
  const { toast } = useToast();

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

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === "delivery" ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione itens ao carrinho primeiro." });
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      toast({ title: "Informações obrigatórias", description: "Preencha nome e telefone." });
      return;
    }

    if (orderType === "delivery" && !customerInfo.address) {
      toast({ title: "Endereço obrigatório", description: "Preencha o endereço para entrega." });
      return;
    }

    if (orderType === "local" && !customerInfo.table) {
      toast({ title: "Mesa obrigatória", description: "Informe o número da mesa." });
      return;
    }

    // Simulate order creation
    const orderId = Math.random().toString(36).substr(2, 9);
    toast({
      title: "Pedido realizado!",
      description: `Pedido #${orderId} foi criado com sucesso.`,
    });

    // Clear cart and close
    onUpdateItems([]);
    setCustomerInfo({ name: "", phone: "", address: "", notes: "", table: "" });
    onClose();
  };

  return (
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
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-green-600 font-semibold">R$ {item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0 ml-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                {orderType === "delivery" && (
                  <div>
                    <Label htmlFor="address">Endereço *</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="Rua, número, bairro, cidade"
                      rows={3}
                    />
                  </div>
                )}

                {orderType === "local" && (
                  <div>
                    <Label htmlFor="table">Número da Mesa *</Label>
                    <Input
                      id="table"
                      value={customerInfo.table}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, table: e.target.value })}
                      placeholder="Ex: 5"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Observações sobre o pedido"
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Taxa de entrega:</span>
                    <span>R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700 text-white"
                size="lg"
              >
                Finalizar Pedido
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

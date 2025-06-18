import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Package, Truck, User, Phone, MapPin, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer: string;
  phone: string;
  type: "local" | "delivery" | "pickup";
  status: "pending" | "preparing" | "ready" | "delivering" | "completed";
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  createdAt: string;
  table?: string;
  address?: string;
  deliveryPerson?: string;
}

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderModal = ({ order, isOpen, onClose }: OrderModalProps) => {
  const [status, setStatus] = useState<"pending" | "preparing" | "ready" | "delivering" | "completed">(order?.status || "pending");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  if (!order) return null;

  const handleStatusChange = (value: string) => {
    setStatus(value as "pending" | "preparing" | "ready" | "delivering" | "completed");
  };

  const handleSave = () => {
    toast({
      title: "Pedido atualizado!",
      description: `Status do pedido #${order.id} foi alterado para ${getStatusText(status)}.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido #{order.id}</span>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{order.customer}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{order.phone}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {order.type === "local" && <Clock className="w-4 h-4 text-gray-500" />}
                {order.type === "delivery" && <Truck className="w-4 h-4 text-gray-500" />}
                {order.type === "pickup" && <Package className="w-4 h-4 text-gray-500" />}
                <span>{getTypeText(order.type)}</span>
                {order.table && <span>- Mesa {order.table}</span>}
              </div>
              
              {order.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-sm">{order.address}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Horário do Pedido</p>
                <p className="font-medium">{order.createdAt}</p>
              </div>
              
              {order.deliveryPerson && (
                <div>
                  <p className="text-sm text-gray-500">Entregador</p>
                  <p className="font-medium">{order.deliveryPerson}</p>
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
            </h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-green-600 text-lg">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Status Update */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Atualizar Status</label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="delivering">Em Entrega</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
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
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  function getStatusColor(status: string) {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "preparing": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivering": return "bg-orange-100 text-orange-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case "pending": return "Pendente";
      case "preparing": return "Preparando";
      case "ready": return "Pronto";
      case "delivering": return "Em Entrega";
      case "completed": return "Concluído";
      default: return status;
    }
  }

  function getTypeText(type: string) {
    switch (type) {
      case "local": return "Consumo Local";
      case "delivery": return "Entrega";
      case "pickup": return "Retirada";
      default: return type;
    }
  }
};

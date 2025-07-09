import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    additional_groups: AdditionalGroup[];
    category: {
      id: number;
      name: string;
    };
  };
  onAddToCart: (product: any, selectedOptions: Option[], obs: string) => void;
}

export const ProductDetailsModal = ({ isOpen, onClose, product, onAddToCart }: ProductDetailsModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [obs, setObs] = useState("");
  const [total, setTotal] = useState(product.price);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedOptions([]);
      setObs("");
      setTotal(product.price);
    }
  }, [isOpen, product]);

  useEffect(() => {
    const optionsTotal = selectedOptions.reduce((sum, option) => {
      const price = Number(option.price) || 0;
      const quantity = Number(option.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    const newTotal = Number(product.price) + optionsTotal;
    setTotal(newTotal);
  }, [selectedOptions, product.price]);

  const handleQuantityChange = (groupId: number, optionData: Option, increment: boolean) => {
    const group = product.additional_groups.find(g => g.id === groupId);
    if (!group) return;

    setSelectedOptions(currentOpts => {
      const existingOptionIndex = currentOpts.findIndex(o => o.id === optionData.id);
      const existingOption = currentOpts[existingOptionIndex];

      const currentGroupSelections = currentOpts
        .filter(opt => group.options.some(groupOpt => groupOpt.id === opt.id))
        .reduce((total, opt) => total + opt.quantity, 0);

      if (increment) {
        if (currentGroupSelections >= group.max_selections) {
          toast({
            title: "Limite atingido",
            description: `Você pode selecionar no máximo ${group.max_selections} opções deste grupo.`,
            variant: "destructive"
          });
          return currentOpts;
        }

        if (existingOption) {
          const newOpts = [...currentOpts];
          newOpts[existingOptionIndex] = {
            ...existingOption,
            quantity: existingOption.quantity + 1,
          };
          return newOpts;
        } else {
          return [...currentOpts, { ...optionData, quantity: 1 }];
        }
      } else { // Decrement
        if (!existingOption) return currentOpts;

        const newQuantity = existingOption.quantity - 1;

        if (newQuantity > 0) {
          const newOpts = [...currentOpts];
          newOpts[existingOptionIndex] = {
            ...existingOption,
            quantity: newQuantity,
          };
          return newOpts;
        } else {
          return currentOpts.filter(o => o.id !== optionData.id);
        }
      }
    });
  };

  const validateSelections = () => {
    for (const group of product.additional_groups) {
      const groupSelections = selectedOptions.filter(opt => 
        group.options.some(groupOpt => groupOpt.id === opt.id)
      ).reduce((total, opt) => total + opt.quantity, 0);

      if (group.is_required && groupSelections < group.min_selections) {
        toast({
          title: "Seleção obrigatória",
          description: `Você precisa selecionar pelo menos ${group.min_selections} opções do grupo ${group.name}.`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelections()) return;
    onAddToCart(product, selectedOptions, obs);
    onClose();
    setSelectedOptions([]);
    setObs("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-gray-500">
            Personalize seu pedido com os adicionais disponíveis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagem e Descrição */}
          <div className="flex flex-col md:flex-row gap-4">
            {(!!product.image_url && product.image_url.trim() !== "" && product.image_url !== "null" && product.image_url !== "undefined") && (() => {
              const API_URL = "https://painelquick.vmagenciadigital.com";
              const imageUrl = product.image_url?.startsWith('/uploads')
                ? API_URL + '/painelquick' + product.image_url
                : product.image_url;
              return (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full md:w-1/2 h-48 object-cover rounded-lg"
                />
              );
            })()}
            <div className="flex-1">
              <p className="text-gray-600">{product.description}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xl font-bold text-green-600">
                  R$ {Number(product.price).toFixed(2)}
                </p>
                {product.category && (
                  <Badge variant="outline">{product.category.name}</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Grupos de Adicionais */}
          <Accordion type="multiple" className="w-full">
            {product.additional_groups.map(group => (
              <AccordionItem value={`item-${group.id}`} key={group.id}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4">
                    <h3 className="font-bold">{group.name}</h3>
                    <div className="text-sm text-gray-500">
                      {group.is_required ? 'Obrigatório' : 'Opcional'} •{' '}
                      {group.min_selections}-{group.max_selections} seleções
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {group.options.map(option => {
                      const selectedOption = selectedOptions.find(opt => opt.id === option.id);
                      const quantity = selectedOption?.quantity || 0;

                      return (
                        <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{option.name}</p>
                            {option.description && (
                              <p className="text-sm text-gray-500">{option.description}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              + R$ {Number(option.price || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(group.id, option, false)}
                              disabled={quantity === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(group.id, option, true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Separator />

          {/* Observações */}
          <div>
            <h3 className="font-bold mb-2">Observações</h3>
            <Textarea
              placeholder="Alguma observação para o seu pedido?"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>

          {/* Total e Botão Adicionar */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold text-green-600">
                R$ {total.toFixed(2)}
              </span>
            </div>
            <Button onClick={handleAddToCart} className="w-full">
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
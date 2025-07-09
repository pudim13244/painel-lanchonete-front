import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

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

interface MenuItem {
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
}

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuCard = ({ item, onAddToCart }: MenuCardProps) => {
  const API_URL = "https://painelquick.vmagenciadigital.com";
  const imageUrl = item.image_url?.startsWith('/uploads')
    ? API_URL + '/painelquick' + item.image_url
    : item.image_url;
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        {item.image_url && item.image_url.trim() !== "" ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
        <Badge
          variant="secondary"
          className="absolute top-2 right-2"
        >
          {item.category.name}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <span className="font-bold text-green-600">
          R$ {Number(item.price).toFixed(2)}
        </span>
        <Button
          onClick={() => onAddToCart(item)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};

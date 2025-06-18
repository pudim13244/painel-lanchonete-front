
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuCard = ({ item, onAddToCart }: MenuCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 group">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800">
            {item.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        <div className="text-2xl font-bold text-green-600">
          R$ {item.price.toFixed(2)}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(item)}
          className="w-full bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700 text-white transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Clock } from "lucide-react";
import axios from "axios";

interface Establishment {
  id: number;
  name: string;
  restaurant_name?: string;
  description?: string;
  cuisine_type?: string;
  logo_url?: string;
}

interface EstablishmentSelectorProps {
  onSelect: (establishmentId: number) => void;
  selectedId?: number;
}

export const EstablishmentSelector = ({ onSelect, selectedId }: EstablishmentSelectorProps) => {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/establishments');
        const data = response.data.establishments || response.data;
        setEstablishments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar estabelecimentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishments();
  }, []);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Escolha um Estabelecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Escolha um Estabelecimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {establishments.map((establishment) => (
            <Card
              key={establishment.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedId === establishment.id
                  ? 'ring-2 ring-orange-500 bg-orange-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(establishment.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {establishment.restaurant_name || establishment.name}
                    </h3>
                    {establishment.cuisine_type && (
                      <Badge variant="secondary" className="mt-1">
                        {establishment.cuisine_type}
                      </Badge>
                    )}
                    {establishment.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {establishment.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {establishments.length === 0 && (
          <div className="text-center py-8">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum estabelecimento encontrado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
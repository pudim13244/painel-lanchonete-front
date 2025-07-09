import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { userAddressesService, UserAddress, UserWithAddresses } from '../services/userAddresses';

interface AddressSelectorProps {
  onAddressSelect: (address: string, userId?: number) => void;
  onUserSelect?: (user: UserWithAddresses) => void;
  selectedAddress?: string;
  className?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  onAddressSelect,
  onUserSelect,
  selectedAddress,
  className
}) => {
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState<UserWithAddresses | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const { toast } = useToast();

  // Buscar usuário e endereços por telefone
  const searchUserByPhone = async () => {
    if (!phone.trim()) {
      toast({
        title: "Erro",
        description: "Digite um número de telefone",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await userAddressesService.getByPhone(phone.trim());
      
      if (result.user) {
        setUser(result.user);
        setAddresses(result.addresses);
        setShowAddresses(true);
        
        // Se houver endereço padrão, selecionar automaticamente
        const defaultAddress = result.addresses.find(addr => addr.is_default);
        if (defaultAddress) {
          onAddressSelect(defaultAddress.address, result.user.id);
        }
        
        // Notificar sobre o usuário encontrado
        if (onUserSelect) {
          onUserSelect(result.user);
        }
        
        toast({
          title: "Sucesso",
          description: `Cliente encontrado: ${result.user.name}`,
        });
      } else {
        setUser(null);
        setAddresses([]);
        setShowAddresses(false);
        onAddressSelect('', undefined);
        
        toast({
          title: "Cliente não encontrado",
          description: "Nenhum cliente cadastrado com este telefone",
        });
      }
    } catch (error: any) {
      setUser(null);
      setAddresses([]);
      setShowAddresses(false);
      onAddressSelect('', undefined);
      
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Selecionar endereço
  const handleAddressSelect = (address: UserAddress) => {
    onAddressSelect(address.address, user?.id);
    setShowAddresses(false);
    
    toast({
      title: "Endereço selecionado",
      description: `${address.label}: ${address.address}`,
    });
  };

  // Adicionar novo endereço
  const handleAddAddress = async () => {
    const label = prompt('Digite um nome para o endereço (ex: Casa, Trabalho):');
    if (!label) return;
    
    const address = prompt('Digite o endereço completo:');
    if (!address) return;
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado. Busque por telefone primeiro.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newAddress = await userAddressesService.addAddress({
        label,
        address,
        is_default: addresses.length === 0 // Se for o primeiro endereço, definir como padrão
      });
      
      setAddresses(prev => [...prev, newAddress]);
      
      // Se for o primeiro endereço, selecionar automaticamente
      if (addresses.length === 0) {
        onAddressSelect(newAddress.address, user.id);
      }
      
      toast({
        title: "Sucesso",
        description: "Endereço adicionado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Limpar seleção
  const handleClear = () => {
    setPhone('');
    setUser(null);
    setAddresses([]);
    setShowAddresses(false);
    onAddressSelect('', undefined);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campo de telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUserByPhone()}
                disabled={loading}
              />
              <Button 
                onClick={searchUserByPhone} 
                disabled={loading || !phone.trim()}
                className="min-w-[100px]"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Informações do usuário encontrado */}
          {user && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">{user.name}</p>
                  <p className="text-sm text-green-600">{user.phone}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Limpar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de endereços */}
          {showAddresses && addresses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Endereços salvos:</Label>
                <Button variant="outline" size="sm" onClick={handleAddAddress}>
                  + Novo
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress === address.address
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{address.label}</span>
                          {address.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem quando não há endereços */}
          {showAddresses && addresses.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">Nenhum endereço cadastrado</p>
              <Button variant="outline" onClick={handleAddAddress}>
                Adicionar primeiro endereço
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 
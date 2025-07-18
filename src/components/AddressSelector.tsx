import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { userAddressesService, UserAddress, UserWithAddresses } from '../services/userAddresses';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from './ui/dialog';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [adding, setAdding] = useState(false);

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
    
    toast({
      title: "Endereço selecionado",
      description: `${address.label}: ${address.address}`,
    });
  };

  // Adicionar novo endereço (modal)
  const handleAddAddress = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado. Busque por telefone primeiro.",
        variant: "destructive"
      });
      return;
    }
    if (!newLabel.trim() || !newAddress.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do endereço.",
        variant: "destructive"
      });
      return;
    }
    setAdding(true);
    try {
      const createdAddress = await userAddressesService.addAddress({
        label: newLabel,
        address: newAddress,
        is_default: addresses.length === 0,
        user_id: user.id
      });
      setAddresses(prev => [...prev, createdAddress]);
      if (addresses.length === 0) {
        onAddressSelect(createdAddress.address, user.id);
      }
      setIsAddModalOpen(false);
      setNewLabel('');
      setNewAddress('');
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
    } finally {
      setAdding(false);
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
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      + Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Endereço</DialogTitle>
                      <DialogDescription>Preencha os dados do novo endereço do cliente.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input
                        placeholder="Nome do endereço (ex: Casa, Trabalho)"
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        disabled={adding}
                      />
                      <Input
                        placeholder="Endereço completo"
                        value={newAddress}
                        onChange={e => setNewAddress(e.target.value)}
                        disabled={adding}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddAddress} disabled={adding}>
                        {adding ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Adicionar primeiro endereço
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Endereço</DialogTitle>
                    <DialogDescription>Preencha os dados do novo endereço do cliente.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input
                      placeholder="Nome do endereço (ex: Casa, Trabalho)"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      disabled={adding}
                    />
                    <Input
                      placeholder="Endereço completo"
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      disabled={adding}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddAddress} disabled={adding}>
                      {adding ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 
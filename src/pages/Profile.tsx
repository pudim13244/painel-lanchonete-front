import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Store, Clock, Save, Loader2, Image, CreditCard } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { EstablishmentService, EstablishmentProfile, BusinessHour } from "@/services/establishment";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUpload } from "@/components/ImageUpload";
import { Checkbox } from "@/components/ui/checkbox";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<EstablishmentProfile>({
    id: 0,
    restaurant_name: "",
    business_hours: [],
    delivery_radius: 5,
    pix_key: "",
    description: "",
    cuisine_type: "",
    minimum_order: 20,
    delivery_fee: 5,
    logo_url: null,
    banner_url: null,
    instagram: null,
    whatsapp: null,
    only_linked_delivery: false,
    accepted_payment_methods: ["CASH", "PIX", "CREDIT", "DEBIT"]
  });

  const [openTime, setOpenTime] = useState<string>("09:00");
  const [closeTime, setCloseTime] = useState<string>("18:00");

  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    deliveryAlerts: true,
    emailMarketing: false
  });

  const { toast } = useToast();

  // Dias da semana
  const weekDays = [
    { label: 'Segunda', value: 1 },
    { label: 'Terça', value: 2 },
    { label: 'Quarta', value: 3 },
    { label: 'Quinta', value: 4 },
    { label: 'Sexta', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 7 },
  ];

  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [cuisineSuggestions, setCuisineSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await EstablishmentService.getProfile();
        
        console.log('Dados recebidos do backend:', data);
        
        // Garantir que accepted_payment_methods seja um array
        if (data.accepted_payment_methods) {
          if (typeof data.accepted_payment_methods === 'string') {
            try {
              data.accepted_payment_methods = JSON.parse(data.accepted_payment_methods);
            } catch (e) {
              data.accepted_payment_methods = ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
            }
          }
        } else {
          data.accepted_payment_methods = ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
        }
        
        // Garantir que only_linked_delivery seja boolean
        if (data.only_linked_delivery !== undefined) {
          data.only_linked_delivery = Boolean(data.only_linked_delivery);
        } else {
          data.only_linked_delivery = false;
        }
        
        console.log('Dados processados:', data);
        setProfile(data);
        
        // Atualizar horários ao carregar o perfil
        if (data.business_hours && Array.isArray(data.business_hours)) {
          setBusinessHours(data.business_hours);
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar os dados do estabelecimento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  // Buscar tipos de cozinha ao carregar o componente
  useEffect(() => {
    EstablishmentService.getCuisineTypes().then(setCuisineTypes);
  }, []);

  const handleProfileChange = (field: keyof EstablishmentProfile, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleTimeChange = (type: 'open' | 'close', value: string) => {
    if (type === 'open') {
      setOpenTime(value);
      handleProfileChange('business_hours', `${value} - ${closeTime}`);
    } else {
      setCloseTime(value);
      handleProfileChange('business_hours', `${openTime} - ${value}`);
    }
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications({ ...notifications, [field]: value });
  };

  const handleDayToggle = (day: number) => {
    if (businessHours.some(h => h.day_of_week === day)) {
      setBusinessHours(businessHours.filter(h => h.day_of_week !== day));
    } else {
      setBusinessHours([
        ...businessHours,
        { day_of_week: day, open_time: '09:00', close_time: '18:00' }
      ]);
    }
  };

  const handleHourChange = (day: number, type: 'open' | 'close', value: string) => {
    setBusinessHours(businessHours.map(h =>
      h.day_of_week === day ? { ...h, [type === 'open' ? 'open_time' : 'close_time']: value } : h
    ));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('Enviando para o backend:', {
        ...profile,
        business_hours: businessHours.sort((a, b) => a.day_of_week - b.day_of_week),
      });
      await EstablishmentService.updateProfile({
        ...profile,
        business_hours: businessHours.sort((a, b) => a.day_of_week - b.day_of_week),
      });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const result = await EstablishmentService.updateLogo(file);
      setProfile({ ...profile, logo_url: result.logo_url });
      toast({
        title: "Logo atualizado!",
        description: "O logo do seu estabelecimento foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar logo",
        description: "Não foi possível fazer o upload do logo.",
        variant: "destructive",
      });
    }
  };

  const handleBannerUpload = async (file: File) => {
    try {
      const result = await EstablishmentService.updateBanner(file);
      setProfile({ ...profile, banner_url: result.banner_url });
      toast({
        title: "Banner atualizado!",
        description: "O banner do seu estabelecimento foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar banner",
        description: "Não foi possível fazer o upload do banner.",
        variant: "destructive",
      });
    }
  };

  const handleCuisineInput = (value: string) => {
    handleProfileChange("cuisine_type", value);
    if (value.length > 0) {
      setCuisineSuggestions(
        cuisineTypes.filter(type => type.toLowerCase().includes(value.toLowerCase()))
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCuisineSelect = (value: string) => {
    handleProfileChange("cuisine_type", value);
    setShowSuggestions(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Perfil do Estabelecimento</h1>
          <p className="text-gray-600">Gerencie as informações do seu estabelecimento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Informações do Estabelecimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="restaurant_name">Nome do Estabelecimento</Label>
                <Input
                  id="restaurant_name"
                  value={profile.restaurant_name}
                  onChange={(e) => handleProfileChange("restaurant_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={profile.whatsapp || ""}
                  onChange={(e) => handleProfileChange("whatsapp", e.target.value)}
                  placeholder="(99) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={profile.instagram || ""}
                  onChange={(e) => handleProfileChange("instagram", e.target.value)}
                  placeholder="@seuestabelecimento"
                />
              </div>

              <div>
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input
                  id="pix_key"
                  value={profile.pix_key}
                  onChange={(e) => handleProfileChange("pix_key", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={(e) => handleProfileChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Label htmlFor="cuisine_type">Tipo de Cozinha</Label>
                <Input
                  id="cuisine_type"
                  value={profile.cuisine_type}
                  onChange={e => handleCuisineInput(e.target.value)}
                  autoComplete="off"
                  onFocus={() => {
                    setCuisineSuggestions(cuisineTypes);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Digite ou selecione..."
                />
                {showSuggestions && cuisineSuggestions.length > 0 && (
                  <ul style={{
                    position: 'absolute',
                    zIndex: 10,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    width: '100%',
                    maxHeight: 180,
                    overflowY: 'auto',
                    marginTop: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    {cuisineSuggestions.map(type => (
                      <li
                        key={type}
                        style={{ padding: '8px 12px', cursor: 'pointer' }}
                        onMouseDown={() => handleCuisineSelect(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <Label htmlFor="only_linked_delivery">Permitir apenas entregadores vinculados</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="only_linked_delivery"
                    checked={!!profile.only_linked_delivery}
                    onChange={e => handleProfileChange('only_linked_delivery', e.target.checked)}
                  />
                  <span className="text-sm text-gray-500">
                    Quando ativado, apenas entregadores vinculados poderão receber pedidos automaticamente.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours & Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horário de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Selecione os dias e horários de atendimento:</Label>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr>
                          <th className="text-left">Dia</th>
                          <th className="text-left">Abertura</th>
                          <th className="text-left">Fechamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekDays.map(day => {
                          const selected = businessHours.some(h => h.day_of_week === day.value);
                          const hour = businessHours.find(h => h.day_of_week === day.value);
                          return (
                            <tr key={day.value} className="align-middle">
                              <td className="pr-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => handleDayToggle(day.value)}
                                  />
                                  {day.label}
                                </label>
                              </td>
                              <td>
                                <Input
                                  type="time"
                                  value={hour?.open_time || ''}
                                  onChange={e => handleHourChange(day.value, 'open', e.target.value)}
                                  className="w-28"
                                  disabled={!selected}
                                />
                              </td>
                              <td>
                                <Input
                                  type="time"
                                  value={hour?.close_time || ''}
                                  onChange={e => handleHourChange(day.value, 'close', e.target.value)}
                                  className="w-28"
                                  disabled={!selected}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Separator />

                <div>
                  <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    step="0.01"
                    value={profile.delivery_fee}
                    onChange={(e) => handleProfileChange("delivery_fee", parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="minimum_order">Pedido Mínimo (R$)</Label>
                  <Input
                    id="minimum_order"
                    type="number"
                    step="0.01"
                    value={profile.minimum_order}
                    onChange={(e) => handleProfileChange("minimum_order", parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="delivery_radius">Raio de Entrega (km)</Label>
                  <Input
                    id="delivery_radius"
                    type="number"
                    value={profile.delivery_radius}
                    onChange={(e) => handleProfileChange("delivery_radius", parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Métodos de Pagamento Aceitos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Métodos de Pagamento Aceitos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Selecione quais métodos de pagamento seu estabelecimento aceita. Apenas os métodos selecionados aparecerão para os clientes na hora de fazer pedidos.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cash"
                      checked={Array.isArray(profile.accepted_payment_methods) && profile.accepted_payment_methods.includes('CASH')}
                      onCheckedChange={(checked) => {
                        const current = Array.isArray(profile.accepted_payment_methods) ? profile.accepted_payment_methods : ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
                        if (checked) {
                          handleProfileChange('accepted_payment_methods', [...current, 'CASH']);
                        } else {
                          handleProfileChange('accepted_payment_methods', current.filter(m => m !== 'CASH'));
                        }
                      }}
                    />
                    <Label htmlFor="cash" className="flex items-center gap-2">
                      <span className="text-green-600">💵</span>
                      Dinheiro
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pix"
                      checked={Array.isArray(profile.accepted_payment_methods) && profile.accepted_payment_methods.includes('PIX')}
                      onCheckedChange={(checked) => {
                        const current = Array.isArray(profile.accepted_payment_methods) ? profile.accepted_payment_methods : ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
                        if (checked) {
                          handleProfileChange('accepted_payment_methods', [...current, 'PIX']);
                        } else {
                          handleProfileChange('accepted_payment_methods', current.filter(m => m !== 'PIX'));
                        }
                      }}
                    />
                    <Label htmlFor="pix" className="flex items-center gap-2">
                      <span className="text-blue-600">📱</span>
                      PIX
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="credit"
                      checked={Array.isArray(profile.accepted_payment_methods) && profile.accepted_payment_methods.includes('CREDIT')}
                      onCheckedChange={(checked) => {
                        const current = Array.isArray(profile.accepted_payment_methods) ? profile.accepted_payment_methods : ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
                        if (checked) {
                          handleProfileChange('accepted_payment_methods', [...current, 'CREDIT']);
                        } else {
                          handleProfileChange('accepted_payment_methods', current.filter(m => m !== 'CREDIT'));
                        }
                      }}
                    />
                    <Label htmlFor="credit" className="flex items-center gap-2">
                      <span className="text-purple-600">💳</span>
                      Cartão de Crédito
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="debit"
                      checked={Array.isArray(profile.accepted_payment_methods) && profile.accepted_payment_methods.includes('DEBIT')}
                      onCheckedChange={(checked) => {
                        const current = Array.isArray(profile.accepted_payment_methods) ? profile.accepted_payment_methods : ['CASH', 'PIX', 'CREDIT', 'DEBIT'];
                        if (checked) {
                          handleProfileChange('accepted_payment_methods', [...current, 'DEBIT']);
                        } else {
                          handleProfileChange('accepted_payment_methods', current.filter(m => m !== 'DEBIT'));
                        }
                      }}
                    />
                    <Label htmlFor="debit" className="flex items-center gap-2">
                      <span className="text-orange-600">💳</span>
                      Cartão de Débito
                    </Label>
                  </div>
                </div>

                {Array.isArray(profile.accepted_payment_methods) && profile.accepted_payment_methods.length === 0 && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    ⚠️ É necessário selecionar pelo menos um método de pagamento.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novos Pedidos</p>
                    <p className="text-sm text-gray-600">Receber notificações de novos pedidos</p>
                  </div>
                  <Switch
                    checked={notifications.newOrders}
                    onCheckedChange={(checked) => handleNotificationChange("newOrders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atualizações de Pedidos</p>
                    <p className="text-sm text-gray-600">Notificar sobre mudanças de status</p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("orderUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Entrega</p>
                    <p className="text-sm text-gray-600">Alertas sobre entregas em andamento</p>
                  </div>
                  <Switch
                    checked={notifications.deliveryAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("deliveryAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing por E-mail</p>
                    <p className="text-sm text-gray-600">Receber dicas e promoções</p>
                  </div>
                  <Switch
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) => handleNotificationChange("emailMarketing", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Imagens do Estabelecimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload
              label="Logo do Estabelecimento"
              currentImage={profile.logo_url}
              onUpload={handleLogoUpload}
            />
            <ImageUpload
              label="Banner do Estabelecimento"
              currentImage={profile.banner_url}
              onUpload={handleBannerUpload}
            />
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

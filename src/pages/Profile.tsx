
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Store, Clock, Save } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [profile, setProfile] = useState({
    restaurantName: "Lanchonete SaborExpress",
    ownerName: "João Silva",
    email: "joao@saborexpress.com",
    phone: "(11) 99999-9999",
    address: "Rua das Delícias, 123 - Centro",
    description: "A melhor lanchonete da região, servindo hambúrguers artesanais desde 2020.",
    openTime: "18:00",
    closeTime: "23:00",
    deliveryFee: "5.00",
    minOrderValue: "15.00"
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    deliveryAlerts: true,
    emailMarketing: false
  });

  const { toast } = useToast();

  const handleProfileChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications({ ...notifications, [field]: value });
  };

  const handleSave = () => {
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Perfil da Lanchonete</h1>
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
                <Label htmlFor="restaurantName">Nome da Lanchonete</Label>
                <Input
                  id="restaurantName"
                  value={profile.restaurantName}
                  onChange={(e) => handleProfileChange("restaurantName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ownerName">Nome do Proprietário</Label>
                <Input
                  id="ownerName"
                  value={profile.ownerName}
                  onChange={(e) => handleProfileChange("ownerName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleProfileChange("address", e.target.value)}
                  rows={2}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openTime">Abertura</Label>
                    <Input
                      id="openTime"
                      type="time"
                      value={profile.openTime}
                      onChange={(e) => handleProfileChange("openTime", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="closeTime">Fechamento</Label>
                    <Input
                      id="closeTime"
                      type="time"
                      value={profile.closeTime}
                      onChange={(e) => handleProfile Change("closeTime", e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    step="0.01"
                    value={profile.deliveryFee}
                    onChange={(e) => handleProfileChange("deliveryFee", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="minOrderValue">Pedido Mínimo (R$)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    step="0.01"
                    value={profile.minOrderValue}
                    onChange={(e) => handleProfileChange("minOrderValue", e.target.value)}
                  />
                </div>
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
                    onCheckedChange={(value) => handleNotificationChange("newOrders", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atualizações de Pedidos</p>
                    <p className="text-sm text-gray-600">Notificar sobre mudanças de status</p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(value) => handleNotificationChange("orderUpdates", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Entrega</p>
                    <p className="text-sm text-gray-600">Alertas sobre entregas em andamento</p>
                  </div>
                  <Switch
                    checked={notifications.deliveryAlerts}
                    onCheckedChange={(value) => handleNotificationChange("deliveryAlerts", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing por E-mail</p>
                    <p className="text-sm text-gray-600">Receber dicas e promoções</p>
                  </div>
                  <Switch
                    checked={notifications.emailMarketing}
                    onCheckedChange={(value) => handleNotificationChange("emailMarketing", value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700 px-8"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

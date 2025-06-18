
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingCart, Users, TrendingUp, Clock, Star } from "lucide-react";
import { Navigation } from "@/components/Navigation";

const Dashboard = () => {
  const salesData = [
    { name: "Seg", vendas: 850 },
    { name: "Ter", vendas: 920 },
    { name: "Qua", vendas: 1100 },
    { name: "Qui", vendas: 1280 },
    { name: "Sex", vendas: 1450 },
    { name: "Sáb", vendas: 1680 },
    { name: "Dom", vendas: 1240 },
  ];

  const topProducts = [
    { name: "X-Burguer Especial", pedidos: 45, receita: 1165.50 },
    { name: "Pizza Margherita", pedidos: 32, receita: 1120.00 },
    { name: "Batata Frita Especial", pedidos: 38, receita: 589.00 },
    { name: "Refrigerante 350ml", pedidos: 67, receita: 402.00 },
  ];

  const topCustomers = [
    { name: "Maria Silva", pedidos: 12, gasto: 380.50 },
    { name: "João Santos", pedidos: 8, gasto: 245.80 },
    { name: "Ana Costa", pedidos: 6, gasto: 189.90 },
    { name: "Carlos Oliveira", pedidos: 5, gasto: 156.70 },
  ];

  const orderTypeData = [
    { name: "Entrega", value: 45, color: "#f97316" },
    { name: "Retirada", value: 30, color: "#22c55e" },
    { name: "Local", value: 25, color: "#3b82f6" },
  ];

  const recentOrders = [
    { id: "015", customer: "Pedro Lima", total: 45.90, status: "completed", time: "há 5 min" },
    { id: "014", customer: "Lucia Ferreira", total: 32.50, status: "delivering", time: "há 12 min" },
    { id: "013", customer: "Roberto Silva", total: 67.80, status: "ready", time: "há 18 min" },
    { id: "012", customer: "Carla Santos", total: 28.90, status: "preparing", time: "há 25 min" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "delivering": return "bg-orange-100 text-orange-800";
      case "ready": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Concluído";
      case "delivering": return "Em Entrega";
      case "ready": return "Pronto";
      case "preparing": return "Preparando";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 1.456,80</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15.1%</span> este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 30,35</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3.8%</span> em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                    <Bar dataKey="vendas" fill="url(#gradient)" />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo de Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pedidos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">#{order.id}</p>
                        <p className="text-xs text-gray-600">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 text-sm">R$ {order.total.toFixed(2)}</p>
                        <Badge className={`${getStatusColor(order.status)} text-xs`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="products">Top Produtos</TabsTrigger>
                <TabsTrigger value="customers">Top Clientes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Produtos Mais Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topProducts.map((product, index) => (
                        <div key={product.name} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-600">{product.pedidos} pedidos</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600 text-sm">R$ {product.receita.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="customers">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Melhores Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topCustomers.map((customer, index) => (
                        <div key={customer.name} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{customer.name}</p>
                            <p className="text-xs text-gray-600">{customer.pedidos} pedidos</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600 text-sm">R$ {customer.gasto.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loading, ErrorState } from "@/components/ui/loading";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SalesChart, OrderTypeChart } from "@/components/dashboard/Charts";
import { DollarSign, ShoppingCart, Users, TrendingUp, Clock, Star, RefreshCw } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useDashboard } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { dashboardData, loading, error, refreshing, refresh } = useDashboard();
  const navigate = useNavigate();

  // Dados padrão para fallback
  const defaultSalesData = [
    { name: "Seg", vendas: 0 },
    { name: "Ter", vendas: 0 },
    { name: "Qua", vendas: 0 },
    { name: "Qui", vendas: 0 },
    { name: "Sex", vendas: 0 },
    { name: "Sáb", vendas: 0 },
    { name: "Dom", vendas: 0 },
  ];

  const defaultOrderTypeData = [
    { name: "Entrega", value: 0, color: "#f97316" },
    { name: "Retirada", value: 0, color: "#22c55e" },
    { name: "Local", value: 0, color: "#3b82f6" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "delivering":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "Concluído";
      case "delivering":
        return "Em Entrega";
      case "ready":
        return "Pronto";
      case "preparing":
        return "Preparando";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Loading message="Carregando dados do dashboard..." size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <ErrorState message={error} onRetry={refresh} />
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    faturamentoHoje: 0,
    pedidosHoje: 0,
    clientesAtivos: 0,
    ticketMedio: 0,
    crescimentoFaturamento: 0,
    crescimentoPedidos: 0
  };

  const salesData = dashboardData?.salesData || defaultSalesData;
  const topProducts = dashboardData?.topProducts || [];
  const topCustomers = dashboardData?.topCustomers || [];
  const orderTypeData = dashboardData?.orderTypeData || defaultOrderTypeData;
  const recentOrders = dashboardData?.recentOrders || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">Visão geral do seu negócio</p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Faturamento Hoje"
            value={formatCurrency(stats.faturamentoHoje)}
            icon={DollarSign}
            change={{
              value: stats.crescimentoFaturamento,
              label: "em relação a ontem"
            }}
            valueColor="text-green-600"
            changeColor={stats.crescimentoFaturamento >= 0 ? "text-green-600" : "text-red-600"}
          />

          <StatsCard
            title="Pedidos Hoje"
            value={stats.pedidosHoje}
            icon={ShoppingCart}
            change={{
              value: stats.crescimentoPedidos,
              label: "em relação a ontem"
            }}
            changeColor={stats.crescimentoPedidos >= 0 ? "text-green-600" : "text-red-600"}
          />

          <StatsCard
            title="Clientes Ativos"
            value={stats.clientesAtivos}
            icon={Users}
            change={{
              value: 15.1,
              label: "este mês"
            }}
          />

          <StatsCard
            title="Entregadores"
            value={dashboardData?.stats?.entregadores ?? 0}
            icon={Users}
            onClick={() => navigate('/entregadores')}
          />

          <StatsCard
            title="Ticket Médio"
            value={formatCurrency(stats.ticketMedio)}
            icon={TrendingUp}
            change={{
              value: 3.8,
              label: "em relação ao mês passado"
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <SalesChart data={salesData} formatCurrency={formatCurrency} />
            <OrderTypeChart data={orderTypeData} />
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
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">#{order.id}</p>
                          <p className="text-xs text-gray-600">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 text-sm">
                            {formatCurrency(order.total)}
                          </p>
                          <Badge className={`${getStatusColor(order.status)} text-xs`}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum pedido recente</p>
                    </div>
                  )}
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
                      {topProducts.length > 0 ? (
                        topProducts.map((product, index) => (
                          <div key={product.name} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-8 h-8 bg-[#B21735] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-gray-600">{product.pedidos} pedidos</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 text-sm">
                                {formatCurrency(product.receita)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum produto vendido ainda</p>
                        </div>
                      )}
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
                      {topCustomers.length > 0 ? (
                        topCustomers.map((customer, index) => (
                          <div key={customer.name} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-8 h-8 bg-[#B21735] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{customer.name}</p>
                              <p className="text-xs text-gray-600">{customer.pedidos} pedidos</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 text-sm">
                                {formatCurrency(customer.gasto)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum cliente ainda</p>
                        </div>
                      )}
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

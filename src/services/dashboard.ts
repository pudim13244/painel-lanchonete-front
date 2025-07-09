import api from '@/lib/axios';

export interface DashboardStats {
  faturamentoHoje: number;
  pedidosHoje: number;
  clientesAtivos: number;
  ticketMedio: number;
  faturamentoOntem: number;
  pedidosOntem: number;
  crescimentoFaturamento: number;
  crescimentoPedidos: number;
}

export interface SalesData {
  name: string;
  vendas: number;
}

export interface TopProduct {
  name: string;
  pedidos: number;
  receita: number;
}

export interface TopCustomer {
  name: string;
  pedidos: number;
  gasto: number;
}

export interface OrderTypeData {
  name: string;
  value: number;
  color: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  time: string;
}

export interface DashboardData {
  stats: DashboardStats;
  salesData: SalesData[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  orderTypeData: OrderTypeData[];
  recentOrders: RecentOrder[];
}

export class DashboardService {
  // Buscar dados completos do dashboard
  static async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get('/establishment/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw new Error('Erro ao buscar dados do dashboard');
    }
  }

  // Buscar apenas estatísticas
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/establishment/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas do dashboard');
    }
  }

  // Buscar dados de vendas dos últimos 7 dias
  static async getSalesData(): Promise<SalesData[]> {
    try {
      const response = await api.get('/establishment/dashboard/sales');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de vendas:', error);
      throw new Error('Erro ao buscar dados de vendas');
    }
  }

  // Buscar produtos mais vendidos
  static async getTopProducts(): Promise<TopProduct[]> {
    try {
      const response = await api.get('/establishment/dashboard/top-products');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      throw new Error('Erro ao buscar produtos mais vendidos');
    }
  }

  // Buscar melhores clientes
  static async getTopCustomers(): Promise<TopCustomer[]> {
    try {
      const response = await api.get('/establishment/dashboard/top-customers');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar melhores clientes:', error);
      throw new Error('Erro ao buscar melhores clientes');
    }
  }

  // Buscar pedidos recentes
  static async getRecentOrders(): Promise<RecentOrder[]> {
    try {
      const response = await api.get('/establishment/dashboard/recent-orders');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
      throw new Error('Erro ao buscar pedidos recentes');
    }
  }
} 
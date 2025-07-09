import api from '@/lib/axios';

export interface BusinessHour {
  id?: number;
  day_of_week: number; // 1=Seg, 2=Ter, ..., 7=Dom
  open_time: string;   // '08:00'
  close_time: string;  // '18:00'
}

export interface EstablishmentProfile {
  id: number;
  restaurant_name: string;
  business_hours: BusinessHour[];
  delivery_radius: number;
  pix_key: string;
  description: string;
  cuisine_type: string;
  minimum_order: number;
  delivery_fee: number;
  logo_url: string | null;
  banner_url: string | null;
  instagram: string | null;
  whatsapp: string | null;
  only_linked_delivery?: boolean;
  accepted_payment_methods?: string[];
}

// Interfaces para pedidos
export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  obs: string | null;
  product_name?: string;
  additions?: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  acrescimos?: Array<{ id: number; name: string }>;
}

export interface Order {
  id: number;
  customer_id: number;
  establishment_id: number;
  delivery_id: number | null;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  delivery_fee: number;
  payment_method: 'CASH' | 'CREDIT' | 'DEBIT' | 'PIX';
  order_type: 'DELIVERY' | 'DINE_IN' | 'PICKUP';
  amount_paid: number | null;
  change_amount: number | null;
  payment_status: 'PENDING' | 'PAID';
  created_at: string;
  updated_at?: string;
  // Campos do pedido (não mais do usuário)
  delivery_address?: string; // Endereço específico do pedido
  notes?: string; // Observações do pedido
  customer_name?: string; // Nome do cliente no momento do pedido
  customer_phone?: string; // Telefone do cliente no momento do pedido
  delivery_person_name?: string; // Nome do entregador
  items: OrderItem[];
}

export class EstablishmentService {
  // Buscar perfil do estabelecimento
  static async getProfile(): Promise<EstablishmentProfile> {
    try {
      const response = await api.get('/establishment/profile');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw new Error('Erro ao buscar perfil do estabelecimento');
    }
  }

  // Atualizar perfil do estabelecimento
  static async updateProfile(data: Partial<EstablishmentProfile>): Promise<EstablishmentProfile> {
    try {
      const response = await api.put('/establishment/profile', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil do estabelecimento');
    }
  }

  // Atualizar logo do estabelecimento
  static async updateLogo(file: File): Promise<{ logo_url: string }> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/establishment/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
      throw new Error('Erro ao atualizar logo do estabelecimento');
    }
  }

  // Atualizar banner do estabelecimento
  static async updateBanner(file: File): Promise<{ banner_url: string }> {
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const response = await api.post('/establishment/banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
      throw new Error('Erro ao atualizar banner do estabelecimento');
    }
  }

  // Buscar pedidos do estabelecimento
  static async getOrders(status?: string): Promise<Order[]> {
    try {
      const params = status && status !== 'all' ? { status } : {};
      const response = await api.get('/establishment/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw new Error('Erro ao buscar pedidos do estabelecimento');
    }
  }

  // Atualizar status de um pedido
  static async updateOrderStatus(orderId: number, status: Order['status']): Promise<Order> {
    try {
      console.log('Service: Tentando atualizar status:', { orderId, status });
      
      const response = await api.put(`/establishment/orders/${orderId}/status`, { status });
      
      console.log('Service: Resposta da API:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Service: Erro ao atualizar status do pedido:', error);
      
      if (error.response) {
        // Erro da API
        console.error('Service: Status da resposta:', error.response.status);
        console.error('Service: Dados da resposta:', error.response.data);
        
        throw new Error(error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Erro de rede
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Outro erro
        throw new Error('Erro ao atualizar status do pedido');
      }
    }
  }

  // Buscar detalhes de um pedido específico
  static async getOrderDetails(orderId: number): Promise<Order> {
    try {
      const response = await api.get(`/establishment/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      throw new Error('Erro ao buscar detalhes do pedido');
    }
  }

  // Criar novo pedido
  static async createOrder(orderData: {
    establishment_id: number;
    customer_name: string;
    customer_phone: string;
    customer_id?: number;
    order_type: 'DELIVERY' | 'DINE_IN' | 'PICKUP';
    delivery_address?: string;
    notes?: string;
    payment_method: 'CASH' | 'CREDIT' | 'DEBIT' | 'PIX';
    amount_paid?: number | null;
    items?: OrderItem[];
  }): Promise<Order> {
    try {
      console.log('Service: Tentando criar pedido:', orderData);
      
      const response = await api.post('/establishment/orders', orderData);
      
      console.log('Service: Resposta da API:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Service: Erro ao criar pedido:', error);
      
      if (error.response) {
        console.error('Service: Status da resposta:', error.response.status);
        console.error('Service: Dados da resposta:', error.response.data);
        
        throw new Error(error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        throw new Error('Erro ao criar pedido');
      }
    }
  }

  // Atualizar pedido completo (método de pagamento, endereço, itens, etc.)
  static async updateOrder(orderId: number, orderData: {
    status?: Order['status'];
    payment_method?: Order['payment_method'];
    amount_paid?: number | null;
    delivery_address?: string;
    notes?: string;
    items?: OrderItem[];
    total_amount?: number;
  }): Promise<Order> {
    try {
      console.log('Service: Tentando atualizar pedido completo:', { orderId, orderData });
      
      const response = await api.put(`/establishment/orders/${orderId}`, orderData);
      
      console.log('Service: Resposta da API:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Service: Erro ao atualizar pedido:', error);
      
      if (error.response) {
        // Erro da API
        console.error('Service: Status da resposta:', error.response.status);
        console.error('Service: Dados da resposta:', error.response.data);
        
        throw new Error(error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Erro de rede
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Outro erro
        throw new Error('Erro ao atualizar pedido');
      }
    }
  }

  // Buscar tipos de cozinha disponíveis
  static async getCuisineTypes(): Promise<string[]> {
    try {
      const response = await api.get('/establishment/cuisine-types');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipos de cozinha:', error);
      return [];
    }
  }
}

// ==================== INTERFACES PARA CONTROLE DE ENTREGADORES ====================

export interface DeliveryPerson {
  id: number;
  name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  vehicle_model: string;
  has_plate: boolean;
  plate: string;
  photo_url: string | null;
  is_default: boolean;
  apply_fee: boolean;
  active_orders: number;
  is_available: boolean;
}

export interface OrderForDelivery {
  id: number;
  total_amount: number;
  delivery_fee: number;
  payment_method: 'CASH' | 'CREDIT' | 'DEBIT' | 'PIX';
  order_type: 'DELIVERY' | 'DINE_IN' | 'PICKUP';
  created_at: string;
  delivery_id: number | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string; // Endereço específico do pedido
  delivery_person_name: string | null;
  delivery_person_phone: string | null;
  time_ago: string;
}

export interface DeliveryAssignmentResponse {
  message: string;
  delivery_id: number;
  delivery_name?: string;
  active_orders?: number;
}

// ==================== MÉTODOS PARA CONTROLE DE ENTREGADORES ====================

// Buscar pedidos prontos para atribuição de entregador
export const getOrdersReadyForDelivery = async (): Promise<OrderForDelivery[]> => {
  try {
    const response = await api.get('/establishment/orders/ready-for-delivery');
    return response.data.orders;
  } catch (error) {
    console.error('Erro ao buscar pedidos prontos para entrega:', error);
    throw new Error('Erro ao buscar pedidos prontos para entrega');
  }
};

// Buscar entregadores disponíveis
export const getDeliveryPeople = async (): Promise<DeliveryPerson[]> => {
  try {
    const response = await api.get('/establishment/delivery-people');
    return response.data.delivery_people;
  } catch (error) {
    console.error('Erro ao buscar entregadores:', error);
    throw new Error('Erro ao buscar entregadores');
  }
};

// Atribuir entregador manualmente
export const assignDeliveryToOrder = async (
  orderId: number, 
  deliveryId: number
): Promise<DeliveryAssignmentResponse> => {
  try {
    const response = await api.post(`/establishment/orders/${orderId}/assign-delivery`, {
      delivery_id: deliveryId
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atribuir entregador:', error);
    throw new Error('Erro ao atribuir entregador ao pedido');
  }
};

// Atribuir entregador automaticamente
export const assignDeliveryAuto = async (
  orderId: number
): Promise<DeliveryAssignmentResponse> => {
  try {
    const response = await api.post(`/establishment/orders/${orderId}/assign-delivery-auto`);
    return response.data;
  } catch (error) {
    console.error('Erro ao atribuir entregador automaticamente:', error);
    throw new Error('Erro ao atribuir entregador automaticamente');
  }
};

// Remover entregador de um pedido
export const removeDeliveryFromOrder = async (
  orderId: number
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/establishment/orders/${orderId}/remove-delivery`);
    return response.data;
  } catch (error) {
    console.error('Erro ao remover entregador:', error);
    throw new Error('Erro ao remover entregador do pedido');
  }
}; 
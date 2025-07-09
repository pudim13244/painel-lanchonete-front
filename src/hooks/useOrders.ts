import { useState, useCallback, useRef, useEffect } from 'react';
import { Order } from '@/services/establishment';
import { EstablishmentService } from '@/services/establishment';
import { useToast } from '@/hooks/use-toast';

interface UseOrdersOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialStatus?: string;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    initialStatus
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus || 'all');
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Função para carregar pedidos com cancelamento de requisições anteriores
  const loadOrders = useCallback(async (status?: string) => {
    try {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Criar novo controller para esta requisição
      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      setError(null);
      
      const data = await EstablishmentService.getOrders(status);
      
      // Verificar se a requisição não foi cancelada
      if (!abortControllerRef.current.signal.aborted) {
        setOrders(data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Requisição foi cancelada, não fazer nada
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar pedidos';
      setError(errorMessage);
      
      toast({
        title: "Erro ao carregar pedidos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [toast]);

  // Função para atualizar status com otimistic update
  const updateOrderStatus = useCallback(async (orderId: number, newStatus: Order['status']) => {
    const previousOrders = [...orders];
    
    try {
      // Otimistic update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      await EstablishmentService.updateOrderStatus(orderId, newStatus);

      toast({
        title: "Status atualizado!",
        description: `Pedido #${orderId} atualizado com sucesso`,
      });
    } catch (error) {
      // Reverter em caso de erro
      setOrders(previousOrders);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status';
      
      toast({
        title: "Erro ao atualizar status",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  }, [orders, toast]);

  // Função para atualizar pedido completo
  const updateOrder = useCallback(async (orderId: number, updatedOrderData: any) => {
    const previousOrders = [...orders];
    
    try {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: updatedOrderData.status || order.status,
                payment_method: updatedOrderData.payment_method || order.payment_method,
                amount_paid: updatedOrderData.amount_paid || order.amount_paid,
                customer_address: updatedOrderData.customer_address || order.customer_address,
                total_amount: updatedOrderData.total_amount || order.total_amount,
                items: updatedOrderData.items || order.items
              }
            : order
        )
      );

      toast({
        title: "Pedido atualizado!",
        description: `Pedido #${orderId} foi atualizado com sucesso`,
      });
    } catch (error) {
      // Reverter em caso de erro
      setOrders(previousOrders);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar pedido';
      
      toast({
        title: "Erro ao atualizar pedido",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  }, [orders, toast]);

  // Função para refresh manual
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadOrders(currentStatus === "all" ? undefined : currentStatus);
    setIsRefreshing(false);
  }, [loadOrders, currentStatus]);

  // Função para mudar status
  const changeStatus = useCallback((status: string) => {
    setCurrentStatus(status);
    loadOrders(status === "all" ? undefined : status);
  }, [loadOrders]);

  // Função para adicionar novo pedido (para WebSocket)
  const addOrder = useCallback((newOrder: Order) => {
    setOrders(prevOrders => {
      // Verificar se o pedido já existe
      const exists = prevOrders.some(order => order.id === newOrder.id);
      if (exists) {
        // Atualizar pedido existente
        return prevOrders.map(order => 
          order.id === newOrder.id ? newOrder : order
        );
      } else {
        // Adicionar novo pedido no início
        return [newOrder, ...prevOrders];
      }
    });
  }, []);

  // Função para remover pedido
  const removeOrder = useCallback((orderId: number) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  }, []);

  // Configurar auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadOrders(currentStatus === "all" ? undefined : currentStatus);
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, currentStatus, loadOrders]);

  // Carregar pedidos iniciais
  useEffect(() => {
    loadOrders(initialStatus === "all" ? undefined : initialStatus);
  }, [loadOrders, initialStatus]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Funções utilitárias para filtros
  const getOrdersByType = useCallback((type: string) => {
    return orders.filter(order => order.order_type === type);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: string) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getOrdersByTypeAndStatus = useCallback((type: string, status: string) => {
    return orders.filter(order => 
      order.order_type === type && (status === "all" || order.status === status)
    );
  }, [orders]);

  const getOrderCounts = useCallback(() => {
    const counts: Record<string, Record<string, number>> = {
      DELIVERY: {},
      DINE_IN: {},
      PICKUP: {}
    };

    orders.forEach(order => {
      if (!counts[order.order_type]) {
        counts[order.order_type] = {};
      }
      if (!counts[order.order_type][order.status]) {
        counts[order.order_type][order.status] = 0;
      }
      counts[order.order_type][order.status]++;
    });

    return counts;
  }, [orders]);

  return {
    // Estado
    orders,
    isLoading,
    isRefreshing,
    currentStatus,
    error,
    
    // Ações
    loadOrders,
    updateOrderStatus,
    updateOrder,
    refresh,
    changeStatus,
    addOrder,
    removeOrder,
    
    // Utilitários
    getOrdersByType,
    getOrdersByStatus,
    getOrdersByTypeAndStatus,
    getOrderCounts,
  };
}; 
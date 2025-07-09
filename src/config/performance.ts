// Configurações de performance para sistema PDV

// Extensões de tipos para APIs de performance
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

export const PERFORMANCE_CONFIG = {
  // Configurações de virtualização
  VIRTUALIZATION: {
    ITEM_HEIGHT: 320, // Altura estimada de cada card de pedido
    BUFFER_SIZE: 3, // Número de itens extras para renderizar
    GRID_COLUMNS: 3, // Número de colunas no grid
    SCROLL_DEBOUNCE: 16, // Debounce do scroll em ms (~60fps)
  },

  // Configurações de refresh
  REFRESH: {
    AUTO_REFRESH_INTERVAL: 30000, // 30 segundos
    MANUAL_REFRESH_COOLDOWN: 2000, // 2 segundos entre refreshes manuais
    WEBSOCKET_RECONNECT_DELAY: 5000, // 5 segundos para reconectar WebSocket
  },

  // Configurações de cache
  CACHE: {
    ORDER_CACHE_DURATION: 60000, // 1 minuto
    MAX_CACHED_ORDERS: 1000, // Máximo de pedidos em cache
    CLEANUP_INTERVAL: 300000, // 5 minutos para limpeza de cache
  },

  // Configurações de animações
  ANIMATIONS: {
    CARD_HOVER_DURATION: 200, // Duração da animação de hover
    MODAL_TRANSITION_DURATION: 300, // Duração da transição do modal
    STATUS_UPDATE_DELAY: 100, // Delay para atualização otimista de status
  },

  // Configurações de notificações
  NOTIFICATIONS: {
    SOUND_LOOP_DURATION: 5000, // 5 segundos de loop do som
    VISUAL_ALERT_DURATION: 3000, // 3 segundos de alerta visual
    MAX_CONCURRENT_NOTIFICATIONS: 3, // Máximo de notificações simultâneas
  },

  // Configurações de debounce
  DEBOUNCE: {
    SEARCH_DELAY: 300, // 300ms para busca
    SCROLL_DELAY: 16, // 16ms para scroll
    RESIZE_DELAY: 250, // 250ms para resize
  },

  // Configurações de lazy loading
  LAZY_LOADING: {
    IMAGE_LOAD_DELAY: 100, // 100ms para carregar imagens
    COMPONENT_LOAD_DELAY: 50, // 50ms para carregar componentes
  },

  // Configurações de otimização de rede
  NETWORK: {
    REQUEST_TIMEOUT: 10000, // 10 segundos de timeout
    MAX_RETRIES: 3, // Máximo de 3 tentativas
    RETRY_DELAY: 1000, // 1 segundo entre tentativas
  },

  // Configurações de memória
  MEMORY: {
    MAX_ORDERS_IN_MEMORY: 500, // Máximo de 500 pedidos em memória
    GARBAGE_COLLECTION_INTERVAL: 60000, // 1 minuto para GC
  },

  // Configurações de renderização
  RENDERING: {
    BATCH_SIZE: 50, // Renderizar 50 itens por vez
    RENDER_DELAY: 16, // 16ms entre batches
    MAX_RENDER_TIME: 100, // Máximo 100ms por render
  },
};

// Funções utilitárias de performance
export const PerformanceUtils = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },

  // Request animation frame wrapper
  raf: (callback: () => void) => {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      return window.requestAnimationFrame(callback);
    }
    return setTimeout(callback, 16);
  },

  // Cancel animation frame wrapper
  cancelRaf: (id: number) => {
    if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  },

  // Memory usage check
  getMemoryUsage: () => {
    if (typeof performance !== 'undefined') {
      const perf = performance as ExtendedPerformance;
      if (perf.memory) {
        return {
          used: perf.memory.usedJSHeapSize,
          total: perf.memory.totalJSHeapSize,
          limit: perf.memory.jsHeapSizeLimit,
        };
      }
    }
    return null;
  },

  // Performance mark
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  // Performance measure
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure.duration;
      } catch (error) {
        console.warn('Performance measure failed:', error);
        return null;
      }
    }
    return null;
  },

  // Check if device is low-end
  isLowEndDevice: () => {
    if (typeof navigator !== 'undefined') {
      const memory = (navigator as any).deviceMemory || 4;
      const cores = navigator.hardwareConcurrency || 4;
      return memory < 4 || cores < 4;
    }
    return false;
  },

  // Optimize for low-end devices
  getOptimizedConfig: () => {
    const isLowEnd = PerformanceUtils.isLowEndDevice();
    
    if (isLowEnd) {
      return {
        ...PERFORMANCE_CONFIG,
        VIRTUALIZATION: {
          ...PERFORMANCE_CONFIG.VIRTUALIZATION,
          BUFFER_SIZE: 1, // Reduzir buffer
          GRID_COLUMNS: 2, // Reduzir colunas
        },
        REFRESH: {
          ...PERFORMANCE_CONFIG.REFRESH,
          AUTO_REFRESH_INTERVAL: 60000, // Aumentar intervalo
        },
        CACHE: {
          ...PERFORMANCE_CONFIG.CACHE,
          MAX_CACHED_ORDERS: 500, // Reduzir cache
        },
        ANIMATIONS: {
          ...PERFORMANCE_CONFIG.ANIMATIONS,
          CARD_HOVER_DURATION: 0, // Desabilitar animações
          MODAL_TRANSITION_DURATION: 0,
        },
      };
    }
    
    return PERFORMANCE_CONFIG;
  },
};

// Hooks de performance
export const usePerformanceOptimizations = () => {
  const config = PerformanceUtils.getOptimizedConfig();
  
  return {
    config,
    isLowEnd: PerformanceUtils.isLowEndDevice(),
    mark: PerformanceUtils.mark,
    measure: PerformanceUtils.measure,
    debounce: PerformanceUtils.debounce,
    throttle: PerformanceUtils.throttle,
  };
}; 
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Order } from '@/services/establishment';
import { OptimizedOrderCard } from './OptimizedOrderCard';

interface VirtualizedOrderListProps {
  orders: Order[];
  onStatusUpdate: (orderId: number, status: Order['status']) => void;
  onOpenModal: (order: Order) => void;
  onPrint: (orderId: number) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getTypeText: (type: string) => string;
  getPaymentMethodText: (method: string) => string;
  formatDateTime: (dateString: string) => string;
  className?: string;
}

export const VirtualizedOrderList: React.FC<VirtualizedOrderListProps> = ({
  orders,
  onStatusUpdate,
  onOpenModal,
  onPrint,
  getStatusColor,
  getStatusText,
  getTypeText,
  getPaymentMethodText,
  formatDateTime,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Configurações de virtualização
  const ITEM_HEIGHT = 320; // Altura estimada de cada card
  const BUFFER_SIZE = 3; // Número de itens extras para renderizar
  const GRID_COLUMNS = 3; // Número de colunas no grid

  // Calcular altura total baseada no número de linhas necessárias
  const totalRows = Math.ceil(orders.length / GRID_COLUMNS);
  const totalHeight = totalRows * ITEM_HEIGHT;

  // Função para calcular o range visível
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;
    
    const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    
    const start = startRow * GRID_COLUMNS;
    const end = Math.min(orders.length, endRow * GRID_COLUMNS);
    
    setVisibleRange({ start, end });
  }, [orders.length, totalRows]);

  // Função para debounce do scroll
  const debouncedCalculateRange = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateVisibleRange, 16); // ~60fps
    };
  }, [calculateVisibleRange]);

  // Configurar scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = debouncedCalculateRange();
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Calcular altura inicial do container
    setContainerHeight(container.clientHeight);
    
    // Calcular range inicial
    calculateVisibleRange();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [debouncedCalculateRange, calculateVisibleRange]);

  // Recalcular quando orders mudar
  useEffect(() => {
    calculateVisibleRange();
  }, [orders, calculateVisibleRange]);

  // Filtrar orders visíveis
  const visibleOrders = useMemo(() => {
    return orders.slice(visibleRange.start, visibleRange.end);
  }, [orders, visibleRange]);

  // Calcular offset para posicionamento
  const offsetY = visibleRange.start * (ITEM_HEIGHT / GRID_COLUMNS);

  // Função para renderizar uma linha do grid
  const renderGridRow = useCallback((rowIndex: number) => {
    const startIndex = rowIndex * GRID_COLUMNS;
    const rowOrders = visibleOrders.filter((_, index) => {
      const globalIndex = visibleRange.start + index;
      return globalIndex >= startIndex && globalIndex < startIndex + GRID_COLUMNS;
    });

    return (
      <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {rowOrders.map((order) => (
          <OptimizedOrderCard
            key={order.id}
            order={order}
            onStatusUpdate={onStatusUpdate}
            onOpenModal={onOpenModal}
            onPrint={onPrint}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getTypeText={getTypeText}
            getPaymentMethodText={getPaymentMethodText}
            formatDateTime={formatDateTime}
          />
        ))}
        {/* Preencher espaços vazios para manter o grid */}
        {Array.from({ length: GRID_COLUMNS - rowOrders.length }).map((_, index) => (
          <div key={`empty-${rowIndex}-${index}`} className="h-0" />
        ))}
      </div>
    );
  }, [
    visibleOrders,
    visibleRange.start,
    onStatusUpdate,
    onOpenModal,
    onPrint,
    getStatusColor,
    getStatusText,
    getTypeText,
    getPaymentMethodText,
    formatDateTime
  ]);

  // Calcular linhas visíveis
  const visibleRows = useMemo(() => {
    const startRow = Math.floor(visibleRange.start / GRID_COLUMNS);
    const endRow = Math.ceil(visibleRange.end / GRID_COLUMNS);
    return Array.from({ length: endRow - startRow }, (_, i) => startRow + i);
  }, [visibleRange]);

  if (orders.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 opacity-50">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p>Nenhum pedido encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${className}`}
      style={{ height: 'calc(100vh - 300px)' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleRows.map(renderGridRow)}
        </div>
      </div>
    </div>
  );
}; 
import React, { useEffect } from 'react';

interface Acrescimo {
  acrescimo_name: string;
  acrescimo_price: number;
  quantity: number;
}

interface OrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  obs?: string;
  acrescimos?: Acrescimo[];
}

interface OrderData {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  establishment_user_name: string;
  restaurant_name?: string;
  establishment_phone: string;
  establishment_address: string;
  total_amount: number;
  delivery_fee: number;
  payment_method: string;
  amount_paid?: number;
  change_amount?: number;
  status: string;
  payment_status: string;
  order_items: OrderItem[];
  pix_key?: string;
  order_type: string;
  notes?: string;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  DELIVERING: 'Em Entrega',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

const paymentMethods: Record<string, string> = {
  CASH: 'Dinheiro',
  CREDIT: 'Cartão de Crédito',
  DEBIT: 'Cartão de Débito',
  PIX: 'PIX',
};

export const PrintOrder: React.FC<{ order: OrderData; onAfterPrint?: () => void }> = ({ order, onAfterPrint }) => {
  useEffect(() => {
    setTimeout(() => {
      window.print();
      if (onAfterPrint) onAfterPrint();
    }, 300);
  }, [onAfterPrint]);

  const items = Array.isArray(order.order_items) ? order.order_items : (Array.isArray((order as any).items) ? (order as any).items : []);
  const totalAmount = Number(order.total_amount) || 0;
  const deliveryFee = Number(order.delivery_fee) || 0;
  const amountPaid = Number(order.amount_paid) || 0;
  const changeAmount = Number(order.change_amount) || 0;

  return (
    <div style={{ fontFamily: 'monospace', width: '58mm', margin: '0 auto', padding: '2mm', fontSize: '12pt', background: 'white', lineHeight: 1, letterSpacing: '-0.5px', wordWrap: 'break-word', whiteSpace: 'normal', overflow: 'hidden' }}>
      <style>{`
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }
          html, body, #print-cupom, .container {
            width: 58mm !important;
            min-width: 0 !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }
          .container {
            page-break-inside: avoid !important;
          }
        }
        .container {
          width: 58mm;
          margin: 0 auto;
          word-wrap: break-word;
          white-space: normal;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .section {
          margin-bottom: 10px !important;
        }
        .divider {
          margin: 10px 0 !important;
          border-top: 1px dotted #000;
          padding-top: 0 !important;
        }
        .text-center {
          text-align: center;
        }
        .text-right {
          text-align: right;
        }
        .bold {
          font-weight: bold;
        }
        .establishment-name {
          font-weight: bold;
          font-size: 14pt;
          text-align: center;
          margin-bottom: 2mm;
          letter-spacing: -0.5px;
        }
        .order-number {
          font-weight: bold;
          font-size: 16pt;
          text-align: center;
          margin: 2mm 0;
          letter-spacing: -0.5px;
        }
        .item, .detail-value, .order-items {
          word-wrap: break-word;
          white-space: normal;
          overflow-wrap: break-word;
          letter-spacing: -0.5px;
          margin: 0;
          padding: 0;
        }
        .item {
          margin: 6px 0 8px 0;
          padding: 0;
        }
        .item-name {
          font-weight: bold;
        }
        .acrescimo {
          padding-left: 3mm;
          font-style: italic;
        }
        .acrescimo-quantity {
          font-weight: bold;
        }
        .acrescimo-price {
          float: right;
        }
        .subtotal {
          text-align: right;
          margin-top: 1mm;
          border-top: 1px dotted #000;
          padding-top: 1mm;
        }
        .total {
          font-weight: bold;
          font-size: 13pt;
          margin-top: 2mm;
          letter-spacing: -0.5px;
        }
        .footer {
          text-align: center;
          font-size: 10pt;
          margin-top: 4mm;
          letter-spacing: -0.5px;
        }
      `}</style>
      <div className="container">
        <div className="section establishment-name">{(order.restaurant_name || order.establishment_user_name)?.toUpperCase()}</div>
        <div className="section text-center">{order.establishment_phone}<br />{order.establishment_address}</div>
        <div className="divider" />
        <div className="section">
          CLIENTE: {order.customer_name}<br />
          TEL: {order.customer_phone}<br />
          END: {order.delivery_address}
        </div>
        <div className="divider" />
        <div className="section">
          {items.length === 0 && <div style={{ fontStyle: 'italic', color: '#888' }}>Nenhum produto encontrado</div>}
          {items.map((item) => (
            <div className="item" key={item.id}>
              <div className="item-name">
                {item.quantity}x {item.product_name || item.name}
                <span style={{ float: 'right' }}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
              {item.obs && (
                <div style={{ color: '#007bff', fontStyle: 'italic', fontSize: '7.5pt' }}>Obs: {item.obs}</div>
              )}
              {/* Adicionais/acréscimos */}
              {(Array.isArray(item.additions) ? item.additions : item.acrescimos)?.length > 0 && (
                <>
                  {(item.additions || item.acrescimos).map((ac, idx) => (
                    <div className="acrescimo" key={idx}>
                      <span className="acrescimo-quantity">{ac.quantity || 1}x</span> {ac.name || ac.acrescimo_name}
                      <span className="acrescimo-price">
                        R$ {((ac.price ?? ac.acrescimo_price ?? ac.additional_price ?? 0) * (ac.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="subtotal">
                    Subtotal: R$ {(() => {
                      let subtotal = item.price * item.quantity;
                      (item.additions || item.acrescimos)?.forEach(ac => {
                        subtotal += (ac.price ?? ac.acrescimo_price ?? ac.additional_price ?? 0) * (ac.quantity || 1);
                      });
                      return subtotal.toFixed(2);
                    })()}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="section">
          <div style={{ textAlign: 'right' }}>
            Subtotal: R$ {totalAmount.toFixed(2)}<br />
            Taxa de entrega: R$ {deliveryFee.toFixed(2)}<br />
            <div className="total">
              Total: R$ {(totalAmount + deliveryFee).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="divider" />
        <div className="section">
          Pagamento: {paymentMethods[order.payment_method] || order.payment_method}<br />
          {order.payment_method === 'CASH' && amountPaid > 0 && (
            <>
              Valor Pago: R$ {amountPaid.toFixed(2)}<br />
              {amountPaid > (totalAmount + deliveryFee) && (
                <>Troco: R$ {(amountPaid - (totalAmount + deliveryFee)).toFixed(2)}<br /></>
              )}
            </>
          )}
          {order.payment_method === 'PIX' && order.pix_key && (
            <>
              Chave PIX: {order.pix_key}<br />
            </>
          )}
          Status: {statusLabels[order.status] || order.status}<br />
          Pagamento: {order.payment_status === 'PAID' ? 'Pago' : 'Pendente'}
        </div>
        <div className="divider" />
        <div className="section footer">
          Pedido gerado em {new Date().toLocaleString('pt-BR')}<br />
          QuickDeliver - Vm Agencia Digital
        </div>
        <div className="footer">
          <strong>Comanda sem valor fiscal</strong>
        </div>
      </div>
    </div>
  );
}; 
import React, { useEffect, useState } from 'react';
import { getDeliveryHistoryDeliverers, getDeliveryHistoryByDeliverer, EstablishmentService } from '@/services/establishment';
import { format } from 'date-fns';

const DeliveryHistory: React.FC = () => {
  const [establishmentId, setEstablishmentId] = useState<number | null>(null);
  const [deliverers, setDeliverers] = useState<{ id: number, name: string }[]>([]);
  const [selectedDeliverer, setSelectedDeliverer] = useState<{ id: number, name: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [totalFee, setTotalFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    EstablishmentService.getProfile().then(profile => {
      setEstablishmentId(profile.id);
    });
  }, []);

  useEffect(() => {
    if (establishmentId) {
      getDeliveryHistoryDeliverers(establishmentId).then(setDeliverers);
    }
  }, [establishmentId]);

  useEffect(() => {
    if (establishmentId && selectedDeliverer && selectedDeliverer.id) {
      setLoading(true);
      getDeliveryHistoryByDeliverer(establishmentId, selectedDeliverer.id, selectedDate)
        .then(data => {
          setDeliveries(data.deliveries || []);
          setTotalFee(data.total_delivery_fee || 0);
        })
        .finally(() => setLoading(false));
    } else {
      setDeliveries([]);
      setTotalFee(0);
    }
  }, [establishmentId, selectedDeliverer, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Histórico de Entregadores</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Entregadores que já fizeram entregas</h2>
        <div className="flex flex-wrap gap-2">
          {deliverers.map(deliverer => (
            <button
              key={deliverer.id}
              className={`px-4 py-2 rounded border ${selectedDeliverer?.id === deliverer.id ? 'bg-[#B21735] text-white' : 'bg-white text-gray-900'}`}
              onClick={() => setSelectedDeliverer(deliverer)}
            >
              {deliverer.name}
            </button>
          ))}
        </div>
      </div>
      {selectedDeliverer && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <label className="font-semibold">Filtrar por dia:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <span className="ml-4 font-semibold">Total taxas do dia: <span className="text-green-700">R$ {totalFee.toFixed(2)}</span></span>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Pedidos do dia</h3>
            {loading ? (
              <div>Carregando...</div>
            ) : deliveries.length === 0 ? (
              <div className="text-gray-500">Nenhum pedido encontrado para este dia.</div>
            ) : (
              <ul className="space-y-3">
                {deliveries.map(delivery => (
                  <li key={delivery.id} className="border rounded p-3 bg-white">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">Finalizado em: {delivery.finished_at ? format(new Date(delivery.finished_at), 'dd/MM/yyyy HH:mm') : '-'}</span>
                      <span className="text-sm text-gray-600">Taxa: R$ {Number(delivery.delivery_fee).toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-700">Cliente: {delivery.customer_name}</div>
                    <div className="text-sm text-gray-700">Endereço: {delivery.delivery_address}</div>
                    <div className="text-sm text-gray-700">Itens: <pre className="inline whitespace-pre-wrap">{delivery.items}</pre></div>
                    <div className="text-sm text-gray-700">Total: <b>R$ {Number(delivery.total_amount).toFixed(2)}</b></div>
                    <div className="text-xs text-gray-500">Pagamento: {delivery.payment_method}</div>
                    {delivery.order_notes && <div className="text-xs text-gray-500">Obs: {delivery.order_notes}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory; 
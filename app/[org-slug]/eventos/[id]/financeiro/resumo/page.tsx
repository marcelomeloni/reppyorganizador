"use client";

import { useMemo } from "react";
import { DownloadSimple, Info, Ticket } from "@phosphor-icons/react";

const mockEvent = { id: "1", name: "Festa da Computação" };
const mockFinance = {
  batches: [
    { id: "b1", name: "Pista Lote 1", quantity_total: 200, price: 50 },
    { id: "b2", name: "VIP Lote Único", quantity_total: 100, price: 120 },
    { id: "b3", name: "Camarote (Esgotado)", quantity_total: 50, price: 200 },
  ],
  orders_list: [
    { id: "o1", status: "paid", net_amount: 100, total_amount: 100 },
    { id: "o2", status: "paid", net_amount: 120, total_amount: 120 },
    { id: "o3", status: "paid", net_amount: 400, total_amount: 400 },
  ],
};

const mockParticipants = {
  list: [
    { id: "p1", batch_id: "b1", order_id: "o1", status: "valid" },
    { id: "p2", batch_id: "b1", order_id: "o1", status: "valid" },
    { id: "p3", batch_id: "b2", order_id: "o2", status: "used" },
    { id: "p4", batch_id: "b3", order_id: "o3", status: "valid" },
    { id: "p5", batch_id: "b3", order_id: "o3", status: "valid" },
  ],
};

export default function FinanceiroResumoPage() {
  const event = mockEvent;
  const finance = mockFinance;
  const participants = mockParticipants;
  const loading = false;

  const batchRealData = useMemo(() => {
    if (!finance?.batches || !finance?.orders_list || !participants?.list) return {};

    const stats: Record<string, { revenue: number; sold: number }> = {};

    finance.batches.forEach((b) => {
      stats[b.id] = { revenue: 0, sold: 0 };
    });

    participants.list.forEach((ticket) => {
      if (!ticket.batch_id || !ticket.order_id) return;

      if (stats[ticket.batch_id]) {
        stats[ticket.batch_id].sold += 1;
      }

      const order = finance.orders_list.find((o) => o.id === ticket.order_id);

      if (order && order.status === "paid") {
        const ticketsInThisOrder = participants.list.filter(
          (t) => t.order_id === ticket.order_id
        ).length;

        if (ticketsInThisOrder > 0) {
          const netOrderValue =
            order.net_amount !== null
              ? Number(order.net_amount)
              : Number(order.total_amount) - 0;

          const ticketContribution = netOrderValue / ticketsInThisOrder;

          if (stats[ticket.batch_id]) {
            stats[ticket.batch_id].revenue += ticketContribution;
          }
        }
      }
    });

    return stats;
  }, [finance, participants]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#0A0A0A] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!event || !finance) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-0.5px" }}
          >
            Resumo Financeiro
          </h1>
          <p
            className="text-sm text-[#9A9A8F] mt-0.5"
            style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Consolidado até agora · repasse em 3 dias úteis após o evento
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-white border border-[#E0E0D8] text-xs font-bold text-[#0A0A0A] hover:bg-[#F7F7F2] transition-all shadow-sm uppercase tracking-wider"
          style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
        >
          <DownloadSimple size={16} weight="bold" />
          Exportar PDF
        </button>
      </div>

      <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] overflow-hidden flex flex-col h-fit">
        <div className="p-5 border-b border-[#F0F0EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F7F2]/50">
          <h3 
            className="text-[#0A0A0A] font-extrabold text-base flex items-center gap-2"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
              <Ticket size={16} weight="bold" />
            </div>
            Performance por Lote
          </h3>
          <div 
            className="flex items-center gap-2 text-[11px] font-bold text-[#5C5C52] bg-white border border-[#E0E0D8] px-3 py-1.5 rounded-full"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
          >
            <Info size={14} weight="bold" />
            <span>Líquido baseado nas transações reais</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-[#F0F0EB]">
              <tr>
                <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest min-w-[180px]" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                  Lote
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest min-w-[200px]" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                  Vendas / Progresso
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                  Preço (BRL)
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest text-right" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                  Arrecadação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0EB] text-sm text-[#0A0A0A]" style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}>
              {finance.batches.map((batch) => {
                const realStats = batchRealData[batch.id] || { revenue: 0, sold: 0 };
                const sold = realStats.sold;
                const total = batch.quantity_total || 0;
                const remaining = total - sold;
                const currentPrice = Number(batch.price);
                const percentage = total > 0 ? Math.round((sold / total) * 100) : 0;
                const isSoldOut = remaining <= 0;

                return (
                  <tr key={batch.id} className="hover:bg-[#F7F7F2] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#0A0A0A] flex items-center gap-2">
                        {batch.name}
                        {isSoldOut && (
                          <span 
                            className="text-[9px] bg-[#FCE8E8] text-[#D91B1B] px-1.5 py-0.5 rounded-[4px] font-extrabold uppercase tracking-widest"
                            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                          >
                            Esgotado
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#5C5C52] mt-0.5">
                        Restam {remaining < 0 ? 0 : remaining} de {total}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-full max-w-[200px]">
                        <div className="h-1.5 w-full bg-[#F0F0EB] rounded-full overflow-hidden mb-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSoldOut ? "bg-[#D91B1B]" : "bg-[#0A0A0A]"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#5C5C52] font-medium">
                          {sold} vendidos ({percentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#5C5C52]">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(currentPrice)}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#0A0A0A] text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(realStats.revenue)}
                    </td>
                  </tr>
                );
              })}

              {finance.batches.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[#9A9A8F] text-sm">
                    Nenhum lote de ingresso encontrado para este evento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

   
    </div>
  );
}
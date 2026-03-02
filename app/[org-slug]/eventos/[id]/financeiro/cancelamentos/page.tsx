"use client";

import { useState, useMemo } from "react";
import {
  MagnifyingGlass,
  DownloadSimple,
  Warning,
  CheckCircle,
  XCircle,
  Clock,
  Funnel
} from "@phosphor-icons/react";

type RefundRequest = {
  id: string;
  order_id: string;
  user_name: string;
  created_at: string;
  reason: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  ticket_type: string;
};

const mockRefunds: RefundRequest[] = [
  {
    id: "REF-9A8B7C",
    order_id: "ORD-123456",
    user_name: "Lucas Mendes",
    ticket_type: "VIP",
    amount: 50.0,
    reason: "Não vai poder comparecer devido a um imprevisto familiar.",
    created_at: "2026-06-02T10:30:00Z",
    status: "completed",
  },
  {
    id: "REF-5D4E3F",
    order_id: "ORD-789012",
    user_name: "Beatriz F.",
    ticket_type: "Pista",
    amount: 20.0,
    reason: "Compra duplicada por erro no cartão.",
    created_at: "2026-06-01T14:15:00Z",
    status: "completed",
  },
  {
    id: "REF-1X2Y3Z",
    order_id: "ORD-345678",
    user_name: "André T.",
    ticket_type: "Camarote",
    amount: 80.0,
    reason: "Pedido de cancelamento dentro do prazo legal de 7 dias.",
    created_at: "2026-05-31T09:45:00Z",
    status: "pending",
  },
  {
    id: "REF-7P8Q9R",
    order_id: "ORD-901234",
    user_name: "Carlos Silva",
    ticket_type: "Pista",
    amount: 20.0,
    reason: "Desistência da compra.",
    created_at: "2026-05-30T16:20:00Z",
    status: "rejected",
  },
];

const StatusBadge = ({ status }: { status: RefundRequest["status"] }) => {
  if (status === "approved" || status === "completed") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8FCEB] text-[#0A7A07]"
        style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
      >
        <CheckCircle size={12} weight="fill" /> Reembolsado
      </span>
    );
  }
  
  if (status === "rejected") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCE8E8] text-[#D91B1B]"
        style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
      >
        <XCircle size={12} weight="fill" /> Rejeitado
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF9E6] text-[#B88B00]"
      style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
    >
      <Clock size={12} weight="bold" /> Pendente
    </span>
  );
};

export default function CancelamentosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [refunds, setRefunds] = useState<RefundRequest[]>(mockRefunds);

  const pendingCount = refunds.filter((r) => r.status === "pending").length;
  const pendingAmount = refunds
    .filter((r) => r.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredRequests = useMemo(() => {
    return refunds.filter((req) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        req.id.toLowerCase().includes(searchLower) ||
        req.order_id.toLowerCase().includes(searchLower) ||
        req.user_name.toLowerCase().includes(searchLower) ||
        (req.reason && req.reason.toLowerCase().includes(searchLower))
      );
    });
  }, [refunds, searchTerm]);

  const handleApprove = (id: string) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r))
    );
  };

  const handleReject = (id: string) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div>
        <h1
          className="text-2xl font-extrabold text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-0.5px" }}
        >
          Cancelamentos
        </h1>
        <p
          className="text-sm text-[#9A9A8F] mt-0.5"
          style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
        >
          {refunds.length} solicitações · {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingAmount)} pendente de reembolso
        </p>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius-card-sm,16px)] bg-[#FFF9E6] border border-[#F0E6CC]">
          <Warning size={18} weight="bold" className="text-[#B88B00] mt-0.5 shrink-0" />
          <p
            className="text-sm text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Você tem <strong>{pendingCount} {pendingCount === 1 ? 'reembolso pendente' : 'reembolsos pendentes'}</strong>. 
            Processe dentro de 5 dias úteis para evitar disputas com o processador de pagamento.
          </p>
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] flex flex-col min-h-[500px] overflow-hidden">
        
        <div className="p-5 border-b border-[#F0F0EB] flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-[#F7F7F2]/50">
          <h3
            className="text-[#0A0A0A] font-extrabold text-base"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
          >
            Solicitações de cancelamento de pedidos
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="ID do pedido, reembolso ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-[12px] bg-white border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                  style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                />
                <MagnifyingGlass
                  size={16}
                  weight="bold"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none"
                />
              </div>
            </div>

            <div className="flex w-full md:w-auto">
              <button
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-[#E0E0D8] bg-white rounded-[12px] text-[#0A0A0A] text-xs font-bold hover:bg-[#F7F7F2] transition-colors"
                style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
              >
                <DownloadSimple size={16} weight="bold" /> Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-[#9A9A8F] text-sm gap-3">
              <div className="w-12 h-12 bg-[#F0F0EB] rounded-full flex items-center justify-center text-[#5C5C52]">
                <Funnel size={24} weight="bold" />
              </div>
              <span style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}>
                {searchTerm
                  ? "Nenhuma solicitação encontrada para esta busca."
                  : "Ainda não existem solicitações de cancelamento."}
              </span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-[#F0F0EB]">
                <tr>
                  <th
                    className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest min-w-[140px]"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    ID Solicitação
                  </th>
                  <th
                    className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest min-w-[140px]"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    Pedido
                  </th>
                  <th
                    className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    Data
                  </th>
                  <th
                    className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest min-w-[200px]"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    Motivo
                  </th>
                  <th
                    className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    Valor
                  </th>
                  <th
                    className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest text-right min-w-[160px]"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-[#F0F0EB] text-sm text-[#0A0A0A]"
                style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
              >
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#F7F7F2] transition-colors"
                  >
                    <td
                      className="px-5 py-4 font-mono text-[11px] text-[#5C5C52]"
                      title={req.id}
                    >
                      {req.id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono text-[11px] text-[#0A0A0A] font-bold hover:underline cursor-pointer" title={req.order_id}>
                         {req.order_id}
                      </div>
                      <div className="text-[11px] text-[#5C5C52] mt-0.5">{req.user_name}</div>
                    </td>
                    <td className="px-5 py-4 text-[11px] text-[#5C5C52]">
                      {new Date(req.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td
                      className="px-5 py-4 text-[12px] text-[#5C5C52] max-w-[250px] truncate"
                      title={req.reason}
                    >
                      {req.reason || "Sem motivo informado"}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#0A0A0A]">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(req.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {req.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="text-[#0A7A07] hover:text-[#0A7A07] text-[10px] font-bold uppercase tracking-wider border border-[#0A7A07]/30 px-3 py-1.5 rounded-[8px] hover:bg-[#E8FCEB] transition-colors"
                            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="text-[#D91B1B] hover:text-[#D91B1B] text-[10px] font-bold uppercase tracking-wider border border-[#D91B1B]/30 px-3 py-1.5 rounded-[8px] hover:bg-[#FCE8E8] transition-colors"
                            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#9A9A8F] text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredRequests.length > 0 && (
          <div
            className="p-5 border-t border-[#F0F0EB] flex items-center justify-between text-xs text-[#5C5C52] bg-white"
            style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
          >
            <p>Mostrando {filteredRequests.length} solicitações</p>
            <div className="flex gap-1.5">
              <button
                className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-[#E0E0D8] text-[#9A9A8F] hover:bg-[#F0F0EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                &lt;
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-[8px] bg-[#0A0A0A] text-white font-bold shadow-sm">
                1
              </button>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-[#E0E0D8] text-[#9A9A8F] hover:bg-[#F0F0EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DownloadSimple, Info, Ticket, CircleNotch, XCircle } from "@phosphor-icons/react";
import { manageService, FinanceResumoData } from "@/services/manageService";
import { useAuth } from "@/context/AuthContext";

// ─── Formatador de Moeda ───────────────────────────────────────────────
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function FinanceiroResumoPage() {
  const params  = useParams();
  const slug    = params?.["org-slug"] as string | undefined;
  const eventId = params?.["id"]       as string | undefined;
  const { session } = useAuth();

  // ─── Estados ─────────────────────────────────────────────────────────
  const [data, setData]           = useState<FinanceResumoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // ─── Fetch dos Dados ─────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      if (!slug || !eventId || !session?.access_token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await manageService.getFinanceResumo(
          session.access_token,
          slug,
          eventId
        );
        setData((response as any).data ?? response);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados de resumo financeiro.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [slug, eventId, session?.access_token]);

  // ─── Loading ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <CircleNotch size={32} className="animate-spin text-[#9A9A8F]" />
      </div>
    );
  }

  // ─── Erro ────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <XCircle size={48} weight="fill" className="text-[#D91B1B] mb-4" />
        <h2 className="text-xl font-bold text-[#0A0A0A]">{error || "Erro desconhecido"}</h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-bold underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ─── UI Principal ────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.5px" }}
          >
            Resumo Financeiro
          </h1>
          <p
            className="text-sm text-[#9A9A8F] mt-0.5"
            style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
          >
            Consolidado até agora · repasse em 3 dias úteis após o evento
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-white border border-[#E0E0D8] text-xs font-bold text-[#0A0A0A] hover:bg-[#F7F7F2] transition-all shadow-sm uppercase tracking-wider"
          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
        >
          <DownloadSimple size={16} weight="bold" />
          Exportar PDF
        </button>
      </div>

      {/* Tabela de lotes */}
      <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] overflow-hidden flex flex-col h-fit">

        <div className="p-5 border-b border-[#F0F0EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F7F2]/50">
          <h3
            className="text-[#0A0A0A] font-extrabold text-base flex items-center gap-2"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
              <Ticket size={16} weight="bold" />
            </div>
            Performance por Lote
          </h3>
          <div
            className="flex items-center gap-2 text-[11px] font-bold text-[#5C5C52] bg-white border border-[#E0E0D8] px-3 py-1.5 rounded-full"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            <Info size={14} weight="bold" />
            <span>Líquido baseado nas transações reais</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-[#F0F0EB]">
              <tr>
                {[
                  { label: "Lote",              cls: "min-w-[180px]" },
                  { label: "Vendas / Progresso", cls: "min-w-[200px]" },
                  { label: "Preço (BRL)",        cls: "" },
                  { label: "Arrecadação",        cls: "text-right" },
                ].map((col) => (
                  <th
                    key={col.label}
                    className={`px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest ${col.cls}`}
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className="divide-y divide-[#F0F0EB] text-sm text-[#0A0A0A]"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              {data.batches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[#9A9A8F] text-sm">
                    Nenhum lote de ingresso encontrado para este evento.
                  </td>
                </tr>
              ) : (
                data.batches.map((batch) => {
                  const sold         = batch.quantity_sold;
                  const total        = batch.quantity_total ?? 0;
                  const remaining    = Math.max(0, total - sold);
                  const currentPrice = Number(batch.price);
                  const percentage   = total > 0 ? Math.round((sold / total) * 100) : 0;
                  const isSoldOut    = remaining === 0 && total > 0;

                  return (
                    <tr key={batch.id} className="hover:bg-[#F7F7F2] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#0A0A0A] flex items-center gap-2">
                          {batch.name}
                          {isSoldOut && (
                            <span
                              className="text-[9px] bg-[#FCE8E8] text-[#D91B1B] px-1.5 py-0.5 rounded-[4px] font-extrabold uppercase tracking-widest"
                              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                            >
                              Esgotado
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#5C5C52] mt-0.5">
                          Restam {remaining} de {total}
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
                        {formatCurrency(currentPrice)}
                      </td>

                      <td className="px-5 py-4 font-bold text-[#0A0A0A] text-right">
                        {formatCurrency(batch.net_revenue)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
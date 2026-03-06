"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  MagnifyingGlass,
  DownloadSimple,
  FunnelSimple,
  CheckCircle,
  Clock,
  XCircle,
  ArrowsDownUp,
  CaretLeft,
  CaretRight,
  CircleNotch
} from "@phosphor-icons/react";
import { manageService, FinancePainelData } from "@/services/manageService";
import { useAuth } from "@/context/AuthContext";

const PAGE_SIZE = 10;

type OrderStatus = "paid" | "pending" | "cancelled" | "refunded";

// ─── Status config ─────────────────────────────────────────────────────
const STATUS_META: Record<OrderStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  paid:      { label: "Pago",        icon: <CheckCircle size={13} weight="fill" />, cls: "bg-[#E8FCEB] text-[#0A7A07]" },
  pending:   { label: "Pendente",    icon: <Clock size={13} weight="fill" />,       cls: "bg-[#FFF8E1] text-[#A86A00]" },
  cancelled: { label: "Cancelado",   icon: <XCircle size={13} weight="fill" />,     cls: "bg-[#FCE8E8] text-[#D91B1B]" },
  refunded:  { label: "Reembolsado", icon: <ArrowDown size={13} weight="bold" />,   cls: "bg-[#F0F0EB] text-[#5C5C52]" },
};

const STATUSES: (OrderStatus | "Todos")[] = ["Todos", "paid", "pending", "cancelled", "refunded"];

// ─── Formatadores ──────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function FinanceiroPainelPage() {
  const params  = useParams();
  const slug    = params?.["org-slug"] as string | undefined;
  const eventId = params?.["id"] as string | undefined;
  const { session } = useAuth();

  // ─── Estados da API ──────────────────────────────────────────────────
  const [data, setData]         = useState<FinancePainelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // ─── Estados da Tabela ───────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos">("Todos");
  const [typeFilter, setTypeFilter]   = useState("Todos");
  const [sortAsc, setSortAsc]         = useState(false);
  const [page, setPage]               = useState(1);

  // ─── Lotes dinâmicos para filtro ────────────────────────────────────
  const ticketTypes = useMemo(() => {
    if (!data) return ["Todos"];
    const names = [...new Set(data.batches.map((b) => b.name))];
    return ["Todos", ...names];
  }, [data]);

  // ─── Fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      if (!slug || !eventId || !session?.access_token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await manageService.getFinancePainel(
          session.access_token,
          slug,
          eventId
        );
        setData((response as any).data ?? response);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados financeiros.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [slug, eventId, session?.access_token]);

  // ─── Transformação de Dados (API -> UI) ──────────────────────────────
  const kpis = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Receita bruta",   value: formatCurrency(data.kpis.gross_revenue), delta: "Total",    up: null  },
      { label: "Receita líquida", value: formatCurrency(data.kpis.net_revenue),   delta: "Líquido",  up: null  },
      { label: "Ticket médio",    value: formatCurrency(data.kpis.avg_ticket),    delta: "Média",    up: null  },
      {
        label: "Reembolsos",
        value: formatCurrency(data.kpis.refund_total),
        delta: `-${data.kpis.orders_cancelled} cancelamento${data.kpis.orders_cancelled !== 1 ? "s" : ""}`,
        up: false,
      },
    ];
  }, [data]);

  const salesByType = useMemo(() => {
    if (!data) return [];
    return data.batches.map((b) => ({
      label: `${b.name} · ${formatCurrency(b.price)}`,
      sold:  b.quantity_sold,
      total: b.quantity_total,
      pct:   b.quantity_total > 0 ? Math.round((b.quantity_sold / b.quantity_total) * 100) : 0,
    }));
  }, [data]);

  const recentSales = useMemo(() => {
    if (!data) return [];
    return data.orders
      .filter((o) => o.status === "paid")
      .slice(0, 5)
      .map((o) => ({
        name:  o.buyer_name  || "Sem Nome",
        type:  o.batch_name  || "-",
        value: formatCurrency(o.total_amount),
        time:  o.created_at,
      }));
  }, [data]);

  const allOrdersMapped = useMemo(() => {
    if (!data) return [];
    return data.orders.map((o) => ({
      id:             `#${o.id.substring(0, 6).toUpperCase()}`,
      rawId:          o.id,
      buyer:          o.buyer_name     || "Comprador não informado",
      email:          o.buyer_email    || "-",
      ticket_type:    o.batch_name     || "-",
      qty:            1,
      total:          formatCurrency(o.total_amount),
      rawTotal:       o.total_amount,
      status:         o.status as OrderStatus,
      payment_method: o.payment_method || "-",
      created_at:     o.created_at,
    }));
  }, [data]);

  // ─── Filtros e Paginação ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allOrdersMapped
      .filter((o) => {
        const q = search.toLowerCase();
        const matchSearch =
          o.buyer.toLowerCase().includes(q)  ||
          o.email.toLowerCase().includes(q)  ||
          o.id.toLowerCase().includes(q)     ||
          o.rawId.toLowerCase().includes(q);
        const matchStatus = statusFilter === "Todos" || o.status === statusFilter;
        const matchType   = typeFilter   === "Todos" || o.ticket_type.includes(typeFilter);
        return matchSearch && matchStatus && matchType;
      })
      .sort((a, b) =>
        sortAsc ? a.rawId.localeCompare(b.rawId) : b.rawId.localeCompare(a.rawId)
      );
  }, [allOrdersMapped, search, statusFilter, typeFilter, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilterChange = (fn: () => void) => { fn(); setPage(1); };
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  // ─── Loading ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
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
      <div>
        <h1
          className="text-2xl font-extrabold text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.5px" }}
        >
          Painel financeiro
        </h1>
        <p
          className="text-sm text-[#9A9A8F] mt-0.5"
          style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
        >
          Dados em tempo real · atualizado agora
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] p-4 md:p-5"
          >
            <p
              className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              {kpi.label}
            </p>
            <p
              className="text-xl md:text-2xl font-extrabold text-[#0A0A0A] leading-none mb-3"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.5px" }}
            >
              {kpi.value}
            </p>
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider ${
                kpi.up === true  ? "bg-[#E8FCEB] text-[#0A7A07]"
                : kpi.up === false ? "bg-[#FCE8E8] text-[#D91B1B]"
                : "bg-[#F0F0EB] text-[#5C5C52]"
              }`}
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              {kpi.up === true  && <ArrowUp   size={10} weight="bold" />}
              {kpi.up === false && <ArrowDown size={10} weight="bold" />}
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Vendas por lote */}
        <div className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] p-5 md:p-6">
          <h2
            className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-5"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            Vendas por lote
          </h2>
          <div className="space-y-5">
            {salesByType.length === 0 && (
              <p className="text-sm text-[#9A9A8F]">Nenhum lote registrado.</p>
            )}
            {salesByType.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-sm text-[#0A0A0A] font-bold"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-xs text-[#5C5C52]"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    <strong className="text-[#0A0A0A]">{item.sold}</strong> / {item.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#F0F0EB] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0A0A0A] transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <div className="text-right mt-1.5">
                  <span
                    className="text-[10px] font-bold text-[#9A9A8F]"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {item.pct}% CONCLUÍDO
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendas recentes */}
        <div className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] p-5 md:p-6">
          <h2
            className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            Vendas recentes
          </h2>
          <div className="space-y-0.5">
            {recentSales.length === 0 && (
              <p className="text-sm text-[#9A9A8F]">Nenhuma venda recente.</p>
            )}
            {recentSales.map((sale, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-3 rounded-[12px] hover:bg-[#F7F7F2] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-[#F0F0EB] flex items-center justify-center text-xs font-extrabold text-[#5C5C52] shrink-0 uppercase"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {sale.name[0]}
                  </div>
                  <div>
                    <p
                      className="text-sm text-[#0A0A0A] font-bold leading-tight"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      {sale.name}
                    </p>
                    <p
                      className="text-xs text-[#5C5C52]"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      {sale.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-extrabold text-[#0A7A07]"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {sale.value}
                  </p>
                  <p
                    className="text-[11px] text-[#9A9A8F]"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    {sale.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Orders table ── */}
      <div className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] overflow-hidden">

        {/* Table header */}
        <div className="px-5 md:px-6 py-4 border-b border-[#F0F0EB] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              className="text-sm font-extrabold text-[#0A0A0A]"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.3px" }}
            >
              Todos os pedidos
            </h2>
            <p
              className="text-xs text-[#9A9A8F] mt-0.5"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-[100px] text-xs font-bold text-[#5C5C52] bg-[#F0F0EB] hover:bg-[#E0E0D8] border border-[#E0E0D8] transition-all"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            <DownloadSimple size={13} weight="bold" />
            Exportar
          </button>
        </div>

        {/* Filters bar */}
        <div className="px-5 md:px-6 py-3 bg-[#FAFAF8] border-b border-[#F0F0EB] flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <MagnifyingGlass
              size={14}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]"
            />
            <input
              type="text"
              placeholder="Buscar comprador, e-mail, ID..."
              value={search}
              onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
              className="w-full pl-8 pr-3 py-2 rounded-[10px] bg-white border border-[#E0E0D8] text-xs text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <FunnelSimple size={13} weight="bold" className="text-[#9A9A8F] mr-0.5" />
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange(() => setStatusFilter(s))}
                className={`px-2.5 py-1 rounded-[100px] text-[10px] font-bold transition-all capitalize ${
                  statusFilter === s
                    ? "bg-[#0A0A0A] text-[#F7F7F2]"
                    : "bg-white text-[#5C5C52] border border-[#E0E0D8] hover:border-[#0A0A0A]/20"
                }`}
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                {s === "Todos" ? "Todos" : STATUS_META[s as OrderStatus]?.label}
              </button>
            ))}
          </div>

          {/* Lote pills — dinâmico */}
          <div className="flex items-center gap-1 flex-wrap">
            {ticketTypes.map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(() => setTypeFilter(t))}
                className={`px-2.5 py-1 rounded-[100px] text-[10px] font-bold transition-all ${
                  typeFilter === t
                    ? "bg-[#0A0A0A] text-[#F7F7F2]"
                    : "bg-white text-[#5C5C52] border border-[#E0E0D8] hover:border-[#0A0A0A]/20"
                }`}
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table — desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F7F7F2]">
              <tr>
                {[
                  { label: "Pedido", sortable: true },
                  { label: "Comprador" },
                  { label: "Lote" },
                  { label: "Qtd" },
                  { label: "Total" },
                  { label: "Pagamento" },
                  { label: "Status" },
                  { label: "Data" },
                ].map((col) => (
                  <th
                    key={col.label}
                    className="px-5 py-3 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest border-b border-[#F0F0EB] whitespace-nowrap"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleFilterChange(() => setSortAsc((v) => !v))}
                        className="flex items-center gap-1 hover:text-[#0A0A0A] transition-colors"
                      >
                        {col.label}
                        <ArrowsDownUp size={11} weight="bold" />
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F7F2]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-sm text-[#9A9A8F]"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                paginated.map((order) => {
                  const meta = STATUS_META[order.status] ?? STATUS_META.pending;
                  return (
                    <tr key={order.rawId} className="hover:bg-[#FAFAF8] transition-colors group">
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-bold text-[#5C5C52] font-mono uppercase"
                          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                        >
                          {order.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p
                          className="text-sm font-semibold text-[#0A0A0A] leading-tight"
                          style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                        >
                          {order.buyer}
                        </p>
                        <p
                          className="text-xs text-[#9A9A8F]"
                          style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                        >
                          {order.email}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F0F0EB] text-[#5C5C52]"
                          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                        >
                          {order.ticket_type}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 text-sm text-[#5C5C52] font-medium"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        {order.qty}x
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-sm font-extrabold text-[#0A0A0A]"
                          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                        >
                          {order.total}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs text-[#5C5C52] capitalize"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        {order.payment_method}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${meta.cls}`}
                          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs text-[#9A9A8F] whitespace-nowrap"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        {order.created_at}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Cards — mobile */}
        <div className="md:hidden divide-y divide-[#F0F0EB]">
          {filtered.length === 0 ? (
            <p
              className="px-5 py-10 text-center text-sm text-[#9A9A8F]"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              Nenhum pedido encontrado.
            </p>
          ) : (
            paginated.map((order) => {
              const meta = STATUS_META[order.status] ?? STATUS_META.pending;
              return (
                <div key={order.rawId} className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold text-[#9A9A8F] font-mono uppercase"
                        style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                      >
                        {order.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${meta.cls}`}
                        style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                    <p
                      className="text-sm font-semibold text-[#0A0A0A] truncate"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      {order.buyer}
                    </p>
                    <p
                      className="text-xs text-[#9A9A8F] mt-0.5"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      {order.ticket_type} · {order.qty}x ·{" "}
                      <span className="capitalize">{order.payment_method}</span> · {order.created_at}
                    </p>
                  </div>
                  <span
                    className="text-base font-extrabold text-[#0A0A0A] shrink-0"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {order.total}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination footer */}
        <div className="px-4 md:px-6 py-3 bg-[#FAFAF8] border-t border-[#F0F0EB] flex flex-wrap items-center justify-between gap-3">

          {/* Contagem + total filtrado */}
          <div className="flex items-center gap-3">
            <span
              className="text-xs text-[#9A9A8F]"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              {filtered.length === 0
                ? "0 pedidos"
                : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length}`}
            </span>
            <span
              className="hidden sm:inline text-xs font-bold text-[#0A7A07]"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              {formatCurrency(filtered.reduce((acc, o) => acc + o.rawTotal, 0))}
            </span>
          </div>

          {/* Controles de página */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5C5C52] hover:bg-[#E0E0D8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <CaretLeft size={14} weight="bold" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - safePage) <= 1) return true;
                  return false;
                })
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (
                    idx > 0 &&
                    typeof arr[idx - 1] === "number" &&
                    (p as number) - (arr[idx - 1] as number) > 1
                  ) {
                    acc.push("…");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-8 h-8 flex items-center justify-center text-xs text-[#9A9A8F]"
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-xs font-bold transition-all ${
                        safePage === p
                          ? "bg-[#0A0A0A] text-[#F7F7F2]"
                          : "text-[#5C5C52] hover:bg-[#E0E0D8]"
                      }`}
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5C5C52] hover:bg-[#E0E0D8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useMemo } from "react";
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
} from "@phosphor-icons/react";

const PAGE_SIZE = 10;

// ─── Mock data ────────────────────────────────────────────────────────
const kpis = [
  { label: "Receita bruta", value: "R$ 9.360", delta: "+12%", up: true },
  { label: "Receita líquida", value: "R$ 8.048", delta: "+10%", up: true },
  { label: "Ticket médio", value: "R$ 30,00", delta: "=", up: null },
  { label: "Reembolsos", value: "R$ 210", delta: "-3 cancelamentos", up: false },
];

const salesByType = [
  { label: "Pista · R$20", sold: 180, total: 250, pct: 72 },
  { label: "VIP · R$50", sold: 82, total: 150, pct: 55 },
  { label: "Camarote · R$80", sold: 50, total: 100, pct: 50 },
];

const recentSales = [
  { name: "Maria S.", type: "VIP", value: "R$50", time: "há 5min" },
  { name: "João P.", type: "Pista", value: "R$20", time: "há 8min" },
  { name: "Ana L.", type: "Camarote", value: "R$80", time: "há 22min" },
  { name: "Rafael C.", type: "Pista", value: "R$20", time: "há 34min" },
  { name: "Carla M.", type: "VIP", value: "R$50", time: "há 41min" },
];

type OrderStatus = "paid" | "pending" | "cancelled" | "refunded";

type Order = {
  id: string;
  buyer: string;
  email: string;
  ticket_type: string;
  qty: number;
  total: string;
  status: OrderStatus;
  payment_method: string;
  created_at: string;
};

const ALL_ORDERS: Order[] = [
  { id: "#00312", buyer: "Maria Silva",    email: "maria@usp.br",    ticket_type: "VIP",      qty: 1, total: "R$50",  status: "paid",      payment_method: "Cartão",  created_at: "02/06 · 14h32" },
  { id: "#00311", buyer: "João Pedro",     email: "joao@fau.br",     ticket_type: "Pista",    qty: 2, total: "R$40",  status: "paid",      payment_method: "PIX",     created_at: "02/06 · 14h28" },
  { id: "#00310", buyer: "Ana Luisa",      email: "ana@unifesp.br",  ticket_type: "Camarote", qty: 1, total: "R$80",  status: "paid",      payment_method: "Cartão",  created_at: "02/06 · 13h55" },
  { id: "#00309", buyer: "Rafael Costa",   email: "rafael@unesp.br", ticket_type: "Pista",    qty: 1, total: "R$20",  status: "pending",   payment_method: "PIX",     created_at: "02/06 · 13h40" },
  { id: "#00308", buyer: "Carla Moura",    email: "carla@puc.br",    ticket_type: "VIP",      qty: 1, total: "R$50",  status: "paid",      payment_method: "Cartão",  created_at: "01/06 · 22h10" },
  { id: "#00307", buyer: "Thiago Reis",    email: "thiago@usp.br",   ticket_type: "Pista",    qty: 3, total: "R$60",  status: "paid",      payment_method: "PIX",     created_at: "01/06 · 21h48" },
  { id: "#00306", buyer: "Lucas Mendes",   email: "lucas@fau.br",    ticket_type: "VIP",      qty: 1, total: "R$50",  status: "refunded",  payment_method: "Cartão",  created_at: "01/06 · 20h30" },
  { id: "#00305", buyer: "Beatriz F.",     email: "bia@unifesp.br",  ticket_type: "Pista",    qty: 1, total: "R$20",  status: "refunded",  payment_method: "PIX",     created_at: "01/06 · 18h05" },
  { id: "#00304", buyer: "André Torres",   email: "andre@unesp.br",  ticket_type: "Camarote", qty: 1, total: "R$80",  status: "cancelled", payment_method: "Cartão",  created_at: "31/05 · 17h22" },
  { id: "#00303", buyer: "Fernanda Lima",  email: "feh@puc.br",      ticket_type: "VIP",      qty: 2, total: "R$100", status: "paid",      payment_method: "Cartão",  created_at: "31/05 · 16h00" },
  { id: "#00302", buyer: "Pedro Alves",    email: "pedro@usp.br",    ticket_type: "Pista",    qty: 1, total: "R$20",  status: "pending",   payment_method: "PIX",     created_at: "30/05 · 11h15" },
  { id: "#00301", buyer: "Júlia Castro",   email: "julia@fau.br",    ticket_type: "Camarote", qty: 1, total: "R$80",  status: "paid",      payment_method: "PIX",     created_at: "29/05 · 09h50" },
];

// ─── Status config ─────────────────────────────────────────────────────
const STATUS_META: Record<OrderStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  paid:      { label: "Pago",        icon: <CheckCircle size={13} weight="fill" />, cls: "bg-[#E8FCEB] text-[#0A7A07]" },
  pending:   { label: "Pendente",    icon: <Clock size={13} weight="fill" />,       cls: "bg-[#FFF8E1] text-[#A86A00]" },
  cancelled: { label: "Cancelado",   icon: <XCircle size={13} weight="fill" />,     cls: "bg-[#FCE8E8] text-[#D91B1B]" },
  refunded:  { label: "Reembolsado", icon: <ArrowDown size={13} weight="bold" />,   cls: "bg-[#F0F0EB] text-[#5C5C52]" },
};

const TICKET_TYPES = ["Todos", "Pista", "VIP", "Camarote"];
const STATUSES: (OrderStatus | "Todos")[] = ["Todos", "paid", "pending", "cancelled", "refunded"];

export default function FinanceiroPainelPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos">("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return ALL_ORDERS.filter((o) => {
      const matchSearch =
        o.buyer.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase()) ||
        o.id.includes(search);
      const matchStatus = statusFilter === "Todos" || o.status === statusFilter;
      const matchType = typeFilter === "Todos" || o.ticket_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    }).sort((a, b) =>
      sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)
    );
  }, [search, statusFilter, typeFilter, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilterChange = (fn: () => void) => { fn(); setPage(1); };
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

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
                kpi.up === true ? "bg-[#E8FCEB] text-[#0A7A07]"
                : kpi.up === false ? "bg-[#FCE8E8] text-[#D91B1B]"
                : "bg-[#F0F0EB] text-[#5C5C52]"
              }`}
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              {kpi.up === true && <ArrowUp size={10} weight="bold" />}
              {kpi.up === false && <ArrowDown size={10} weight="bold" />}
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales by type */}
        <div className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] p-5 md:p-6">
          <h2
            className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-5"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            Vendas por lote
          </h2>
          <div className="space-y-5">
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

        {/* Recent sales */}
        <div className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] p-5 md:p-6">
          <h2
            className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            Vendas recentes
          </h2>
          <div className="space-y-0.5">
            {recentSales.map((sale, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-3 rounded-[12px] hover:bg-[#F7F7F2] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-[#F0F0EB] flex items-center justify-center text-xs font-extrabold text-[#5C5C52] shrink-0"
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
                {s === "Todos" ? "Todos" : STATUS_META[s as OrderStatus].label}
              </button>
            ))}
          </div>

          {/* Type pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {TICKET_TYPES.map((t) => (
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
                  const meta = STATUS_META[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors group">
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-bold text-[#5C5C52] font-mono"
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
                        className="px-5 py-3.5 text-xs text-[#5C5C52]"
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
              const meta = STATUS_META[order.status];
              return (
                <div key={order.id} className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold text-[#9A9A8F] font-mono"
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
                      {order.ticket_type} · {order.qty}x · {order.payment_method} · {order.created_at}
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

        {/* Table footer — pagination */}
        <div className="px-4 md:px-6 py-3 bg-[#FAFAF8] border-t border-[#F0F0EB] flex flex-wrap items-center justify-between gap-3">
          {/* Left: counts */}
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
              {filtered.reduce((acc, o) => acc + parseInt(o.total.replace(/\D/g, ""), 10), 0)
                .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          {/* Right: page controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5C5C52] hover:bg-[#E0E0D8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <CaretLeft size={14} weight="bold" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - safePage) <= 1) return true;
                  return false;
                })
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) {
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

              {/* Next */}
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
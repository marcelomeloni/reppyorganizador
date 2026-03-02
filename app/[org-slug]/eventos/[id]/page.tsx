"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  CurrencyDollar,
  Users,
  TrendUp,
  CalendarBlank,
  MapPin,
  ArrowRight,
  WarningCircle,
  CheckCircle,
  ShareFat
} from "@phosphor-icons/react";

// --- MOCK DATA (Substitua depois pelo seu Context/API) ---
const mockEvent = {
  id: "evt_123",
  title: "Calourada FAUUSP 2026",
  status: "published", // Pode ser 'published', 'draft' ou 'cancelled'
  start_date: "2026-06-14T22:00:00Z",
  start_time: "22h",
  location: { city: "Largo da Batata, SP" },
  public_url: "reppy.com.br/calourada-fauusp",
};

const mockOverview = {
  stats: {
    tickets_sold: 312,
    net_revenue: 9360.00,
  }
};

const mockFinance = {
  batches: [
    { id: "b1", quantity_total: 250 },
    { id: "b2", quantity_total: 150 },
    { id: "b3", quantity_total: 100 },
  ],
  // Simulando 289 pagos e 3 cancelados
  orders_list: [
    ...Array(289).fill({ status: "paid" }),
    ...Array(3).fill({ status: "cancelled" }),
  ]
};
// ---------------------------------------------------------

export default function EventDashboard() {
  // Inicializando com os mocks
  const event = mockEvent;
  const finance = mockFinance;
  const overview = mockOverview;
  
  const [copied, setCopied] = useState(false);

  const isCancelled = event?.status === "cancelled";

  const statsData = useMemo(() => {
    if (!finance || !overview) return null;

    const totalCapacity = finance.batches.reduce((acc, batch) => acc + (batch.quantity_total || 0), 0);
    const approved = finance.orders_list.filter((o) => o.status === "paid").length;
    const cancelled = finance.orders_list.filter((o) => ["cancelled", "refunded"].includes(o.status)).length;
    
    // Taxa de conversão mockada para exemplo
    const conversionRate = "62,4%"; 

    return [
      {
        label: "Ingressos vendidos",
        value: overview.stats.tickets_sold,
        sub: `de ${totalCapacity}`,
        icon: <Ticket size={20} weight="bold" />,
        iconColor: "text-[#0A7A07]",
        iconBg: "bg-[#E8FCEB]",
      },
      {
        label: "Receita bruta",
        value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(overview.stats.net_revenue || 0),
        sub: "Consolidado total",
        icon: <CurrencyDollar size={20} weight="bold" />,
        iconColor: "text-[#0A7A07]",
        iconBg: "bg-[#E8FCEB]",
      },
      {
        label: "Pedidos aprovados",
        value: approved,
        sub: `${cancelled} cancelamentos`,
        icon: <Users size={20} weight="bold" />,
        iconColor: "text-[#6B1FD4]",
        iconBg: "bg-[#F3E8FF]",
      },
      {
        label: "Taxa de conversão",
        value: conversionRate,
        sub: "visitantes → compra",
        icon: <TrendUp size={20} weight="bold" />,
        iconColor: "text-[#0A7A07]",
        iconBg: "bg-[#E8FCEB]",
      },
    ];
  }, [finance, overview]);

  const quickLinks = [
    { label: "Ver painel financeiro", href: `/organizer/eventos/${event?.id}/financeiro/painel` },
    { label: "Lista de participantes", href: `/organizer/eventos/${event?.id}/participantes/lista` },
    { label: "Criar cupom de desconto", href: `/organizer/eventos/${event?.id}/financeiro/cupons` },
    { label: "Enviar comunicado", href: `/organizer/eventos/${event?.id}/participantes/comunicados` },
  ];

  const handleCopyLink = () => {
    if (event?.public_url) {
      navigator.clipboard.writeText(`https://${event.public_url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {isCancelled && (
        <div className="bg-[#FCE8E8] border border-[#F8B4B4] p-4 rounded-[var(--radius-card-sm,16px)] flex items-start gap-3">
          <WarningCircle size={20} weight="bold" className="text-[#D91B1B] shrink-0 mt-0.5" />
          <div>
            <h3 
              className="text-[#D91B1B] font-bold text-sm"
              style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
            >
              Este evento foi cancelado
            </h3>
            <p 
              className="text-[#D91B1B]/80 text-xs mt-1"
              style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
            >
              As vendas foram suspensas. Os usuários que já compraram ingressos podem solicitar reembolso.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="rounded-[var(--radius-card-lg,28px)] bg-[#0A0A0A] overflow-hidden shadow-sm">
        <div className={`h-32 md:h-40 relative ${isCancelled ? 'bg-gradient-to-br from-[#1a1a1a] to-[#333]' : 'bg-gradient-to-br from-[#1BFF11]/25 via-[#0A0A0A] to-[#8B2FFF]/20'}`}>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23ffffff10' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="px-5 md:px-6 pb-5 pt-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1
                className="text-[22px] md:text-[28px] font-extrabold text-[#F7F7F2] leading-tight"
                style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-1px" }}
              >
                {event.title}
              </h1>
              <div
                className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-sm text-[#9A9A8F]"
                style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
              >
                <span className="flex items-center gap-1.5">
                  <CalendarBlank size={14} weight="bold" />
                  {new Date(event.start_date).toLocaleDateString("pt-BR", { day: 'numeric', month: 'short' })} · {event.start_time || "22h"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} weight="bold" />
                  {event.location?.city || "Local"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] text-[#F7F7F2] hover:bg-[#333] transition-colors"
                title="Copiar link do evento"
              >
                {copied ? <CheckCircle size={14} weight="bold" className="text-[#1BFF11]" /> : <ShareFat size={14} weight="fill" />}
              </button>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                  isCancelled 
                    ? "bg-[#D91B1B]/10 text-[#D91B1B] border-[#D91B1B]/20"
                    : event.status === "published"
                    ? "bg-[#1BFF11]/10 text-[#1BFF11] border-[#1BFF11]/20"
                    : "bg-[#F0F0EB]/10 text-[#F7F7F2] border-[#F0F0EB]/20"
                }`}
                style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
              >
                {!isCancelled && event.status === "published" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1BFF11] animate-pulse" />
                )}
                {isCancelled ? "CANCELADO" : (event.status === "published" ? "PUBLICADO" : "RASCUNHO")}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsData?.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] p-4 flex flex-col gap-3 shadow-sm"
          >
            <div
              className={`w-9 h-9 rounded-[10px] ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}
            >
              {stat.icon}
            </div>
            <div>
              <p
                className="text-[20px] md:text-[22px] font-extrabold text-[#0A0A0A] leading-none"
                style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-0.5px" }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs text-[#9A9A8F] mt-1"
                style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
              >
                {stat.sub}
              </p>
            </div>
            <p
              className="text-xs text-[#5C5C52] mt-auto font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
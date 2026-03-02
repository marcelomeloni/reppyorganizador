"use client";

import { ArrowDown, ArrowUp } from "@phosphor-icons/react";

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

export default function FinanceiroPainelPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div>
        <h1
          className="text-2xl font-extrabold text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-0.5px" }}
        >
          Painel financeiro
        </h1>
        <p
          className="text-sm text-[#9A9A8F] mt-0.5"
          style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
        >
          Dados em tempo real · atualizado agora
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] shadow-sm p-5"
          >
            <p
              className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
              style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
            >
              {kpi.label}
            </p>
            <p
              className="text-2xl font-extrabold text-[#0A0A0A] leading-none mb-3"
              style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-0.5px" }}
            >
              {kpi.value}
            </p>
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider ${
                kpi.up === true
                  ? "bg-[#E8FCEB] text-[#0A7A07]"
                  : kpi.up === false
                  ? "bg-[#FCE8E8] text-[#D91B1B]"
                  : "bg-[#F0F0EB] text-[#5C5C52]"
              }`}
              style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
            >
              {kpi.up === true && <ArrowUp size={10} weight="bold" />}
              {kpi.up === false && <ArrowDown size={10} weight="bold" />}
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] shadow-sm p-6">
          <h2
            className="text-xs font-bold text-[#9A9A8F] uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
          >
            Vendas por lote
          </h2>
          <div className="space-y-5">
            {salesByType.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-sm text-[#0A0A0A] font-bold"
                    style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-xs text-[#5C5C52] font-medium"
                    style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                  >
                    <strong className="text-[#0A0A0A]">{item.sold}</strong> / {item.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#F0F0EB] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0A0A0A] transition-all duration-500 ease-out"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <div className="text-right mt-1.5">
                  <span
                    className="text-[11px] font-bold text-[#9A9A8F]"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    {item.pct}% CONCLUÍDO
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] shadow-sm p-6">
          <h2
            className="text-xs font-bold text-[#9A9A8F] uppercase tracking-widest mb-5"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
          >
            Vendas recentes
          </h2>
          <div className="space-y-1">
            {recentSales.map((sale, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-3 rounded-[12px] hover:bg-[#F7F7F2] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-9 h-9 rounded-full bg-[#F0F0EB] flex items-center justify-center text-xs font-extrabold text-[#5C5C52]"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    {sale.name[0]}
                  </div>
                  <div>
                    <p
                      className="text-sm text-[#0A0A0A] font-bold leading-tight"
                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                      {sale.name}
                    </p>
                    <p
                      className="text-xs text-[#5C5C52] mt-0.5"
                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                      {sale.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-extrabold text-[#0A7A07]"
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    {sale.value}
                  </p>
                  <p
                    className="text-[11px] text-[#9A9A8F] mt-0.5"
                    style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                  >
                    {sale.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
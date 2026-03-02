"use client";

import { useState, useMemo } from "react";
import {
  MagnifyingGlass,
  DownloadSimple,
  Plus,
  Trash,
  Power,
  Ticket,
  CheckCircle,
  EyeSlash,
  XCircle,
  Funnel,
} from "@phosphor-icons/react";

import AddCouponModal from "./AddCouponModal";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  used_count: number;
  max_uses: number | null;
  expires_at: string | null;
  active: boolean;
};

const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "CALOURO10",
    discount_type: "percentage",
    discount_value: 10,
    used_count: 42,
    max_uses: 100,
    expires_at: "2026-06-14T23:59:59Z",
    active: true,
  },
  {
    id: "2",
    code: "FAUUSP20",
    discount_type: "fixed",
    discount_value: 20,
    used_count: 18,
    max_uses: 50,
    expires_at: "2026-06-13T23:59:59Z",
    active: true,
  },
  {
    id: "3",
    code: "VIP30OFF",
    discount_type: "percentage",
    discount_value: 30,
    used_count: 50,
    max_uses: 50,
    expires_at: "2026-06-10T23:59:59Z",
    active: false,
  },
  {
    id: "4",
    code: "PROMO50",
    discount_type: "fixed",
    discount_value: 50,
    used_count: 5,
    max_uses: null,
    expires_at: "2025-12-31T23:59:59Z",
    active: true,
  },
];

const KpiCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <div className="bg-white p-5 rounded-[var(--radius-card-sm,16px)] shadow-sm border border-[#E0E0D8] flex items-center justify-between">
    <div>
      <p
        className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
        style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
      >
        {title}
      </p>
      <h3
        className="text-2xl font-extrabold text-[#0A0A0A] leading-none"
        style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-0.5px" }}
      >
        {value}
      </h3>
    </div>
    <div className="w-10 h-10 rounded-[10px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
      {icon}
    </div>
  </div>
);

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeCount = coupons.filter((c) => c.active).length;
  const inactiveCount = coupons.filter((c) => !c.active).length;
  const expiredCount = coupons.filter(
    (c) => c.expires_at && new Date(c.expires_at) < new Date()
  ).length;

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coupons, searchTerm]);

  const handleToggleStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cupom permanentemente?")) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div>
          <h1
            className="text-2xl font-extrabold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-0.5px" }}
          >
            Cupons de Desconto
          </h1>
          <p
            className="text-sm text-[#9A9A8F] mt-0.5"
            style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Gerencie promoções e acompanhe o uso dos cupons no seu evento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total de Cupons" value={coupons.length} icon={<Ticket size={20} weight="bold" />} />
          <KpiCard title="Ativos" value={activeCount} icon={<CheckCircle size={20} weight="bold" />} />
          <KpiCard title="Inativos" value={inactiveCount} icon={<EyeSlash size={20} weight="bold" />} />
          <KpiCard title="Expirados" value={expiredCount} icon={<XCircle size={20} weight="bold" />} />
        </div>

        <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] flex flex-col min-h-[500px] overflow-hidden">
          
          <div className="p-5 border-b border-[#F0F0EB] flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-[#F7F7F2]/50">
            <h3
              className="text-[#0A0A0A] font-extrabold text-base"
              style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
            >
              Lista de Cupons
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Buscar por código..."
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

              <div className="flex w-full md:w-auto gap-2">
                <button
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[#E0E0D8] bg-white rounded-[12px] text-[#0A0A0A] text-xs font-bold hover:bg-[#F7F7F2] transition-colors"
                  style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                >
                  <DownloadSimple size={16} weight="bold" /> Exportar
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0A0A0A] text-[#F7F7F2] rounded-[12px] text-xs font-bold hover:bg-[#222] transition-colors shadow-sm"
                  style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                >
                  <Plus size={16} weight="bold" /> Novo Cupom
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            {filteredCoupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-[#9A9A8F] text-sm gap-3">
                <div className="w-12 h-12 bg-[#F0F0EB] rounded-full flex items-center justify-center text-[#5C5C52]">
                  <Funnel size={24} weight="bold" />
                </div>
                <span style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}>
                  {searchTerm
                    ? "Nenhum cupom encontrado para essa busca."
                    : "Nenhum cupom cadastrado no momento."}
                </span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-[#F0F0EB]">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                      Código
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                      Desconto
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                      Usos / Limite
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                      Validade
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                      Status
                    </th>
                    <th className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest text-right" style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-[#F0F0EB] text-sm text-[#0A0A0A]"
                  style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                >
                  {filteredCoupons.map((coupon) => {
                    const isPercentage = coupon.discount_type === "percentage";
                    const discountLabel = isPercentage
                      ? `${coupon.discount_value}%`
                      : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(coupon.discount_value);
                    const limitLabel = coupon.max_uses ? coupon.max_uses : "∞";
                    const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();

                    return (
                      <tr key={coupon.id} className="hover:bg-[#F7F7F2] transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-[#0A0A0A] tracking-wide">
                          {coupon.code}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#0A7A07]">
                          {discountLabel}
                        </td>
                        <td className="px-5 py-4 text-[#5C5C52]">
                          <span className="font-bold text-[#0A0A0A]">{coupon.used_count}</span> <span className="text-[#E0E0D8]">/</span> {limitLabel}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-[#5C5C52]">
                          {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("pt-BR") : "Sem validade"}
                          {isExpired && <span className="text-[#D91B1B] font-bold ml-1.5">Expirado</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              coupon.active
                                ? "bg-[#E8FCEB] text-[#0A7A07]"
                                : "bg-[#E0E0D8]/40 text-[#5C5C52]"
                            }`}
                            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                coupon.active ? "bg-[#1BFF11]" : "bg-[#9A9A8F]"
                              }`}
                            />
                            {coupon.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(coupon.id)}
                              className={`p-1.5 rounded-md transition-colors ${
                                coupon.active
                                  ? "text-[#0A7A07] hover:bg-[#E8FCEB]"
                                  : "text-[#9A9A8F] hover:bg-[#E0E0D8]/50 hover:text-[#0A0A0A]"
                              }`}
                              title={coupon.active ? "Desativar Cupom" : "Ativar Cupom"}
                            >
                              <Power size={18} weight="bold" />
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="p-1.5 rounded-md text-[#9A9A8F] hover:bg-[#FCE8E8] hover:text-[#D91B1B] transition-colors"
                              title="Excluir Cupom"
                            >
                              <Trash size={18} weight="bold" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    
    {isModalOpen && (
        <AddCouponModal onClose={() => setIsModalOpen(false)} />
      )}
  
    </>
  );
}
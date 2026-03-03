"use client";

import { useState } from "react";
import {
  User,
  IdentificationCard,
  Phone,
  Ticket,
  CheckCircle,
  CircleNotch,
  Warning,
  Receipt,
  Stack,
  CaretDown,
} from "@phosphor-icons/react";

// ─── Mock data — replace with real API/context ────────────────────────
const TICKET_CATEGORIES = [
  {
    id: "cat-1",
    name: "Pista",
    batches: [
      { id: "b-1", name: "1º Lote", price: 20, available: 48 },
      { id: "b-2", name: "2º Lote", price: 25, available: 12 },
    ],
  },
  {
    id: "cat-2",
    name: "VIP",
    batches: [
      { id: "b-3", name: "Lote único", price: 50, available: 8 },
    ],
  },
  {
    id: "cat-3",
    name: "Camarote",
    batches: [
      { id: "b-4", name: "Lote único", price: 80, available: 0 },
    ],
  },
];

type IssuedTicket = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  category: string;
  batch: string;
  price: number;
  issuedAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────
function maskCPF(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

// ─── Component ────────────────────────────────────────────────────────
export default function PromoterPage() {
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    phone: "",
    categoryId: "",
    batchId: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<IssuedTicket | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<IssuedTicket[]>([]);

  const selectedCategory = TICKET_CATEGORIES.find((c) => c.id === form.categoryId);
  const selectedBatch = selectedCategory?.batches.find((b) => b.id === form.batchId);

  const isValid =
    form.name.trim().length >= 3 &&
    form.cpf.replace(/\D/g, "").length === 11 &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    form.categoryId &&
    form.batchId;

  const handleChange = (field: string, value: string) => {
    setError("");
    if (field === "categoryId") {
      setForm((p) => ({ ...p, categoryId: value, batchId: "" }));
    } else {
      setForm((p) => ({ ...p, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!isValid || !selectedCategory || !selectedBatch) return;
    if (selectedBatch.available === 0) {
      setError("Este lote está esgotado.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Replace with real API call
      await new Promise((r) => setTimeout(r, 1200));

      const issued: IssuedTicket = {
        id: `#${String(Math.floor(Math.random() * 9000) + 1000)}`,
        name: form.name,
        cpf: form.cpf,
        phone: form.phone,
        category: selectedCategory.name,
        batch: selectedBatch.name,
        price: selectedBatch.price,
        issuedAt: new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setSuccess(issued);
      setHistory((prev) => [issued, ...prev]);
      setForm({ name: "", cpf: "", phone: "", categoryId: "", batchId: "" });
    } catch {
      setError("Erro ao emitir ingresso. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-extrabold text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.5px" }}
        >
          Emissão de ingresso
        </h1>
        <p
          className="text-sm text-[#9A9A8F] mt-0.5"
          style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
        >
          Preencha os dados do comprador e emita o ingresso manualmente.
        </p>
      </div>

      <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Success banner */}
          {success && (
            <div className="flex items-start gap-3 p-4 rounded-[var(--radius-card-sm,16px)] bg-[#E8FCEB] border border-[#1BFF11]/30">
              <CheckCircle size={20} weight="fill" className="text-[#0A7A07] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p
                  className="text-sm font-bold text-[#0A7A07]"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  Ingresso emitido — {success.id}
                </p>
                <p
                  className="text-xs text-[#0A7A07]/80 mt-0.5"
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                >
                  {success.name} · {success.category} {success.batch} · R${success.price}
                </p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-[#0A7A07]/60 hover:text-[#0A7A07] transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-[var(--radius-card-sm,16px)] bg-[#FCE8E8] border border-[#FF2D2D]/20">
              <Warning size={18} weight="fill" className="text-[#D91B1B] shrink-0" />
              <p
                className="text-sm text-[#D91B1B]"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Buyer data */}
          <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-[8px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
                <User size={15} weight="bold" />
              </div>
              <h2
                className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Dados do comprador
              </h2>
            </div>

            {/* Nome */}
            <div>
              <label
                className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Nome completo
              </label>
              <div className="relative">
                <User
                  size={15}
                  weight="bold"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]"
                />
                <input
                  type="text"
                  placeholder="ex: Maria da Silva Santos"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                />
              </div>
            </div>

            {/* CPF + Phone */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  CPF
                </label>
                <div className="relative">
                  <IdentificationCard
                    size={15}
                    weight="bold"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => handleChange("cpf", maskCPF(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors font-mono tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone
                    size={15}
                    weight="bold"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]"
                  />
                  <input
                    type="text"
                    inputMode="tel"
                    placeholder="(11) 99999-9999"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", maskPhone(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors font-mono tracking-wider"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ticket selection */}
          <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-[8px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
                <Ticket size={15} weight="bold" />
              </div>
              <h2
                className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Ingresso
              </h2>
            </div>

            {/* Category dropdown */}
            <div>
              <label
                className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Categoria
              </label>
              <div className="relative">
                <Stack
                  size={15}
                  weight="bold"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none"
                />
                <select
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  className="w-full pl-9 pr-9 py-3 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors appearance-none cursor-pointer"
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                >
                  <option value="">Selecione a categoria...</option>
                  {TICKET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={14}
                  weight="bold"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none"
                />
              </div>
            </div>

            {/* Batch dropdown */}
            <div>
              <label
                className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Lote
              </label>
              <div className="relative">
                <Receipt
                  size={15}
                  weight="bold"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none"
                />
                <select
                  value={form.batchId}
                  onChange={(e) => handleChange("batchId", e.target.value)}
                  disabled={!form.categoryId}
                  className="w-full pl-9 pr-9 py-3 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                >
                  <option value="">
                    {form.categoryId ? "Selecione o lote..." : "Selecione a categoria primeiro"}
                  </option>
                  {selectedCategory?.batches.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.available === 0}>
                      {b.name} · R${b.price}
                      {b.available === 0 ? " — ESGOTADO" : ` (${b.available} disponíveis)`}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={14}
                  weight="bold"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none"
                />
              </div>
            </div>

            {/* Selected batch pill */}
            {selectedBatch && (
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-[12px] border ${
                  selectedBatch.available === 0
                    ? "bg-[#FCE8E8] border-[#FF2D2D]/20"
                    : "bg-[#F0F0EB] border-[#E0E0D8]"
                }`}
              >
                <div>
                  <p
                    className="text-xs font-bold text-[#5C5C52] uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {selectedCategory?.name} · {selectedBatch.name}
                  </p>
                  <p
                    className="text-[11px] text-[#9A9A8F] mt-0.5"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    {selectedBatch.available === 0
                      ? "Lote esgotado"
                      : `${selectedBatch.available} ingressos disponíveis`}
                  </p>
                </div>
                <span
                  className="text-lg font-extrabold text-[#0A0A0A]"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.5px" }}
                >
                  R${selectedBatch.price}
                </span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading || selectedBatch?.available === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[100px] bg-[#0A0A0A] text-[#F7F7F2] font-bold text-sm hover:bg-[#222] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            {loading ? (
              <CircleNotch size={18} weight="bold" className="animate-spin" />
            ) : (
              <Ticket size={18} weight="bold" />
            )}
            {loading ? "Emitindo ingresso..." : "Emitir ingresso"}
          </button>

          <p
            className="text-center text-[11px] text-[#9A9A8F]"
            style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
          >
            O ingresso será enviado por e-mail.
          </p>
        </div>

        {/* ── History ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#0A0A0A] rounded-full" />
            <h2
              className="text-xs font-bold text-[#5C5C52] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              Emitidos nesta sessão
            </h2>
            {history.length > 0 && (
              <span
                className="ml-auto px-2 py-0.5 rounded-full bg-[#0A0A0A] text-[#F7F7F2] text-[10px] font-bold"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                {history.length}
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] border-dashed p-8 text-center">
              <Ticket size={28} weight="thin" className="text-[#D0D0C8] mx-auto mb-2" />
              <p
                className="text-sm text-[#9A9A8F]"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                Nenhum ingresso emitido ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((t) => (
                <div
                  key={t.id + t.issuedAt}
                  className="bg-white rounded-[var(--radius-card-sm,16px)] border border-[#E0E0D8] px-4 py-3.5 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F0F0EB] flex items-center justify-center text-xs font-extrabold text-[#5C5C52] shrink-0 mt-0.5"
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                    >
                      {t.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold text-[#0A0A0A] leading-tight"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-xs text-[#9A9A8F] mt-0.5"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        {t.category} · {t.batch}
                      </p>
                      <p
                        className="text-[10px] text-[#9A9A8F] mt-0.5 font-mono"
                      >
                        {t.id} · {t.issuedAt}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="text-sm font-extrabold text-[#0A7A07]"
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                    >
                      R${t.price}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#0A7A07]"
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                    >
                      <CheckCircle size={11} weight="fill" />
                      Emitido
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { X, Funnel } from "@phosphor-icons/react";

type Filter = {
  id: string;
  type: string;
  value: string;
  label: string;
};

type Props = {
  onClose: () => void;
  onAddFilter: (filter: Filter) => void;
};

const FILTER_TYPES = [
  { value: "payment_status", label: "Status de Pagamento" },
  { value: "category_type", label: "Categoria" },
  { value: "check_in", label: "Check-in" },
];

const FILTER_VALUES: Record<string, { value: string; label: string }[]> = {
  payment_status: [
    { value: "paid", label: "Pago" },
    { value: "pending", label: "Pendente" },
    { value: "cancelled", label: "Cancelado" },
  ],
  category_type: [
    { value: "Pista", label: "Pista" },
    { value: "VIP", label: "VIP" },
    { value: "Camarote", label: "Camarote" },
  ],
  check_in: [
    { value: "Sim", label: "Fez check-in" },
    { value: "Não", label: "Não fez check-in" },
  ],
};

export default function AddFilterModal({ onClose, onAddFilter }: Props) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const availableValues = selectedType ? FILTER_VALUES[selectedType] ?? [] : [];

  const handleApply = () => {
    if (!selectedType || !selectedValue) return;
    const typeLabel = FILTER_TYPES.find((t) => t.value === selectedType)?.label ?? selectedType;
    const valueLabel =
      availableValues.find((v) => v.value === selectedValue)?.label ?? selectedValue;
    onAddFilter({
      id: `${selectedType}-${selectedValue}-${Date.now()}`,
      type: selectedType,
      value: selectedValue,
      label: `${typeLabel}: ${valueLabel}`,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-[#F7F7F2] rounded-[var(--radius-card-lg,28px)] shadow-2xl w-full max-w-sm border border-[#E0E0D8]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E0E0D8] flex items-center justify-between bg-white rounded-t-[28px]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
              <Funnel size={15} weight="bold" />
            </div>
            <h3
              className="font-extrabold text-[#0A0A0A] text-sm"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              Adicionar filtro
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[10px] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label
              className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              Filtrar por
            </label>
            <div className="flex flex-col gap-1.5">
              {FILTER_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value);
                    setSelectedValue("");
                  }}
                  className={`text-left px-4 py-2.5 rounded-[12px] text-sm font-medium transition-all border ${
                    selectedType === type.value
                      ? "bg-[#0A0A0A] text-[#F7F7F2] border-[#0A0A0A]"
                      : "bg-white text-[#5C5C52] border-[#E0E0D8] hover:border-[#0A0A0A]/20 hover:text-[#0A0A0A]"
                  }`}
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value */}
          {selectedType && (
            <div>
              <label
                className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Valor
              </label>
              <div className="flex flex-wrap gap-2">
                {availableValues.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setSelectedValue(v.value)}
                    className={`px-3 py-1.5 rounded-[100px] text-xs font-bold transition-all border ${
                      selectedValue === v.value
                        ? "bg-[#1BFF11] text-[#0A0A0A] border-[#1BFF11]"
                        : "bg-white text-[#5C5C52] border-[#E0E0D8] hover:border-[#0A0A0A]/30"
                    }`}
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[100px] text-sm font-semibold text-[#9A9A8F] hover:text-[#0A0A0A] transition-colors"
            style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedType || !selectedValue}
            className="px-5 py-2 rounded-[100px] bg-[#0A0A0A] text-[#F7F7F2] text-sm font-bold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
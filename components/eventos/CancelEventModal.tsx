"use client";

import { useState } from "react";
import { X, Warning, CircleNotch, Trash } from "@phosphor-icons/react";

type Props = {
  eventTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function CancelEventModal({ eventTitle, onClose, onConfirm }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const CONFIRM_WORD = "CANCELAR";
  const isValid = confirmation === CONFIRM_WORD;

  const handleConfirm = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.45)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-[#F7F7F2] rounded-[var(--radius-card-lg,28px)] shadow-2xl w-full max-w-md border border-[#E0E0D8] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-[#E0E0D8] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#FCE8E8] flex items-center justify-center shrink-0">
              <Warning size={18} weight="fill" className="text-[#D91B1B]" />
            </div>
            <div>
              <h2
                className="font-extrabold text-[#0A0A0A] text-base"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.3px" }}
              >
                Cancelar evento
              </h2>
              <p
                className="text-xs text-[#9A9A8F] mt-0.5"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                Esta ação não pode ser desfeita
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all shrink-0"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Warning list */}
          <div className="bg-[#FCE8E8] rounded-[12px] border border-[#FF2D2D]/15 p-4 space-y-2">
            {[
              "As vendas serão suspensas imediatamente",
              "Os participantes serão notificados por e-mail",
              "Os compradores poderão solicitar reembolso",
              "O evento será removido da listagem pública",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D91B1B] shrink-0 mt-1.5" />
                <p
                  className="text-xs text-[#D91B1B]"
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>

          {/* Event name display */}
          <div className="bg-[#F0F0EB] rounded-[12px] px-4 py-3 border border-[#E0E0D8]">
            <p
              className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              Evento
            </p>
            <p
              className="text-sm font-bold text-[#0A0A0A]"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              {eventTitle}
            </p>
          </div>

          {/* Confirmation input */}
          <div>
            <label
              className="block text-[11px] font-bold text-[#5C5C52] uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              Digite{" "}
              <span className="text-[#D91B1B] font-mono tracking-widest">
                {CONFIRM_WORD}
              </span>{" "}
              para confirmar
            </label>
            <input
              type="text"
              placeholder={CONFIRM_WORD}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
              className={`w-full px-4 py-3 rounded-[12px] bg-white border text-sm font-mono tracking-widest text-[#0A0A0A] placeholder-[#D0D0C8] focus:outline-none transition-colors ${
                confirmation && !isValid
                  ? "border-[#FF2D2D]/40 bg-[#FCE8E8]/30"
                  : isValid
                  ? "border-[#1BFF11]/40 bg-[#E8FCEB]/30"
                  : "border-[#E0E0D8] focus:border-[#0A0A0A]/30"
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[100px] text-sm font-semibold text-[#5C5C52] bg-[#F0F0EB] hover:bg-[#E0E0D8] border border-[#E0E0D8] transition-all"
            style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
          >
            Voltar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[100px] text-sm font-bold bg-[#D91B1B] text-white hover:bg-[#b81717] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            {loading ? (
              <CircleNotch size={16} weight="bold" className="animate-spin" />
            ) : (
              <Trash size={16} weight="bold" />
            )}
            {loading ? "Cancelando..." : "Cancelar evento"}
          </button>
        </div>
      </div>
    </div>
  );
}
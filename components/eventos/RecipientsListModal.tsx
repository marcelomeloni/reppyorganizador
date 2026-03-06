"use client";

import { X } from "@phosphor-icons/react";

type Recipient = {
  id: string;
  full_name: string | null;
  email: string | null;
  ticket_type: string;
  payment_status: string;
};

type Props = {
  onClose: () => void;
  recipients: Recipient[];
};

export default function RecipientsListModal({ onClose, recipients }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-[#F7F7F2] rounded-[var(--radius-card-lg,28px)] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-[#E0E0D8]">
        {/* Header */}
        <div className="px-5 md:px-6 py-4 border-b border-[#E0E0D8] flex items-center justify-between bg-white">
          <div>
            <h3
              className="font-extrabold text-[#0A0A0A] text-base"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.3px" }}
            >
              Destinatários
            </h3>
            <p
              className="text-xs text-[#9A9A8F] mt-0.5"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              {recipients.length} participante{recipients.length !== 1 ? "s" : ""} selecionado{recipients.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[10px] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Info banner */}
        <div className="px-5 md:px-6 py-3 bg-[#1BFF11]/8 border-b border-[#1BFF11]/15 flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#1BFF11] shrink-0"
          />
          <p
            className="text-xs text-[#0A7A07]"
            style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
          >
            <strong>{recipients.length} participantes</strong> receberão este comunicado com os filtros atuais.
          </p>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {recipients.length === 0 ? (
            <div
              className="p-10 text-center text-[#9A9A8F] text-sm"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              Nenhum participante encontrado com estes filtros.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F0F0EB] sticky top-0 z-10">
                <tr>
                  {["Nome", "E-mail", "Lote / Status"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest border-b border-[#E0E0D8]"
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EB] bg-white">
                {recipients.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#F7F7F2] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full bg-[#F0F0EB] flex items-center justify-center text-xs font-bold text-[#5C5C52] uppercase shrink-0"
                          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                        >
                          {user.full_name?.[0] ?? "?"}
                        </div>
                        <span
                          className="text-sm font-medium text-[#0A0A0A]"
                          style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                        >
                          {user.full_name}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3 text-sm text-[#5C5C52]"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      {user.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs text-[#9A9A8F]"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        {user.ticket_type} ·{" "}
                        <span className="capitalize">{user.payment_status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 md:px-6 py-4 bg-[#F0F0EB] border-t border-[#E0E0D8] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[100px] bg-[#0A0A0A] text-[#F7F7F2] text-sm font-bold hover:bg-[#1a1a1a] transition-colors"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
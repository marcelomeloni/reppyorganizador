"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // Estilo base obrigatório do editor
import {
  Plus,
  Users,
  PaperPlaneTilt,
  Eye,
  X,
  CircleNotch,
  User,
  EnvelopeSimple,
  CalendarBlank,
  MapPin,
  Check,
} from "@phosphor-icons/react";

import AddFilterModal from "@/components/eventos/AddFilterModal";
import RecipientsListModal from "@/components/eventos/RecipientsListModal";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-[12px] bg-[#F0F0EB] border border-[#E0E0D8] animate-pulse" />
  ),
});

type Filter = {
  id: string;
  type: string;
  value: string;
  label: string;
};

type Recipient = {
  id: string;
  name: string;
  email: string;
  payment_status: string;
  ticket_type: string;
  check_in: string;
};

const MOCK_RECIPIENTS: Recipient[] = [
  { id: "1", name: "Maria Silva", email: "maria@usp.br", payment_status: "paid", ticket_type: "VIP", check_in: "Sim" },
  { id: "2", name: "João Pedro", email: "joao@fau.br", payment_status: "paid", ticket_type: "Pista", check_in: "Não" },
  { id: "3", name: "Ana Luisa", email: "ana@unifesp.br", payment_status: "paid", ticket_type: "Camarote", check_in: "Sim" },
  { id: "4", name: "Rafael Costa", email: "rafael@unesp.br", payment_status: "pending", ticket_type: "Pista", check_in: "Não" },
  { id: "5", name: "Carla Moura", email: "carla@puc.br", payment_status: "paid", ticket_type: "VIP", check_in: "Sim" },
  { id: "6", name: "Thiago Reis", email: "thiago@usp.br", payment_status: "paid", ticket_type: "Pista", check_in: "Não" },
];

const MOCK_EVENT = {
  title: "Calourada FAUUSP 2026",
  start_date: "2026-06-14",
  location: { city: "São Paulo", state: "SP" },
  image_url: null as string | null,
  organization: { name: "Atlética FAUUSP", email: "atletica@fauusp.br" },
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

export default function ComunicadosPage() {
  const allRecipients = MOCK_RECIPIENTS;
  const event = MOCK_EVENT;

  const [formData, setFormData] = useState({
    senderName: "",
    replyTo: "",
    subject: "",
    message: "",
  });
  const [filters, setFilters] = useState<Filter[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [recipientsModalOpen, setRecipientsModalOpen] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData((prev) => ({
        ...prev,
        senderName: event.organization?.name || event.title || "",
        replyTo: event.organization?.email || "",
      }));
    }
  }, [event]);

  const filteredRecipients = useMemo(() => {
    if (filters.length === 0) return allRecipients;
    
    return allRecipients.filter((user) =>
      filters.every(
        (f) =>
          String(user[f.type as keyof Recipient]).toLowerCase() ===
          f.value.toLowerCase()
      )
    );
  }, [filters, allRecipients]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFilter = (f: Filter) => {
    if (!filters.some((x) => x.type === f.type && x.value === f.value)) {
      setFilters((prev) => [...prev, f]);
    }
  };

  const handleSend = async () => {
    if (!formData.subject.trim()) return;
    if (!formData.message.replace(/<(.|\n)*?>/g, "").trim()) return;
    if (filteredRecipients.length === 0) return;
    
    setIsSending(true);
    
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSent(true);
      setFormData((prev) => ({ ...prev, subject: "", message: "" }));
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const canSend =
    formData.subject.trim() &&
    formData.message.replace(/<(.|\n)*?>/g, "").trim() &&
    filteredRecipients.length > 0 &&
    !isSending;

  return (
    <>
      <style>{`
        .ql-toolbar.ql-snow { background:#F0F0EB!important; border-color:#E0E0D8!important; border-radius:12px 12px 0 0!important; }
        .ql-container.ql-snow { border-color:#E0E0D8!important; border-radius:0 0 12px 12px!important; background:white; }
        .ql-editor { min-height:160px; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; color:#0A0A0A; }
        .ql-editor.ql-blank::before { color:#9A9A8F; font-style:normal; }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-5 pb-16">
        <div>
          <h1
            className="text-2xl font-extrabold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.5px" }}
          >
            Comunicados
          </h1>
          <p
            className="text-sm text-[#9A9A8F] mt-0.5"
            style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
          >
            Envie e-mails personalizados para seus participantes.
          </p>
        </div>

        <div className="grid xl:grid-cols-2 gap-5">
          <div className="space-y-4">

            <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-[8px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
                  <Users size={15} weight="bold" />
                </div>
                <h2
                  className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  Destinatários
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[28px]">
                {filters.length === 0 ? (
                  <span
                    className="text-xs text-[#9A9A8F] italic"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    Todos os participantes ({allRecipients.length})
                  </span>
                ) : (
                  filters.map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0A0A0A] text-[#F7F7F2]"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      {f.label}
                      <button
                        onClick={() =>
                          setFilters((prev) => prev.filter((x) => x.id !== f.id))
                        }
                        className="ml-0.5 hover:text-[#1BFF11] transition-colors"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#F0F0EB]">
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-[100px] text-xs font-bold text-[#5C5C52] bg-[#F0F0EB] hover:bg-[#E0E0D8] border border-[#E0E0D8] transition-all"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  <Plus size={12} weight="bold" />
                  Adicionar filtro
                </button>
                <div className="h-4 w-px bg-[#E0E0D8]" />
                <button
                  onClick={() => setRecipientsModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-[#5C5C52] hover:text-[#0A0A0A] transition-colors"
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                >
                  <Eye size={14} weight="bold" />
                  <strong>{filteredRecipients.length}</strong> selecionados
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
                  <EnvelopeSimple size={15} weight="bold" />
                </div>
                <h2
                  className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  Conteúdo do E-mail
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    Remetente
                  </label>
                  <div className="relative">
                    <User
                      size={14}
                      weight="bold"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]"
                    />
                    <input
                      type="text"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2.5 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    Responder para
                  </label>
                  <input
                    type="email"
                    name="replyTo"
                    value={formData.replyTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  Assunto
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={`ex: Informações sobre ${event?.title ?? "o evento"}`}
                  className="w-full px-3 py-2.5 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  Mensagem
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.message}
                  onChange={(v) => setFormData((p) => ({ ...p, message: v }))}
                  modules={quillModules}
                  placeholder="Escreva sua mensagem aqui..."
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-[100px] text-sm font-bold transition-all ${
                    sent
                      ? "bg-[#1BFF11]/15 text-[#0A7A07] border border-[#1BFF11]/30 cursor-default"
                      : "bg-[#0A0A0A] text-[#F7F7F2] hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  {isSending ? (
                    <CircleNotch size={16} weight="bold" className="animate-spin" />
                  ) : sent ? (
                    <Check size={16} weight="bold" />
                  ) : (
                    <PaperPlaneTilt size={16} weight="bold" />
                  )}
                  {isSending ? "Enviando..." : sent ? "Enviado!" : "Enviar agora"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#0A0A0A] rounded-full" />
              <h2
                className="text-xs font-bold text-[#5C5C52] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Pré-visualização
              </h2>
            </div>

            <div className="bg-[#F0F0EB] p-4 md:p-6 rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8]">
              <div className="bg-white rounded-[16px] overflow-hidden border border-[#E0E0D8] shadow-sm max-w-md mx-auto">
                <div className="h-28 bg-gradient-to-br from-[#0A0A0A] to-[#1a1a1a] relative">
                  {event?.image_url ? (
                    <img src={event.image_url} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-[#3a3a3a] text-xs uppercase tracking-widest"
                        style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                      >
                        {event?.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {formData.subject ? (
                    <h3
                      className="text-sm font-extrabold text-[#0A0A0A] leading-tight border-b border-[#F0F0EB] pb-3"
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.3px" }}
                    >
                      {formData.subject}
                    </h3>
                  ) : (
                    <div className="h-4 rounded-full bg-[#F0F0EB] w-2/3 mb-3" />
                  )}

                  <p
                    className="text-[11px] text-[#9A9A8F] text-center"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    Enviado por{" "}
                    <strong className="text-[#5C5C52]">{formData.senderName || "—"}</strong>
                  </p>

                  <div className="bg-[#F7F7F2] rounded-[10px] p-3 space-y-1.5">
                    <div
                      className="flex items-center gap-2 text-[11px] text-[#5C5C52]"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      <CalendarBlank size={11} weight="bold" className="shrink-0" />
                      {event?.start_date
                        ? new Date(event.start_date).toLocaleDateString("pt-BR")
                        : "Data a definir"}
                    </div>
                    <div
                      className="flex items-center gap-2 text-[11px] text-[#5C5C52]"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      <MapPin size={11} weight="bold" className="shrink-0" />
                      {event?.location
                        ? `${event.location.city} - ${event.location.state}`
                        : "Local a definir"}
                    </div>
                  </div>

                  <div
                    className="py-2 text-xs text-[#0A0A0A] ql-editor"
                    style={{ padding: 0, fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        formData.message ||
                        '<p style="color:#9A9A8F;font-style:italic;font-size:12px">O conteúdo aparecerá aqui...</p>',
                    }}
                  />

                  {formData.replyTo && (
                    <p
                      className="text-[10px] text-[#9A9A8F] pt-2 border-t border-[#F0F0EB]"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    >
                      Responda para{" "}
                      <span className="text-[#0A0A0A] underline">{formData.replyTo}</span>
                    </p>
                  )}
                </div>

                <div className="bg-[#F7F7F2] px-5 py-3 text-center border-t border-[#F0F0EB]">
                  <p
                    className="text-[10px] text-[#9A9A8F]"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    Enviado via <strong>Reppy</strong> · © {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filterModalOpen && (
        <AddFilterModal
          onClose={() => setFilterModalOpen(false)}
          onAddFilter={handleAddFilter}
        />
      )}
      {recipientsModalOpen && (
        <RecipientsListModal
          onClose={() => setRecipientsModalOpen(false)}
          recipients={filteredRecipients}
        />
      )}
    </>
  );
}
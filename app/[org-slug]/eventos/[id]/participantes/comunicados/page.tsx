"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
  Plus, Users, PaperPlaneTilt, Eye, X,
  CircleNotch, User, EnvelopeSimple,
  CalendarBlank, MapPin, Check, XCircle,
} from "@phosphor-icons/react";

import AddFilterModal from "@/components/eventos/AddFilterModal";
import RecipientsListModal from "@/components/eventos/RecipientsListModal";
import { useManage } from "@/context/EventManageContext";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { comunicadosService, type ComunicadoRecipient } from "@/services/comunicadosService";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-[12px] bg-[#F0F0EB] border border-[#E0E0D8] animate-pulse" />
  ),
});

type Filter = {
  id:    string;
  type:  string;
  value: string;
  label: string;
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
  const params  = useParams();
  const slug    = params?.["org-slug"] as string | undefined;
  const eventId = params?.["id"]       as string | undefined;

  const { session }    = useAuth();
  const { currentOrg } = useOrganization();
  const { data: manageData, loading: manageLoading } = useManage();

  const event = manageData?.event;

  const [allRecipients, setAllRecipients]         = useState<ComunicadoRecipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [recipientsError, setRecipientsError]     = useState<string | null>(null);

  const [formData, setFormData] = useState({
    senderName: "",
    replyTo:    "",
    subject:    "",
    message:    "",
  });

  const [filters, setFilters]                         = useState<Filter[]>([]);
  const [filterModalOpen, setFilterModalOpen]         = useState(false);
  const [recipientsModalOpen, setRecipientsModalOpen] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [sent, setSent]           = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipients() {
      if (!slug || !eventId || !session?.access_token) {
        setRecipientsLoading(false);
        return;
      }
      try {
        setRecipientsLoading(true);
        const data = await comunicadosService.getRecipients(session.access_token, slug, eventId);
        setAllRecipients(data);
      } catch (err) {
        console.error(err);
        setRecipientsError("Não foi possível carregar os destinatários.");
      } finally {
        setRecipientsLoading(false);
      }
    }
    fetchRecipients();
  }, [slug, eventId, session?.access_token]);

  useEffect(() => {
    if (!event) return;
    setFormData((prev) => ({
      ...prev,
      senderName: currentOrg?.name || event.title || "",
      replyTo:    event.org_email  || "",
    }));
  }, [event, currentOrg]);

  const location = useMemo(() => {
    if (!event?.location) return null;
    try { return JSON.parse(event.location); } catch { return null; }
  }, [event?.location]);

  const locationLabel = location
    ? [location.venue_name, location.city, location.state].filter(Boolean).join(", ")
    : null;

  const ticketCategories = useMemo(
    () => (event?.ticket_categories ?? []).map((c) => c.name),
    [event?.ticket_categories]
  );

  const filteredRecipients = useMemo(() => {
    const base =
      filters.length === 0
        ? allRecipients
        : allRecipients.filter((user) =>
            filters.every((f) => {
              const val = String((user as any)[f.type] ?? "").toLowerCase();
              return val === f.value.toLowerCase();
            })
          );

    const seen = new Set<string>();
    return base.filter((user) => {
      const email = user.email?.toLowerCase() ?? "";
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });
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
    if (!slug || !eventId || !session?.access_token) return;
    setSendError(null);
    setIsSending(true);
    try {
      await comunicadosService.send(session.access_token, slug, eventId, {
        sender_name: formData.senderName,
        reply_to:    formData.replyTo,
        subject:     formData.subject,
        message:     formData.message,
        filters:     filters.map((f) => ({ type: f.type, value: f.value })),
      });
      setSent(true);
      setFormData((prev) => ({ ...prev, subject: "", message: "" }));
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error(err);
      setSendError("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  const canSend =
    !!formData.subject.trim() &&
    !!formData.message.replace(/<(.|\n)*?>/g, "").trim() &&
    filteredRecipients.length > 0 &&
    !isSending;

  if (manageLoading || recipientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <CircleNotch size={32} className="animate-spin text-[#9A9A8F]" />
      </div>
    );
  }

  if (recipientsError) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <XCircle size={48} weight="fill" className="text-[#D91B1B] mb-4" />
        <h2 className="text-xl font-bold text-[#0A0A0A]">{recipientsError}</h2>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-bold underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .ql-toolbar.ql-snow       { background:#F0F0EB!important; border-color:#E0E0D8!important; border-radius:12px 12px 0 0!important; }
        .ql-container.ql-snow     { border-color:#E0E0D8!important; border-radius:0 0 12px 12px!important; background:white; }
        .ql-editor                { min-height:160px; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; color:#0A0A0A; }
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
          <p className="text-sm text-[#9A9A8F] mt-0.5" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
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
                <h2 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
                  Destinatários
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[28px]">
                {filters.length === 0 ? (
                  <span className="text-xs text-[#9A9A8F] italic" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
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
                      <button onClick={() => setFilters((prev) => prev.filter((x) => x.id !== f.id))} className="ml-0.5 hover:text-[#1BFF11] transition-colors">
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
                <h2 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
                  Conteúdo do E-mail
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
                    Remetente
                  </label>
                  <div className="relative">
                    <User size={14} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]" />
                    <input
                      type="text" name="senderName" value={formData.senderName} onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2.5 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                      style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
                    Responder para
                  </label>
                  <input
                    type="email" name="replyTo" value={formData.replyTo} onChange={handleChange}
                    placeholder="email@organização.com"
                    className="w-full px-3 py-2.5 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
                  Assunto
                </label>
                <input
                  type="text" name="subject" value={formData.subject} onChange={handleChange}
                  placeholder={`ex: Informações sobre ${event?.title ?? "o evento"}`}
                  className="w-full px-3 py-2.5 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                  style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
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

              {sendError && (
                <p className="text-xs text-[#D91B1B] font-medium" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                  {sendError}
                </p>
              )}

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
              <h2 className="text-xs font-bold text-[#5C5C52] uppercase tracking-widest" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
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
                      <span className="text-[#3a3a3a] text-xs uppercase tracking-widest px-4 text-center" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
                        {event?.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {formData.subject ? (
                    <h3 className="text-sm font-extrabold text-[#0A0A0A] leading-tight border-b border-[#F0F0EB] pb-3" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.3px" }}>
                      {formData.subject}
                    </h3>
                  ) : (
                    <div className="h-4 rounded-full bg-[#F0F0EB] w-2/3 mb-3" />
                  )}

                  <p className="text-[11px] text-[#9A9A8F] text-center" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                    Enviado por <strong className="text-[#5C5C52]">{formData.senderName || "—"}</strong>
                  </p>

                  <div className="bg-[#F7F7F2] rounded-[10px] p-3 space-y-1.5">
                    {event?.start_date && (
                      <div className="flex items-center gap-2 text-[11px] text-[#5C5C52]" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                        <CalendarBlank size={11} weight="bold" className="shrink-0" />
                        {new Date(event.start_date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    )}
                    {locationLabel && (
                      <div className="flex items-center gap-2 text-[11px] text-[#5C5C52]" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                        <MapPin size={11} weight="bold" className="shrink-0" />
                        {locationLabel}
                      </div>
                    )}
                  </div>

                  <div
                    className="py-2 text-xs text-[#0A0A0A] ql-editor"
                    style={{ padding: 0, fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                    dangerouslySetInnerHTML={{
                      __html: formData.message || '<p style="color:#9A9A8F;font-style:italic;font-size:12px">O conteúdo aparecerá aqui...</p>',
                    }}
                  />

                  {formData.replyTo && (
                    <p className="text-[10px] text-[#9A9A8F] pt-2 border-t border-[#F0F0EB]" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                      Responda para <span className="text-[#0A0A0A] underline">{formData.replyTo}</span>
                    </p>
                  )}
                </div>

                <div className="bg-[#F7F7F2] px-5 py-3 text-center border-t border-[#F0F0EB]">
                  <p className="text-[10px] text-[#9A9A8F]" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
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
          ticketCategories={ticketCategories}
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
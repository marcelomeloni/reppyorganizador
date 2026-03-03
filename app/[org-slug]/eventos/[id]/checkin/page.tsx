"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  CameraSlash,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  IdentificationCard,
  Clock,
  Warning,
  CircleNotch,
  X,
  QrCode,
  Ticket,
  User,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────
type CheckInStatus = "idle" | "scanning" | "loading" | "found" | "not_found" | "already_done";

type Participant = {
  id: string;
  name: string;
  cpf: string;
  ticket_type: string;
  batch: string;
  checked_in: boolean;
  checked_in_at?: string;
};

type RecentEntry = {
  id: string;
  name: string;
  ticket_type: string;
  time: string;
  status: "success" | "already" | "not_found";
};

// ─── Mock DB — replace with real API ─────────────────────────────────
const MOCK_PARTICIPANTS: Participant[] = [
  { id: "p1", name: "Maria Silva",   cpf: "123.456.789-00", ticket_type: "VIP",      batch: "Lote único", checked_in: false },
  { id: "p2", name: "João Pedro",    cpf: "234.567.890-11", ticket_type: "Pista",     batch: "1º Lote",   checked_in: true,  checked_in_at: "21:34" },
  { id: "p3", name: "Ana Luisa",     cpf: "345.678.901-22", ticket_type: "Camarote",  batch: "Lote único", checked_in: false },
  { id: "p4", name: "Rafael Costa",  cpf: "456.789.012-33", ticket_type: "Pista",     batch: "2º Lote",   checked_in: false },
  { id: "p5", name: "Carla Moura",   cpf: "567.890.123-44", ticket_type: "VIP",      batch: "Lote único", checked_in: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function maskCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function timeNow() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const TICKET_COLORS: Record<string, string> = {
  VIP: "bg-[#F3E8FF] text-[#6B1FD4]",
  Pista: "bg-[#F0F0EB] text-[#5C5C52]",
  Camarote: "bg-[#E8FCEB] text-[#0A7A07]",
};

// ─── Confirmation Modal ───────────────────────────────────────────────
function ConfirmModal({
  participant,
  onConfirm,
  onClose,
  loading,
}: {
  participant: Participant;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const alreadyDone = participant.checked_in;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(10,10,10,0.5)", backdropFilter: "blur(8px)" }}
    >
      <div className="bg-[#F7F7F2] w-full sm:max-w-sm rounded-t-[28px] sm:rounded-[28px] border border-[#E0E0D8] shadow-2xl overflow-hidden">
        {/* Status strip */}
        <div
          className={`h-1.5 w-full ${alreadyDone ? "bg-[#F59E0B]" : "bg-[#1BFF11]"}`}
        />

        <div className="p-6 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold shrink-0 ${
                alreadyDone ? "bg-[#FEF3C7] text-[#A86A00]" : "bg-[#E8FCEB] text-[#0A7A07]"
              }`}
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              {participant.name[0].toUpperCase()}
            </div>
            <div>
              <p
                className="text-lg font-extrabold text-[#0A0A0A] leading-tight"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.5px" }}
              >
                {participant.name}
              </p>
              <p
                className="text-xs text-[#9A9A8F] mt-0.5"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                {participant.cpf}
              </p>
            </div>
          </div>

          {/* Ticket info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F0F0EB] rounded-[12px] px-4 py-3">
              <p
                className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Tipo
              </p>
              <p
                className="text-sm font-bold text-[#0A0A0A]"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                {participant.ticket_type}
              </p>
            </div>
            <div className="bg-[#F0F0EB] rounded-[12px] px-4 py-3">
              <p
                className="text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Lote
              </p>
              <p
                className="text-sm font-bold text-[#0A0A0A]"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                {participant.batch}
              </p>
            </div>
          </div>

          {/* Already checked in warning */}
          {alreadyDone && (
            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#FEF3C7] border border-[#F59E0B]/25">
              <Warning size={16} weight="fill" className="text-[#A86A00] shrink-0" />
              <p
                className="text-xs text-[#A86A00]"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                Check-in já realizado às <strong>{participant.checked_in_at}</strong>.
                Confirmar novamente?
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-[100px] text-sm font-semibold text-[#5C5C52] bg-[#F0F0EB] hover:bg-[#E0E0D8] border border-[#E0E0D8] transition-all"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[100px] text-sm font-bold transition-all disabled:opacity-60 ${
                alreadyDone
                  ? "bg-[#F59E0B] text-white hover:bg-[#D97706]"
                  : "bg-[#0A0A0A] text-[#F7F7F2] hover:bg-[#222]"
              }`}
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              {loading ? (
                <CircleNotch size={16} weight="bold" className="animate-spin" />
              ) : (
                <CheckCircle size={16} weight="bold" />
              )}
              {loading ? "Confirmando..." : "Confirmar entrada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function CheckInPage() {
  const [mode, setMode] = useState<"camera" | "cpf">("camera");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState<CheckInStatus>("idle");
  const [found, setFound] = useState<Participant | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Camera ──
  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => stopCamera();
  }, [mode]);

  // ── Lookup ──
  const lookup = useCallback(async (rawCpf: string) => {
    const clean = rawCpf.replace(/\D/g, "");
    if (clean.length < 11) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 600)); // replace with API call

    const participant = MOCK_PARTICIPANTS.find(
      (p) => p.cpf.replace(/\D/g, "") === clean
    );

    if (!participant) {
      setStatus("not_found");
      setFound(null);
      setTimeout(() => setStatus("idle"), 2500);
    } else {
      setFound(participant);
      setStatus("found");
    }
  }, []);

  const handleCpfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(cpf);
  };

  // ── Confirm check-in ──
  const handleConfirm = async () => {
    if (!found) return;
    setConfirmLoading(true);
    await new Promise((r) => setTimeout(r, 900)); // replace with API call

    const entry: RecentEntry = {
      id: found.id + Date.now(),
      name: found.name,
      ticket_type: found.ticket_type,
      time: timeNow(),
      status: found.checked_in ? "already" : "success",
    };

    setRecent((prev) => [entry, ...prev.slice(0, 49)]);
    setConfirmLoading(false);
    setFound(null);
    setStatus("idle");
    setCpf("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setFound(null);
    setStatus("idle");
    setCpf("");
  };

  const checkedInToday = recent.filter((r) => r.status === "success").length;

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-5 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-2xl font-extrabold text-[#0A0A0A]"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: "-0.5px" }}
            >
              Check-in
            </h1>
            <p
              className="text-sm text-[#9A9A8F] mt-0.5"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              Valide a entrada dos participantes por QR code ou CPF.
            </p>
          </div>

          {/* Live counter */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-[100px] bg-[#E8FCEB] border border-[#1BFF11]/25">
            <span className="w-2 h-2 rounded-full bg-[#1BFF11] animate-pulse" />
            <span
              className="text-sm font-bold text-[#0A7A07]"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              {checkedInToday} entradas hoje
            </span>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1fr_360px] gap-5 items-start">
          {/* ── Scanner panel ── */}
          <div className="space-y-4">

            {/* Mode toggle */}
            <div className="flex gap-1 p-1 rounded-[14px] bg-[#F0F0EB] border border-[#E0E0D8] w-fit">
              {(["camera", "cpf"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold transition-all ${
                    mode === m
                      ? "bg-[#0A0A0A] text-[#F7F7F2] shadow-sm"
                      : "text-[#5C5C52] hover:text-[#0A0A0A]"
                  }`}
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  {m === "camera" ? (
                    <><QrCode size={16} weight="bold" /> QR Code</>
                  ) : (
                    <><IdentificationCard size={16} weight="bold" /> CPF</>
                  )}
                </button>
              ))}
            </div>

            {/* Camera scanner */}
            {mode === "camera" && (
              <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] overflow-hidden">
                <div className="relative bg-[#0A0A0A] aspect-[4/3] md:aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />

                  {/* Viewfinder overlay */}
                  {cameraActive && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-48 h-48">
                        {/* Corners */}
                        {[
                          "top-0 left-0 border-t-2 border-l-2 rounded-tl-[8px]",
                          "top-0 right-0 border-t-2 border-r-2 rounded-tr-[8px]",
                          "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[8px]",
                          "bottom-0 right-0 border-b-2 border-r-2 rounded-br-[8px]",
                        ].map((cls, i) => (
                          <span
                            key={i}
                            className={`absolute w-6 h-6 border-[#1BFF11] ${cls}`}
                          />
                        ))}
                        {/* Scan line */}
                        <div className="absolute inset-x-0 top-1/2 h-px bg-[#1BFF11]/60 shadow-[0_0_8px_#1BFF11]"
                          style={{ animation: "scanline 2s ease-in-out infinite" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Camera error */}
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0A0A0A]">
                      <CameraSlash size={40} weight="thin" className="text-[#5C5C52]" />
                      <p
                        className="text-sm text-[#5C5C52] text-center max-w-[200px]"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        Câmera não disponível. Use o modo CPF.
                      </p>
                      <button
                        onClick={() => setMode("cpf")}
                        className="px-4 py-2 rounded-[100px] bg-[#1BFF11] text-[#0A0A0A] text-sm font-bold"
                        style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                      >
                        Usar CPF
                      </button>
                    </div>
                  )}

                  {/* Loading indicator over camera */}
                  {status === "loading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/60">
                      <CircleNotch size={32} weight="bold" className="text-[#1BFF11] animate-spin" />
                    </div>
                  )}
                </div>

                <div className="px-5 py-4 flex items-center justify-between border-t border-[#F0F0EB]">
                  <p
                    className="text-xs text-[#9A9A8F]"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    {cameraActive ? "Aponte para o QR code do ingresso" : "Câmera inativa"}
                  </p>
                  <button
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[100px] text-xs font-bold text-[#5C5C52] bg-[#F0F0EB] hover:bg-[#E0E0D8] border border-[#E0E0D8] transition-all"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {cameraActive ? (
                      <><CameraSlash size={13} weight="bold" /> Parar</>
                    ) : (
                      <><Camera size={13} weight="bold" /> Iniciar</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* CPF input */}
            {mode === "cpf" && (
              <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] p-5">
                <form onSubmit={handleCpfSubmit} className="space-y-3">
                  <label
                    className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    CPF do participante
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <IdentificationCard
                        size={16}
                        weight="bold"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9A8F]"
                      />
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(maskCPF(e.target.value))}
                        disabled={status === "loading"}
                        className="w-full pl-10 pr-4 py-3.5 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-base font-mono tracking-widest text-[#0A0A0A] placeholder-[#D0D0C8] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={cpf.replace(/\D/g, "").length < 11 || status === "loading"}
                      className="px-5 py-3.5 rounded-[12px] bg-[#0A0A0A] text-[#F7F7F2] font-bold text-sm hover:bg-[#222] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                    >
                      {status === "loading" ? (
                        <CircleNotch size={18} weight="bold" className="animate-spin" />
                      ) : (
                        <MagnifyingGlass size={18} weight="bold" />
                      )}
                    </button>
                  </div>

                  {/* Feedback states */}
                  {status === "not_found" && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-[#FCE8E8] border border-[#FF2D2D]/15">
                      <XCircle size={16} weight="fill" className="text-[#D91B1B] shrink-0" />
                      <p
                        className="text-sm text-[#D91B1B]"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        CPF não encontrado neste evento.
                      </p>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* ── Recent check-ins ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#0A0A0A] rounded-full" />
              <h2
                className="text-xs font-bold text-[#5C5C52] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                Recentes
              </h2>
              {recent.length > 0 && (
                <span
                  className="ml-auto text-[10px] font-bold text-[#9A9A8F]"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  {recent.length} nesta sessão
                </span>
              )}
            </div>

            <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] overflow-hidden">
              {recent.length === 0 ? (
                <div className="px-5 py-12 flex flex-col items-center gap-3 text-center">
                  <Clock size={32} weight="thin" className="text-[#D0D0C8]" />
                  <p
                    className="text-sm text-[#9A9A8F]"
                    style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                  >
                    Nenhum check-in ainda.
                    <br />
                    Os registros aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F0F0EB] max-h-[480px] overflow-y-auto">
                  {recent.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAF8] transition-colors"
                    >
                      {/* Status icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          entry.status === "success"
                            ? "bg-[#E8FCEB]"
                            : entry.status === "already"
                            ? "bg-[#FEF3C7]"
                            : "bg-[#FCE8E8]"
                        }`}
                      >
                        {entry.status === "success" ? (
                          <CheckCircle size={16} weight="fill" className="text-[#0A7A07]" />
                        ) : entry.status === "already" ? (
                          <Warning size={16} weight="fill" className="text-[#A86A00]" />
                        ) : (
                          <XCircle size={16} weight="fill" className="text-[#D91B1B]" />
                        )}
                      </div>

                      {/* Name + ticket */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-bold text-[#0A0A0A] truncate leading-tight"
                          style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                        >
                          {entry.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              TICKET_COLORS[entry.ticket_type] ?? "bg-[#F0F0EB] text-[#5C5C52]"
                            }`}
                            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                          >
                            {entry.ticket_type}
                          </span>
                          {entry.status === "already" && (
                            <span
                              className="text-[10px] text-[#A86A00]"
                              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                            >
                              já registrado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <span
                        className="text-xs text-[#9A9A8F] shrink-0 tabular-nums"
                        style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
                      >
                        {entry.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scanline animation */}
      <style>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(-40px); opacity: 0.8; }
          50% { transform: translateY(40px); opacity: 1; }
        }
      `}</style>

      {/* ── Confirmation modal ── */}
      {found && (
        <ConfirmModal
          participant={found}
          onConfirm={handleConfirm}
          onClose={handleClose}
          loading={confirmLoading}
        />
      )}
    </>
  );
}
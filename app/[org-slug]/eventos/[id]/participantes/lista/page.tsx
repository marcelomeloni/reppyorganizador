"use client";

import { useState, useMemo } from "react";
import { 
  MagnifyingGlass, 
  DownloadSimple, 
  ArrowsClockwise, 
  CheckCircle, 
  Clock 
} from "@phosphor-icons/react";

type Participant = {
  id: string;
  name: string;
  email: string;
  ticketId: string;
  ticketType: string;
  status: "Válido" | "Utilizado" | "Cancelado";
  checkin: boolean;
  checkinDate: string | null;
  purchaseDate: string;
};

const initialParticipants: Participant[] = [
  { id: "1", name: "Maria Silva", email: "maria@usp.br", ticketId: "TCK-8A9B2C", ticketType: "VIP", status: "Utilizado", checkin: true, checkinDate: "02/06/2026 14:30", purchaseDate: "15/05/2026" },
  { id: "2", name: "João Pedro", email: "joao@fau.br", ticketId: "TCK-4F5D6E", ticketType: "Pista", status: "Válido", checkin: false, checkinDate: null, purchaseDate: "16/05/2026" },
  { id: "3", name: "Ana Luisa", email: "ana@unifesp.br", ticketId: "TCK-1A2B3C", ticketType: "Camarote", status: "Utilizado", checkin: true, checkinDate: "02/06/2026 15:10", purchaseDate: "20/05/2026" },
  { id: "4", name: "Rafael Costa", email: "rafael@unesp.br", ticketId: "TCK-9Z8Y7X", ticketType: "Pista", status: "Válido", checkin: false, checkinDate: null, purchaseDate: "22/05/2026" },
  { id: "5", name: "Carla Moura", email: "carla@puc.br", ticketId: "TCK-5T4R3E", ticketType: "VIP", status: "Utilizado", checkin: true, checkinDate: "02/06/2026 16:05", purchaseDate: "25/05/2026" },
  { id: "6", name: "Thiago Reis", email: "thiago@usp.br", ticketId: "TCK-2W1Q0P", ticketType: "Pista", status: "Válido", checkin: false, checkinDate: null, purchaseDate: "28/05/2026" },
];

export default function ParticipantesListaPage() {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "checkin" | "pendente">("todos");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.email.toLowerCase().includes(query.toLowerCase()) ||
        p.ticketId.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilter =
        filter === "todos" ||
        (filter === "checkin" && p.checkin) ||
        (filter === "pendente" && !p.checkin);
        
      return matchesQuery && matchesFilter;
    });
  }, [participants, query, filter]);

  const total = participants.length;
  const checkedCount = participants.filter((p) => p.checkin).length;
  const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const handleToggleCheckIn = async (id: string, currentStatus: boolean) => {
    if (processingId) return;
    setProcessingId(id);

    setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const isNowChecked = !currentStatus;
            return {
              ...p,
              checkin: isNowChecked,
              status: isNowChecked ? "Utilizado" : "Válido",
              checkinDate: isNowChecked ? new Date().toLocaleString('pt-BR').slice(0, 16) : null,
            };
          }
          return p;
        })
      );
      setProcessingId(null);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 
            className="text-lg font-extrabold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-0.5px" }}
          >
            Total de check-in efetuados
          </h2>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#5C5C52] border border-[#E0E0D8] bg-[#F7F7F2] rounded-[10px] hover:bg-[#F0F0EB] transition-colors uppercase"
              style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
            >
              <ArrowsClockwise size={14} weight="bold" /> Atualizar
            </button>
            
            <select 
              className="px-3 py-1.5 text-xs border border-[#E0E0D8] rounded-[10px] bg-white text-[#5C5C52] font-semibold outline-none focus:border-[#0A0A0A]/30 transition-colors"
              style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
            >
              <option>Todos os lotes</option>
              <option>VIP</option>
              <option>Pista</option>
              <option>Camarote</option>
            </select>
          </div>
        </div>

        <div className="space-y-2.5">
          <p 
            className="text-3xl font-extrabold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)", letterSpacing: "-1px" }}
          >
            {checkedCount} <span className="text-lg font-medium text-[#9A9A8F]">({percentage}%)</span>
          </p>
          
          <div className="w-full h-2.5 bg-[#F0F0EB] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0A0A0A] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div 
            className="flex justify-between text-[11px] text-[#5C5C52] font-medium pt-1"
            style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
          >
            <span>Até o momento {percentage}% ({checkedCount} de {total}) dos participantes confirmados realizaram check-in.</span>
            <span>Total: {total}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] flex flex-col min-h-[500px] overflow-hidden">
        
        <div className="p-5 border-b border-[#F0F0EB] flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-[#F7F7F2]/50">
          <h3 
            className="text-[#0A0A0A] font-extrabold text-base"
            style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
          >
            Lista de participantes inscritos
          </h3>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <input 
                  type="text" 
                  placeholder="Nome, e-mail ou ingresso..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-[12px] bg-white border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                  style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                />
                <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex gap-1 p-1 rounded-[12px] bg-[#F0F0EB] border border-[#E0E0D8]">
                {(["todos", "checkin", "pendente"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold uppercase tracking-wider transition-all ${
                      filter === f
                        ? "bg-white text-[#0A0A0A] shadow-sm"
                        : "text-[#9A9A8F] hover:text-[#5C5C52]"
                    }`}
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-[#E0E0D8] mx-1 hidden md:block" />

              <button 
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-[#E0E0D8] bg-white rounded-[12px] text-[#0A0A0A] text-xs font-bold hover:bg-[#F7F7F2] transition-colors"
                style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
              >
                <DownloadSimple size={16} weight="bold" /> Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-[#F0F0EB]">
              <tr>
                <th 
                  className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest min-w-[220px]"
                  style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                >
                  Participante
                </th>
                <th 
                  className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                >
                  ID Ingresso
                </th>
                <th 
                  className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                >
                  Tipo
                </th>
                <th 
                  className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                >
                  Status
                </th>
                <th 
                  className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                >
                  Data Check-in
                </th>
                <th 
                  className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest text-center"
                  style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                >
                  Check-in
                </th>
              </tr>
            </thead>
            <tbody 
              className="divide-y divide-[#F0F0EB] text-sm text-[#0A0A0A]"
              style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
            >
              {filtered.map((p) => (
                <tr 
                  key={p.id} 
                  className="hover:bg-[#F7F7F2] transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#0A0A0A]">{p.name}</div>
                    <div className="text-[11px] text-[#5C5C52] mt-0.5">{p.email}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#5C5C52]">
                    {p.ticketId}
                  </td>
                  <td className="px-5 py-4">
                    <span 
                      className="inline-block px-2.5 py-1 rounded-[6px] bg-[#F0F0EB] text-[#5C5C52] text-[10px] font-bold uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                    >
                      {p.ticketType}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${p.status === 'Válido' ? 'bg-[#E0E0D8]/40 text-[#5C5C52]' : 'bg-[#E8FCEB] text-[#0A7A07]'}
                    `}
                    style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                    >
                      {p.status === 'Válido' ? <Clock size={12} weight="bold" /> : <CheckCircle size={12} weight="fill" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[11px] text-[#5C5C52] whitespace-nowrap">
                    {p.checkinDate || "—"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCheckIn(p.id, p.checkin);
                      }} 
                      disabled={processingId === p.id}
                      className={`
                        relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none 
                        ${p.checkin ? 'bg-[#1BFF11]' : 'bg-[#E0E0D8]'}
                        ${processingId === p.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                      `}
                    >
                      <span className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                        ${p.checkin ? 'translate-x-5' : 'translate-x-1'}
                        ${p.checkin && !processingId ? 'bg-[#0A0A0A]' : 'bg-white'}
                      `} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-5 py-12 text-center text-[#9A9A8F] text-sm">
                      Nenhum participante encontrado com os filtros atuais.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
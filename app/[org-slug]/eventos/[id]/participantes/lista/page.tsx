'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { manageService, type Participant } from '@/services/manageService'
import { useManage } from '@/context/EventManageContext'
import {
  MagnifyingGlass,
  DownloadSimple,
  ArrowsClockwise,
  CheckCircle,
  Clock,
  CircleNotch,
} from '@phosphor-icons/react'

export default function ParticipantesListaPage() {
  const { 'org-slug': slug, id } = useParams()
  const { session } = useAuth()
  const { data: manageData } = useManage()

  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading]           = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [query, setQuery]               = useState('')
  const [filter, setFilter]             = useState<'todos' | 'checkin' | 'pendente'>('todos')
  const [batchFilter, setBatchFilter]   = useState('todos')

  const load = async () => {
    if (!session?.access_token || !slug || !id) return
    try {
      setLoading(true)
      const data = await manageService.getParticipants(
        session.access_token,
        slug as string,
        id as string,
      )
      setParticipants(data || [])
    } catch (e) {
      console.error('Erro ao carregar participantes:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [session?.access_token, slug, id])

  // ── Lotes únicos para o select ────────────────────────────────────────────
  const batchOptions = useMemo(() => {
    const names = [...new Set(participants.map((p) => p.batch_name))]
    return names
  }, [participants])

  // ── Filtros ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const q = query.toLowerCase()
      const matchesQuery =
        (p.user.full_name ?? '').toLowerCase().includes(q) ||
        (p.user.email ?? '').toLowerCase().includes(q) ||
        p.ticket_id.toLowerCase().includes(q)

      const matchesFilter =
        filter === 'todos' ||
        (filter === 'checkin'  && p.ticket_status === 'used') ||
        (filter === 'pendente' && p.ticket_status !== 'used')

      const matchesBatch =
        batchFilter === 'todos' || p.batch_name === batchFilter

      return matchesQuery && matchesFilter && matchesBatch
    })
  }, [participants, query, filter, batchFilter])

  // ── Resumo check-in (prefere dados do contexto se disponível) ─────────────
  const total        = participants.length
  const checkedCount = participants.filter((p) => p.ticket_status === 'used').length
  const percentage   = total > 0 ? Math.round((checkedCount / total) * 100) : 0

  // ── Toggle check-in ───────────────────────────────────────────────────────
  const handleToggleCheckIn = async (ticketId: string, currentStatus: string) => {
    if (processingId || !session?.access_token) return
    setProcessingId(ticketId)

    const isNowChecked = currentStatus !== 'used'

    // Optimistic update
    setParticipants((prev) =>
      prev.map((p) =>
        p.ticket_id === ticketId
          ? {
              ...p,
              ticket_status: isNowChecked ? 'used' : 'valid',
              checked_in_at: isNowChecked
                ? new Date().toISOString()
                : null,
            }
          : p,
      ),
    )

    try {
      await manageService.patchCheckin(
        session.access_token,
        slug as string,
        id as string,
        ticketId,
        isNowChecked,
      )
    } catch (e) {
      console.error('Erro ao atualizar check-in:', e)
      // Reverte em caso de erro
      await load()
    } finally {
      setProcessingId(null)
    }
  }

  const formatCheckinDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">

      {/* ── Resumo check-in ── */}
      <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2
            className="text-lg font-extrabold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: '-0.5px' }}
          >
            Total de check-in efetuados
          </h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#5C5C52] border border-[#E0E0D8] bg-[#F7F7F2] rounded-[10px] hover:bg-[#F0F0EB] transition-colors uppercase disabled:opacity-50"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              <ArrowsClockwise size={14} weight="bold" className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>

            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-[#E0E0D8] rounded-[10px] bg-white text-[#5C5C52] font-semibold outline-none focus:border-[#0A0A0A]/30 transition-colors"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              <option value="todos">Todos os lotes</option>
              {batchOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2.5">
          <p
            className="text-3xl font-extrabold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: '-1px' }}
          >
            {checkedCount}{' '}
            <span className="text-lg font-medium text-[#9A9A8F]">({percentage}%)</span>
          </p>

          <div className="w-full h-2.5 bg-[#F0F0EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0A0A0A] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div
            className="flex justify-between text-[11px] text-[#5C5C52] font-medium pt-1"
            style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
          >
            <span>
              Até o momento {percentage}% ({checkedCount} de {total}) dos participantes confirmados realizaram check-in.
            </span>
            <span>Total: {total}</span>
          </div>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] flex flex-col min-h-[500px] overflow-hidden">

        <div className="p-5 border-b border-[#F0F0EB] flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-[#F7F7F2]/50">
          <h3
            className="text-[#0A0A0A] font-extrabold text-base"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            Lista de participantes inscritos
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Nome, e-mail ou ingresso..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-[12px] bg-white border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              />
              <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex gap-1 p-1 rounded-[12px] bg-[#F0F0EB] border border-[#E0E0D8]">
                {(['todos', 'checkin', 'pendente'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold uppercase tracking-wider transition-all ${
                      filter === f ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#9A9A8F] hover:text-[#5C5C52]'
                    }`}
                    style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-[#E0E0D8] mx-1 hidden md:block" />

              <button
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-[#E0E0D8] bg-white rounded-[12px] text-[#0A0A0A] text-xs font-bold hover:bg-[#F7F7F2] transition-colors"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                <DownloadSimple size={16} weight="bold" /> Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#9A9A8F]">
              <CircleNotch size={28} weight="bold" className="animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-[#F0F0EB]">
                <tr>
                  {['Participante', 'ID Ingresso', 'Lote', 'Status', 'Data Check-in', 'Check-in'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest whitespace-nowrap"
                      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className="divide-y divide-[#F0F0EB] text-sm text-[#0A0A0A]"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                {filtered.map((p) => {
                  const isUsed = p.ticket_status === 'used'
                  return (
                    <tr key={p.ticket_id} className="hover:bg-[#F7F7F2] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#0A0A0A]">{p.user.full_name ?? '—'}</div>
                        <div className="text-[11px] text-[#5C5C52] mt-0.5">{p.user.email ?? '—'}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-[#5C5C52]">
                        {p.ticket_id.slice(0, 12).toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-block px-2.5 py-1 rounded-[6px] bg-[#F0F0EB] text-[#5C5C52] text-[10px] font-bold uppercase tracking-wider"
                          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                        >
                          {p.batch_name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isUsed ? 'bg-[#E8FCEB] text-[#0A7A07]' : 'bg-[#E0E0D8]/40 text-[#5C5C52]'
                          }`}
                          style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                        >
                          {isUsed ? <CheckCircle size={12} weight="fill" /> : <Clock size={12} weight="bold" />}
                          {isUsed ? 'Utilizado' : 'Válido'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[11px] text-[#5C5C52] whitespace-nowrap">
                        {formatCheckinDate(p.checked_in_at)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleCheckIn(p.ticket_id, p.ticket_status)}
                          disabled={processingId === p.ticket_id}
                          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            isUsed ? 'bg-[#1BFF11]' : 'bg-[#E0E0D8]'
                          } ${processingId === p.ticket_id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                              isUsed ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[#9A9A8F] text-sm">
                      Nenhum participante encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
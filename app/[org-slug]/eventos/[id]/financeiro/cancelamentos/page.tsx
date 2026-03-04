'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { manageService, type Refund } from '@/services/manageService'
import {
  MagnifyingGlass,
  DownloadSimple,
  Warning,
  CheckCircle,
  XCircle,
  Clock,
  Funnel,
  CircleNotch,
} from '@phosphor-icons/react'

const StatusBadge = ({ status }: { status: Refund['status'] }) => {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8FCEB] text-[#0A7A07]" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
        <CheckCircle size={12} weight="fill" /> Reembolsado
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCE8E8] text-[#D91B1B]" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
        <XCircle size={12} weight="fill" /> Rejeitado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF9E6] text-[#B88B00]" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
      <Clock size={12} weight="bold" /> Pendente
    </span>
  )
}

export default function CancelamentosPage() {
  const { 'org-slug': slug, id } = useParams()
  const { session } = useAuth()

  const [refunds, setRefunds]       = useState<Refund[]>([])
  const [loading, setLoading]       = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    if (!session?.access_token || !slug || !id) return
    try {
      setLoading(true)
      const data = await manageService.getCancellations(
        session.access_token,
        slug as string,
        id as string,
      )
      setRefunds(data || [])
    } catch (e) {
      console.error('Erro ao carregar cancelamentos:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [session?.access_token, slug, id])

  const pendingCount  = refunds.filter((r) => r.status === 'pending').length
  const pendingAmount = refunds
    .filter((r) => r.status === 'pending')
    .reduce((acc, r) => acc + r.amount, 0)

  const filteredRequests = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return refunds.filter((r) =>
      r.id.toLowerCase().includes(q) ||
      r.order_id.toLowerCase().includes(q) ||
      (r.buyer_name ?? '').toLowerCase().includes(q) ||
      (r.reason ?? '').toLowerCase().includes(q),
    )
  }, [refunds, searchTerm])

  const handleApprove = async (refundId: string) => {
    if (processingId || !session?.access_token) return
    setProcessingId(refundId)
    // Optimistic
    setRefunds((prev) => prev.map((r) => r.id === refundId ? { ...r, status: 'completed' } : r))
    try {
      await manageService.patchRefund(session.access_token, slug as string, id as string, refundId, 'approved')
    } catch (e) {
      console.error(e)
      await load()
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (refundId: string) => {
    if (processingId || !session?.access_token) return
    setProcessingId(refundId)
    setRefunds((prev) => prev.map((r) => r.id === refundId ? { ...r, status: 'rejected' } : r))
    try {
      await manageService.patchRefund(session.access_token, slug as string, id as string, refundId, 'rejected')
    } catch (e) {
      console.error(e)
      await load()
    } finally {
      setProcessingId(null)
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0A0A0A]" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: '-0.5px' }}>
          Cancelamentos
        </h1>
        <p className="text-sm text-[#9A9A8F] mt-0.5" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
          {refunds.length} solicitações · {fmt(pendingAmount)} pendente de reembolso
        </p>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius-card-sm,16px)] bg-[#FFF9E6] border border-[#F0E6CC]">
          <Warning size={18} weight="bold" className="text-[#B88B00] mt-0.5 shrink-0" />
          <p className="text-sm text-[#0A0A0A]" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
            Você tem <strong>{pendingCount} {pendingCount === 1 ? 'reembolso pendente' : 'reembolsos pendentes'}</strong>.{' '}
            Processe dentro de 5 dias úteis para evitar disputas com o processador de pagamento.
          </p>
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-card-md,20px)] shadow-sm border border-[#E0E0D8] flex flex-col min-h-[500px] overflow-hidden">

        <div className="p-5 border-b border-[#F0F0EB] flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-[#F7F7F2]/50">
          <h3 className="text-[#0A0A0A] font-extrabold text-base" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
            Solicitações de cancelamento de pedidos
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="ID do pedido, reembolso ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-[12px] bg-white border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              />
              <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
            </div>

            <button
              className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[#E0E0D8] bg-white rounded-[12px] text-[#0A0A0A] text-xs font-bold hover:bg-[#F7F7F2] transition-colors"
              style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
            >
              <DownloadSimple size={16} weight="bold" /> Exportar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#9A9A8F]">
              <CircleNotch size={28} weight="bold" className="animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-[#9A9A8F] text-sm gap-3">
              <div className="w-12 h-12 bg-[#F0F0EB] rounded-full flex items-center justify-center text-[#5C5C52]">
                <Funnel size={24} weight="bold" />
              </div>
              <span style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                {searchTerm ? 'Nenhuma solicitação encontrada para esta busca.' : 'Ainda não existem solicitações de cancelamento.'}
              </span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-[#F0F0EB]">
                <tr>
                  {['ID Solicitação', 'Pedido', 'Data', 'Motivo', 'Valor', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest whitespace-nowrap" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EB] text-sm text-[#0A0A0A]" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F7F7F2] transition-colors">
                    <td className="px-5 py-4 font-mono text-[11px] text-[#5C5C52]" title={req.id}>
                      {req.id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono text-[11px] text-[#0A0A0A] font-bold">{req.order_id}</div>
                      <div className="text-[11px] text-[#5C5C52] mt-0.5">{req.buyer_name ?? '—'}</div>
                    </td>
                    <td className="px-5 py-4 text-[11px] text-[#5C5C52]">
                      {new Date(req.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#5C5C52] max-w-[250px] truncate" title={req.reason ?? ''}>
                      {req.reason || 'Sem motivo informado'}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#0A0A0A]">
                      {fmt(req.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                            className="text-[#0A7A07] text-[10px] font-bold uppercase tracking-wider border border-[#0A7A07]/30 px-3 py-1.5 rounded-[8px] hover:bg-[#E8FCEB] transition-colors disabled:opacity-50"
                            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                          >
                            {processingId === req.id ? <CircleNotch size={12} className="animate-spin" /> : 'Aprovar'}
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={processingId === req.id}
                            className="text-[#D91B1B] text-[10px] font-bold uppercase tracking-wider border border-[#D91B1B]/30 px-3 py-1.5 rounded-[8px] hover:bg-[#FCE8E8] transition-colors disabled:opacity-50"
                            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#9A9A8F] text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredRequests.length > 0 && (
          <div className="p-5 border-t border-[#F0F0EB] flex items-center justify-between text-xs text-[#5C5C52] bg-white" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
            <p>Mostrando {filteredRequests.length} solicitações</p>
          </div>
        )}
      </div>
    </div>
  )
}
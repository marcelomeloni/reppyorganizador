'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Ticket,
  CurrencyDollar,
  Users,
  TrendUp,
  CalendarBlank,
  MapPin,
  WarningCircle,
  CheckCircle,
  ShareFat,
  X,
  ProhibitInset,
  Gear,
  CircleNotch,
} from '@phosphor-icons/react'

import CancelEventModal from '@/components/eventos/CancelEventModal'
import EventFlyerButton from '@/components/eventos/EventFlyerButton'
import { useManage } from '@/context/EventManageContext'
import { eventService } from '@/services/eventService'
import { useAuth } from '@/context/AuthContext'

export default function EventPage() {
  const { 'org-slug': slug, id } = useParams()
  const { session } = useAuth()
  const { data, loading, reload } = useManage()

  const [copied, setCopied]       = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const event    = data?.event
  const stats    = data?.stats
  const hasBankAccount = data?.has_bank_account ?? true

  const isCancelled = event?.status === 'cancelled'
  const isDraft     = event?.status === 'draft'

  // ── Localização parseada ──────────────────────────────────────────────────
  const location = useMemo(() => {
    if (!event?.location) return null
    try { return JSON.parse(event.location) } catch { return null }
  }, [event?.location])

  const city = [location?.venue_name, location?.city].filter(Boolean).join(', ') || null

  // ── public_url derivado do slug ───────────────────────────────────────────
  const publicUrl = event?.slug ? `reppy.com.br/${event.slug}` : null

  // ── Stats cards ───────────────────────────────────────────────────────────
  const statsData = useMemo(() => {
    if (!stats) return []
    return [
      {
        label: 'Ingressos vendidos',
        value: stats.tickets_sold,
        sub: `de ${stats.total_capacity}`,
        icon: <Ticket size={20} weight="bold" />,
        iconColor: 'text-[#0A7A07]',
        iconBg: 'bg-[#E8FCEB]',
      },
      {
        label: 'Receita bruta',
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.gross_revenue),
        sub: 'consolidado total',
        icon: <CurrencyDollar size={20} weight="bold" />,
        iconColor: 'text-[#0A7A07]',
        iconBg: 'bg-[#E8FCEB]',
      },
      {
        label: 'Pedidos aprovados',
        value: stats.orders_approved,
        sub: `${stats.orders_cancelled} cancelamento${stats.orders_cancelled !== 1 ? 's' : ''}`,
        icon: <Users size={20} weight="bold" />,
        iconColor: 'text-[#6B1FD4]',
        iconBg: 'bg-[#F3E8FF]',
      },
      {
        label: 'Taxa de ocupação',
        value: stats.total_capacity > 0
          ? `${Math.round((stats.tickets_sold / stats.total_capacity) * 100)}%`
          : '—',
        sub: 'ingressos vendidos',
        icon: <TrendUp size={20} weight="bold" />,
        iconColor: 'text-[#0A7A07]',
        iconBg: 'bg-[#E8FCEB]',
      },
    ]
  }, [stats])

  const handleCopyLink = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(`https://${publicUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCancelConfirm = async () => {
    if (!session?.access_token || !slug || !id) return
    try {
      setCancelling(true)
      await eventService.cancel(session.access_token, slug as string, id as string)
      await reload()
    } finally {
      setCancelling(false)
      setCancelOpen(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#9A9A8F]">
        <CircleNotch size={28} weight="bold" className="animate-spin" />
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">

      {/* ── Cancelled banner ── */}
      {isCancelled && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius-card-sm,16px)] bg-[#FCE8E8] border border-[#FF2D2D]/20">
          <WarningCircle size={18} weight="fill" className="text-[#D91B1B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#D91B1B]" style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}>
              Este evento foi cancelado
            </p>
            <p className="text-xs text-[#D91B1B]/80 mt-0.5" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
              As vendas foram suspensas. Os compradores podem solicitar reembolso.
            </p>
          </div>
        </div>
      )}

      {/* ── No bank account warning ── */}
      {!hasBankAccount && !isCancelled && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[var(--radius-card-sm,16px)] bg-[#FFF8E6] border border-[#F59E0B]/25">
          <div className="flex items-center gap-3">
            <WarningCircle size={18} weight="fill" className="text-[#A86A00] shrink-0" />
            <p className="text-sm text-[#A86A00]" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
              <strong>Cadastre sua conta bancária</strong> para habilitar saques.
            </p>
          </div>
          <Link
            href="../config"
            className="flex items-center gap-1.5 px-3 py-2 rounded-[100px] text-xs font-bold text-[#A86A00] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#F59E0B]/30 transition-all"
            style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
          >
            <Gear size={13} weight="bold" />
            Configurar
          </Link>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="rounded-[var(--radius-card-lg,28px)] bg-[#0A0A0A] overflow-hidden relative z-0">
        <div className={`h-32 md:h-40 relative ${
          isCancelled
            ? 'bg-gradient-to-br from-[#1a0a0a] to-[#2a1a1a]'
            : 'bg-gradient-to-br from-[#1BFF11]/25 via-[#0A0A0A] to-[#8B2FFF]/20'
        }`}>
          {event.image_url && (
            <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23ffffff10' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")` }}
          />
        </div>

        <div className="px-5 md:px-6 pb-5 pt-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            {/* Left */}
            <div>
              <h1
                className="text-[22px] md:text-[28px] font-extrabold text-[#F7F7F2] leading-tight"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: '-1px' }}
              >
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-sm text-[#9A9A8F]" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                {event.start_date && (
                  <span className="flex items-center gap-1.5">
                    <CalendarBlank size={14} weight="bold" />
                    {new Date(event.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                {city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} weight="bold" />
                    {city}
                  </span>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 flex-wrap">
              {!isCancelled && (
                <EventFlyerButton eventId={event.id} eventSlug={event.slug} />
              )}

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[100px] text-sm font-bold text-[#F7F7F2] bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] transition-all"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
              >
                {copied
                  ? <CheckCircle size={16} weight="bold" className="text-[#1BFF11]" />
                  : <ShareFat size={16} weight="fill" />}
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>

              {!isCancelled ? (
                <button
                  onClick={() => setCancelOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[100px] text-sm font-bold text-[#D91B1B] bg-[#D91B1B]/10 hover:bg-[#D91B1B]/20 border border-[#D91B1B]/20 transition-all"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  <X size={16} weight="bold" />
                  Cancelar evento
                </button>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[100px] text-xs font-bold text-[#D91B1B] bg-[#D91B1B]/10 border border-[#D91B1B]/20"
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  <ProhibitInset size={14} weight="fill" />
                  CANCELADO
                </span>
              )}

              {!isCancelled && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    isDraft
                      ? 'bg-white/5 text-[#9A9A8F] border-[#9A9A8F]/20'
                      : 'bg-[#1BFF11]/10 text-[#1BFF11] border-[#1BFF11]/20'
                  }`}
                  style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
                >
                  {!isDraft && <span className="w-1.5 h-1.5 rounded-full bg-[#1BFF11] animate-pulse" />}
                  {isDraft ? 'RASCUNHO' : 'PUBLICADO'}
                </span>
              )}
            </div>
          </div>

          {publicUrl && (
            <div className="mt-4">
              <a
                href={`https://${publicUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#5C5C52] hover:text-[#1BFF11] transition-colors underline underline-offset-2"
                style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}
              >
                {publicUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsData.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[var(--radius-card-md,20px)] bg-white border border-[#E0E0D8] p-4 flex flex-col gap-3 ${isCancelled ? 'opacity-60 grayscale' : ''}`}
          >
            <div className={`w-9 h-9 rounded-[10px] ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p
                className="text-[20px] md:text-[22px] font-extrabold text-[#0A0A0A] leading-none"
                style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)", letterSpacing: '-0.5px' }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-[#9A9A8F] mt-1" style={{ fontFamily: "var(--font-body,'Plus Jakarta Sans',sans-serif)" }}>
                {stat.sub}
              </p>
            </div>
            <p
              className="text-[10px] text-[#5C5C52] mt-auto font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Cancel modal ── */}
      {cancelOpen && (
        <div className="relative z-50">
          <CancelEventModal
            eventTitle={event.title}
            onClose={() => setCancelOpen(false)}
            onConfirm={handleCancelConfirm}
            loading={cancelling}
          />
        </div>
      )}
    </div>
  )
}
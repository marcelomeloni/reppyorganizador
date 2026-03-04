'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgHeader } from '@/components/org/OrgHeader'
import { Plus, Ticket, Users, TrendUp, ArrowRight, CalendarBlank, MapPin } from '@phosphor-icons/react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useOrganization } from '@/context/OrganizationContext'
import { api } from '@/services/apiService'

type EventSummary = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'cancelled' | 'finished'
  image_url: string | null
  start_date: string | null
  venue: string | null
  tickets_sold: number
  total_capacity: number
}

type OrgOverviewResponse = {
  total_tickets: number
  total_revenue: number
  total_members: number
  upcoming_events: EventSummary[]
}

const STATUS_LABEL: Record<string, { label: string; class: string }> = {
  draft:     { label: 'Rascunho',  class: 'bg-gray-100 text-gray-500' },
  published: { label: 'Publicado', class: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-600' },
  finished:  { label: 'Encerrado', class: 'bg-[#F0F0EB] text-[#5C5C52]' },
}

export default function OrgPage() {
  const params = useParams()
  const slug = params['org-slug'] as string
  const router = useRouter()
  const { session } = useAuth()
  const { currentOrg, loading } = useOrganization()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState<OrgOverviewResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (loading) return // aguarda org carregar antes de checar role
    if (!currentOrg) return
    if (currentOrg.role === 'promoter') router.replace(`/${slug}/eventos`)
    if (currentOrg.role === 'checkin_staff') router.replace(`/${slug}/eventos`)
  }, [currentOrg, loading, slug, router])

  useEffect(() => {
    if (loading) return
    if (!session?.access_token || !slug) return
    if (!currentOrg) return
    if (currentOrg.role === 'promoter' || currentOrg.role === 'checkin_staff') return

    setIsLoading(true)
    api.get<OrgOverviewResponse>(`/org/${slug}/overview`, session.access_token)
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [session, slug, currentOrg, loading])

  if (loading || currentOrg?.role === 'promoter' || currentOrg?.role === 'checkin_staff') return null

  const events = data?.upcoming_events ?? []

  return (
    <div className="flex min-h-screen bg-[#F7F7F2]">
      <OrgSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <OrgHeader onMenuOpen={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-8 md:mb-10">
            <div>
              <p className="text-xs font-bold text-[#9A9A8F] uppercase tracking-[0.2em] mb-2">
                Visão Geral
              </p>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[#0A0A0A] leading-none">
                Sua Organização.
              </h1>
            </div>
            <Link
              href={`/${slug}/eventos/novo`}
              className="inline-flex items-center gap-2 bg-[#0A0A0A] text-white px-5 py-3 rounded-[100px] font-bold text-sm hover:bg-[#1BFF11] hover:text-[#0A0A0A] transition-all shadow-xl shadow-black/5 self-start sm:self-auto"
            >
              <Plus size={18} weight="bold" /> Criar Evento
            </Link>
          </div>

          {!isLoading && data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                <StatCard 
                  label="Ingressos Vendidos" 
                  value={data.total_tickets.toString()} 
                  icon={Ticket} 
                  colorClass="bg-blue-50 text-blue-600" 
                />
                <StatCard 
                  label="Membros da Equipe" 
                  value={data.total_members.toString()} 
                  icon={Users} 
                  colorClass="bg-purple-50 text-purple-600" 
                />
                <StatCard 
                  label="Eventos Ativos" 
                  value={events.filter((e) => e.status === 'published').length.toString()} 
                  icon={TrendUp} 
                  colorClass="bg-green-50 text-green-600" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-extrabold text-lg text-[#0A0A0A]">Eventos Recentes</h2>
                  <Link href={`/${slug}/eventos`} className="text-xs font-bold text-[#9A9A8F] hover:text-[#0A0A0A] flex items-center gap-1 transition-colors">
                    Ver todos <ArrowRight size={13} weight="bold" />
                  </Link>
                </div>

                {events.length === 0 ? (
                  <EmptyState slug={slug} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} slug={slug} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, colorClass }: any) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-[20px] border border-[#E0E0D8] flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={22} weight="fill" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#9A9A8F] uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-display font-extrabold text-[#0A0A0A]">{value}</p>
      </div>
    </div>
  )
}

function EmptyState({ slug }: { slug: string }) {
  return (
    <div className="bg-white border-2 border-dashed border-[#E0E0D8] rounded-[24px] p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-[#F0F0EB] rounded-full flex items-center justify-center mb-4">
        <Ticket size={26} weight="bold" className="text-[#9A9A8F]" />
      </div>
      <h3 className="font-display font-bold text-[#0A0A0A] text-base">Nenhum evento criado</h3>
      <p className="text-sm text-[#9A9A8F] max-w-xs mt-2">
        Crie seu primeiro evento para começar a vender ingressos.
      </p>
      <Link
        href={`/${slug}/eventos/novo`}
        className="mt-5 text-sm font-bold text-[#0A0A0A] flex items-center gap-2 hover:gap-3 transition-all"
      >
        Criar meu primeiro evento <ArrowRight size={16} weight="bold" />
      </Link>
    </div>
  )
}

function EventCard({ event, slug }: { event: EventSummary, slug: string }) {
  const st = STATUS_LABEL[event.status] ?? STATUS_LABEL.draft

  return (
    <Link
      href={`/${slug}/eventos/${event.id}`}
      className="bg-white border border-[#E0E0D8] rounded-[20px] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <div className="h-36 bg-[#F0F0EB] relative">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9A9A8F]">
            <Ticket size={32} />
          </div>
        )}
        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${st.class}`}>
          {st.label}
        </span>
      </div>

      <div className="p-4">
        <p className="font-bold text-sm text-[#0A0A0A] truncate group-hover:text-[#1BFF11] transition-colors">
          {event.title}
        </p>
        <div className="mt-2 space-y-1">
          {event.start_date && (
            <p className="text-xs text-[#9A9A8F] flex items-center gap-1.5">
              <CalendarBlank size={12} weight="bold" /> {event.start_date}
            </p>
          )}
          {event.venue && (
            <p className="text-xs text-[#9A9A8F] flex items-center gap-1.5 truncate">
              <MapPin size={12} weight="bold" /> {event.venue}
            </p>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-[#F0F0EB] flex items-center justify-between">
          <p className="text-xs text-[#9A9A8F]">
            <span className="font-bold text-[#0A0A0A]">{event.tickets_sold}</span>
            {event.total_capacity > 0 && ` / ${event.total_capacity}`} ingressos
          </p>
          <ArrowRight size={14} weight="bold" className="text-[#9A9A8F] group-hover:text-[#0A0A0A] transition-colors" />
        </div>
      </div>
    </Link>
  )
}
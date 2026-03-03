'use client'
import { useState, useEffect } from 'react'
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgHeader } from '@/components/org/OrgHeader'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { eventService, type EventSummary } from '@/services/eventService' // Atualize o path se necessário
import { 
  Plus, 
  Calendar, 
  MapPin, 
  MagnifyingGlass,
  ChartBar, // Corrigido de ChartBarIcon
  Trash,
  PencilSimple,
  CircleNotch
} from '@phosphor-icons/react'

export default function EventsPage() {
  const { 'org-slug': slug } = useParams()
  const { session } = useAuth()

  const [events, setEvents] = useState<EventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // Vazio = Todos

  const loadEvents = async () => {
    if (!session?.access_token || !slug) return
    try {
      setLoading(true)
      // Se tiver statusFilter, passa pra API, senão passa undefined
      const data = await eventService.list(session.access_token, slug as string, statusFilter || undefined)
      setEvents(data || [])
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Recarrega sempre que o token, o slug ou o filtro de status mudarem
  useEffect(() => {
    loadEvents()
  }, [session?.access_token, slug, statusFilter])

  // Filtro local apenas para a busca por texto
  const filteredEvents = events.filter((e) => 
    e.title.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Data a definir'
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).replace(' de ', '/').replace(',', ' às')
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F2] font-display">
      <OrgSidebar />
      
      <div className="flex-1">
        <OrgHeader />
        
        <main className="p-8 max-w-6xl mx-auto">
          {/* ── HEADER ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h1 className="font-bricolage font-extrabold text-3xl text-black leading-none">Eventos</h1>
              <p className="text-gray-500 font-body text-sm mt-1">Crie e gerencie os ingressos dos seus rolês.</p>
            </div>
            
            <Link 
              href={`/${slug}/eventos/novo`}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-[100px] font-bold hover:bg-[#1BFF11] hover:text-black transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} weight="bold" /> Criar Novo Evento
            </Link>
          </div>

          {/* ── BARRA DE FERRAMENTAS ── */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar evento pelo nome..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E0E0D8] rounded-2xl focus:border-black transition-all outline-none text-sm font-medium shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E0E0D8] rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:border-black shadow-sm cursor-pointer"
              >
                <option value="">Todos os Status</option>
                <option value="published">Publicados</option>
                <option value="draft">Rascunhos</option>
                <option value="finished">Encerrados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>

          {/* ── ESTADO DE CARREGAMENTO ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#9A9A8F]">
              <CircleNotch size={32} weight="bold" className="animate-spin mb-4" />
              <p className="text-sm font-bold animate-pulse">Buscando eventos...</p>
            </div>
          ) : (
            <>
              {/* ── LISTA DE EVENTOS ── */}
              <div className="grid grid-cols-1 gap-4">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-[#E0E0D8] rounded-[24px]">
                    <p className="text-[#9A9A8F] text-sm font-medium">Nenhum evento encontrado.</p>
                  </div>
                ) : (
                  filteredEvents.map((event) => {
                    // Impede NaN% na barra de progresso se a capacidade for 0
                    const capacityPct = event.total_capacity > 0 
                      ? Math.min(100, (event.tickets_sold / event.total_capacity) * 100) 
                      : 0

                    const locationText = [event.venue, event.city].filter(Boolean).join(' - ') || 'Local a definir'

                    return (
                      <div 
                        key={event.id}
                        className="bg-white border border-[#E0E0D8] rounded-[24px] p-2 hover:border-black transition-all group shadow-sm flex flex-col md:flex-row items-center gap-6"
                      >
                        {/* Imagem do Evento */}
                        <div className="w-full md:w-44 h-32 rounded-[18px] overflow-hidden bg-[#F0F0EB] shrink-0">
                          {event.image_url ? (
                            <img src={event.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={event.title} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#9A9A8F]">
                              <Calendar size={32} weight="bold" />
                            </div>
                          )}
                        </div>

                        {/* Info Principal */}
                        <div className="flex-1 space-y-2 w-full px-4 md:px-0">
                          <div className="flex items-center gap-3">
                            <StatusBadge status={event.status} />
                            <span className="text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest flex items-center gap-1">
                              <MapPin size={12} weight="fill" /> {locationText}
                            </span>
                          </div>
                          <h3 className="font-display font-extrabold text-xl text-[#0A0A0A] leading-tight">
                            {event.title}
                          </h3>
                          <p className="text-sm font-bold text-[#9A9A8F] flex items-center gap-2">
                            <Calendar size={16} weight="bold" className="text-black" />
                            {formatDate(event.start_date)}
                          </p>
                        </div>

                        {/* Vendas (Stats) */}
                        <div className="w-full md:w-48 px-4 md:px-0">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-[#9A9A8F] uppercase">Vendas</span>
                            <span className="text-xs font-bold text-[#0A0A0A]">{event.tickets_sold} / {event.total_capacity}</span>
                          </div>
                          <div className="w-full h-2 bg-[#F0F0EB] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#1BFF11] transition-all duration-1000" 
                              style={{ width: `${capacityPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2 p-4 md:pr-6 w-full md:w-auto justify-end">
                          <Link 
                            href={`/${slug}/eventos/${event.id}`}
                            className="p-3 bg-[#F7F7F2] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] rounded-xl transition-all border border-transparent hover:border-[#E0E0D8]"
                            title="Ver Dashboard do Evento"
                          >
                            <ChartBar size={20} weight="bold" />
                          </Link>
                          <Link 
                            href={`/${slug}/eventos/${event.id}/editar`}
                            className="p-3 bg-[#F7F7F2] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] rounded-xl transition-all border border-transparent hover:border-[#E0E0D8]"
                            title="Editar Evento"
                          >
                            <PencilSimple size={20} weight="bold" />
                          </Link>
                          <button 
                            className="p-3 bg-[#F7F7F2] text-[#9A9A8F] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Excluir Evento"
                          >
                            <Trash size={20} weight="bold" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* ── FOOTER / PAGINAÇÃO ── */}
              <div className="mt-8 pt-8 border-t border-[#E0E0D8] flex justify-center">
                 <p className="text-xs text-[#9A9A8F] font-medium">Mostrando {filteredEvents.length} eventos</p>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}

// Badge de Status com as tipagens da API
function StatusBadge({ status }: { status: EventSummary['status'] }) {
  const configs = {
    published: { label: 'Publicado', color: 'bg-green-50 text-green-600 border-green-100' },
    draft:     { label: 'Rascunho',  color: 'bg-orange-50 text-orange-600 border-orange-100' },
    finished:  { label: 'Encerrado', color: 'bg-gray-100 text-gray-500 border-gray-200' },
    cancelled: { label: 'Cancelado', color: 'bg-red-50 text-red-600 border-red-100' },
  }
  const config = configs[status] || configs.draft
  
  return (
    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${config.color}`}>
      {config.label}
    </span>
  )
}
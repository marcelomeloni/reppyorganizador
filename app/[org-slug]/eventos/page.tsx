'use client'
import { useState } from 'react'
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgHeader } from '@/components/org/OrgHeader'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Plus, 
  Calendar, 
  Ticket, 
  MapPin, 
  DotsThreeVertical, 
  MagnifyingGlass,
  ArrowRight,
  Eye,Trash,
  PencilSimple,
  Users
} from '@phosphor-icons/react'

// Mock de Eventos
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Open Bar dos Bixos 2024',
    date: '15 Mai, 22:00',
    location: 'Chácara Paraíso',
    status: 'PUBLISHED',
    ticketsSold: 450,
    totalCapacity: 600,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80'
  },
  {
    id: '2',
    title: 'Inter-Repúblicas',
    date: '10 Jun, 14:00',
    location: 'Arena Universitária',
    status: 'DRAFT',
    ticketsSold: 0,
    totalCapacity: 1000,
    image: null
  },
  {
    id: '3',
    title: 'Cervejada de Inverno',
    date: '12 Jul, 16:00',
    location: 'Espaço Modular',
    status: 'PAST',
    ticketsSold: 890,
    totalCapacity: 900,
    image: 'https://images.unsplash.com/photo-1514525253361-b83f859b73c0?w=500&q=80'
  }
]

export default function EventsPage() {
  const { 'org-slug': slug } = useParams()
  const [search, setSearch] = useState('')

  return (
    <div className="flex min-h-screen bg-off-white font-display">
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
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-pill font-bold hover:bg-primary hover:text-black transition-all shadow-lg"
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
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-black transition-all outline-none text-sm shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <select className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:border-black shadow-sm appearance-none cursor-pointer">
                <option>Todos os Status</option>
                <option>Publicados</option>
                <option>Rascunhos</option>
                <option>Encerrados</option>
              </select>
            </div>
          </div>

          {/* ── LISTA DE EVENTOS ── */}
          <div className="grid grid-cols-1 gap-4">
            {MOCK_EVENTS.map((event) => (
              <div 
                key={event.id}
                className="bg-white border border-gray-200 rounded-[24px] p-2 hover:border-black transition-all group shadow-sm flex flex-col md:flex-row items-center gap-6"
              >
                {/* Imagem do Evento */}
                <div className="w-full md:w-44 h-32 rounded-[18px] overflow-hidden bg-gray-100 shrink-0">
                  {event.image ? (
                    <img src={event.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Calendar size={32} weight="bold" />
                    </div>
                  )}
                </div>

                {/* Info Principal */}
                <div className="flex-1 space-y-2 w-full px-4 md:px-0">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={event.status as any} />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={12} weight="fill" /> {event.location}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-black leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                    <Calendar size={16} weight="bold" className="text-primary-dark" />
                    {event.date}
                  </p>
                </div>

                {/* Vendas (Stats) */}
                <div className="w-full md:w-48 px-4 md:px-0">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Vendas</span>
                    <span className="text-xs font-bold text-black">{event.ticketsSold} / {event.totalCapacity}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${(event.ticketsSold / event.totalCapacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 p-4 md:pr-6 w-full md:w-auto justify-end">
                  <Link 
                    href={`/${slug}/eventos/${event.id}`}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
                    title="Ver Dashboard do Evento"
                  >
                    <Eye size={20} weight="bold" />
                  </Link>
                  <Link 
                    href={`/${slug}/eventos/${event.id}/editar`}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
                  >
                    <PencilSimple size={20} weight="bold" />
                  </Link>
                  <button className="p-3 bg-gray-50 text-gray-400 hover:text-red hover:bg-red/5 rounded-xl transition-all border border-transparent hover:border-red/10">
                    <Trash size={20} weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── FOOTER / PAGINAÇÃO ── */}
          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center">
             <p className="text-xs text-gray-400 font-medium">Mostrando {MOCK_EVENTS.length} eventos</p>
          </div>

        </main>
      </div>
    </div>
  )
}

// Badge de Status
function StatusBadge({ status }: { status: 'PUBLISHED' | 'DRAFT' | 'PAST' }) {
  const configs = {
    PUBLISHED: { label: 'Publicado', color: 'bg-green-50 text-green-600 border-green-100' },
    DRAFT: { label: 'Rascunho', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    PAST: { label: 'Encerrado', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  }
  const config = configs[status]
  return (
    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${config.color}`}>
      {config.label}
    </span>
  )
}
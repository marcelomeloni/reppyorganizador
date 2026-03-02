'use client'
import { useState } from 'react'
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgHeader } from '@/components/org/OrgHeader'
import { Plus, Ticket, Users, TrendUp, ArrowRight } from '@phosphor-icons/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function OrgPage() {
  const { 'org-slug': slug } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-off-white">
      <OrgSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 min-w-0">
        <OrgHeader onMenuOpen={() => setSidebarOpen(true)} />
        
        <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">

          {/* Header de Boas Vindas */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-8 md:mb-10">
            <div>
              <p className="font-body text-xs font-bold text-primary-dark uppercase tracking-[0.2em] mb-2">
                Visão Geral
              </p>
              <h1 className="font-bricolage font-extrabold text-3xl md:text-4xl text-black leading-none">
                Sua Organização.
              </h1>
            </div>
            
            <Link 
              href={"/" + slug + "/eventos/novo"}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-pill font-display font-extrabold text-sm hover:bg-primary hover:text-black transition-all shadow-xl shadow-black/5 self-start sm:self-auto"
            >
              <Plus size={18} weight="bold" /> Criar Evento
            </Link>
          </div>

          {/* Stats Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
            {[
              { label: 'Ingressos Vendidos', value: '0', icon: Ticket, color: 'bg-blue-50 text-blue-600' },
              { label: 'Membros da Equipe', value: '1', icon: Users, color: 'bg-purple-50 text-purple-600' },
              { label: 'Receita Total', value: 'R$ 0,00', icon: TrendUp, color: 'bg-green-50 text-green-600' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-5 md:p-6 rounded-card-lg border border-gray-200 flex items-center gap-4 md:gap-5"
              >
                <div className={"w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 " + stat.color}>
                  <stat.icon size={22} weight="fill" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bricolage font-extrabold text-black">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lista de Eventos */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="font-display font-extrabold text-lg md:text-xl text-black">Próximos Eventos</h2>
            
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] md:rounded-[32px] p-8 md:p-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <Ticket size={28} weight="bold" />
              </div>
              <h3 className="font-display font-bold text-black text-base md:text-lg">Nenhum evento criado</h3>
              <p className="font-body text-sm text-gray-400 max-w-xs mt-2">
                Comece criando seu primeiro evento para vender ingressos e gerenciar sua equipe.
              </p>
              <Link 
                href={"/" + slug + "/eventos/novo"}
                className="mt-5 text-sm font-bold text-black flex items-center gap-2 hover:gap-3 transition-all"
              >
                Criar meu primeiro evento <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
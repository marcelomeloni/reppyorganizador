'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { 
  Layout, 
  Ticket, 
  UsersThree, 
  Gear, 
  CurrencyDollar,
  ArrowLeft,
  X
} from '@phosphor-icons/react'
import { useOrganization } from '@/context/OrganizationContext'

interface OrgSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function OrgSidebar({ isOpen, onClose }: OrgSidebarProps) {
  const { 'org-slug': slug } = useParams()
  const pathname = usePathname()
  const { currentOrg } = useOrganization()

  const role = currentOrg?.role || ''

  const menuItems = [
    { label: 'Visão Geral',   icon: Layout,         href: `/${slug}`,              allowed: ['owner', 'admin'] },
    { label: 'Eventos',       icon: Ticket,         href: `/${slug}/eventos`,      allowed: ['owner', 'admin', 'promoter', 'checkin_staff'] },
    { label: 'Equipe',        icon: UsersThree,     href: `/${slug}/equipe`,       allowed: ['owner', 'admin'] },
    { label: 'Financeiro',    icon: CurrencyDollar, href: `/${slug}/financeiro`,   allowed: ['owner', 'admin'] },
    { label: 'Configurações', icon: Gear,           href: `/${slug}/config`,       allowed: ['owner', 'admin'] },
  ].filter(item => item.allowed.includes(role))

  const SidebarContent = () => (
    <aside className="w-64 border-r border-[#E0E0D8] bg-white flex flex-col h-full">
      <div className="p-6 flex items-center justify-between">
        <Link href="/" onClick={onClose}>
          <img src="/logo_preto.png" alt="Reppy" className="h-6 w-auto" />
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1 text-[#9A9A8F] hover:text-[#0A0A0A] transition-colors"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-[#0A0A0A] text-white shadow-lg shadow-black/10' 
                  : 'text-[#5C5C52] hover:bg-[#F0F0EB] hover:text-[#0A0A0A]'
              }`}
            >
              <item.icon size={20} weight={isActive ? 'fill' : 'bold'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#F0F0EB]">
        <Link 
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#9A9A8F] hover:text-[#0A0A0A] transition-colors"
        >
          <ArrowLeft size={18} weight="bold" />
          Sair da Org
        </Link>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  )
}
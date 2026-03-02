'use client'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { 
  Layout, 
  Ticket, 
  UsersThree, 
  Gear, 
  ArrowLeft,
  X
} from '@phosphor-icons/react'

interface OrgSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function OrgSidebar({ isOpen, onClose }: OrgSidebarProps) {
  const { 'org-slug': slug } = useParams()
  const pathname = usePathname()

  const menuItems = [
    { label: 'Visão Geral', icon: Layout, href: `/${slug}` },
    { label: 'Eventos', icon: Ticket, href: `/${slug}/eventos` },
    { label: 'Equipe', icon: UsersThree, href: `/${slug}/equipe` },
    { label: 'Configurações', icon: Gear, href: `/${slug}/config` },
  ]

  const SidebarContent = () => (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="p-6 flex items-center justify-between">
        <Link href="/" onClick={onClose} className="font-bricolage font-extrabold text-2xl text-black tracking-tighter">
          reppy<span className="text-primary">.</span>
        </Link>
        {/* Close button — só no mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-1 text-gray-400 hover:text-black transition-colors"
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
                  ? 'bg-black text-white shadow-lg shadow-black/10' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <item.icon size={20} weight={isActive ? 'fill' : 'bold'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link 
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-black transition-colors"
        >
          <ArrowLeft size={18} weight="bold" />
          Sair da Org
        </Link>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: sidebar fixa */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile: overlay + drawer deslizante */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
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
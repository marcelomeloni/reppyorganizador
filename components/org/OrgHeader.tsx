'use client'
import { useParams } from 'next/navigation'
import { Bell, User, List } from '@phosphor-icons/react'

interface OrgHeaderProps {
  onMenuOpen: () => void
}

export function OrgHeader({ onMenuOpen }: OrgHeaderProps) {
  const { 'org-slug': slug } = useParams()

  return (
    <header className="h-14 md:h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Left: hamburguer (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Hamburguer — só no mobile */}
        <button
          onClick={onMenuOpen}
          className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-black transition-colors"
          aria-label="Abrir menu"
        >
          <List size={22} weight="bold" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 font-medium text-sm hidden sm:inline">Organização /</span>
          <span className="text-black font-bold text-sm uppercase tracking-wider">{slug}</span>
        </div>
      </div>

   
    </header>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useOrganization } from '@/context/OrganizationContext'
import { EventManageProvider } from '@/context/EventManageContext'
import EventSidebar from '@/components/eventos/EventSidebar'
import EventHeader from '@/components/eventos/EventHeader'

export default function EventLayout({ children }: { children: React.ReactNode }) {
  const params   = useParams()
  const pathname = usePathname()
  const router   = useRouter()
  const { currentOrg, loading } = useOrganization()

  const [menuOpen, setMenuOpen] = useState(false)

  const orgSlug = params['org-slug'] as string
  const id      = params['id'] as string

  useEffect(() => {
    if (loading) return
    if (!currentOrg) return

    const role = currentOrg.role
    const base = `/${orgSlug}/eventos/${id}`

    if (role === 'promoter' && !pathname.startsWith(`${base}/promoter`)) {
      router.replace(`${base}/promoter`)
      return
    }

    if (role === 'checkin_staff' && !pathname.startsWith(`${base}/checkin`)) {
      router.replace(`${base}/checkin`)
      return
    }

    if ((role === 'owner' || role === 'admin') &&
        (pathname.startsWith(`${base}/promoter`) || pathname.startsWith(`${base}/checkin`))) {
      router.replace(base)
    }
  }, [loading, currentOrg, pathname, orgSlug, id, router])

  if (!loading && currentOrg) {
    const role = currentOrg.role
    const base = `/${orgSlug}/eventos/${id}`

    if (role === 'promoter' && !pathname.startsWith(`${base}/promoter`)) return null
    if (role === 'checkin_staff' && !pathname.startsWith(`${base}/checkin`)) return null
    if ((role === 'owner' || role === 'admin') &&
        (pathname.startsWith(`${base}/promoter`) || pathname.startsWith(`${base}/checkin`))) return null
  }

  return (
    <EventManageProvider>
      <div className="flex h-screen bg-[#F7F7F2] overflow-hidden">
        <EventSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <EventHeader
            pageTitle="Painel"
            onMenuToggle={() => setMenuOpen((v) => !v)}
            menuOpen={menuOpen}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </EventManageProvider>
  )
}
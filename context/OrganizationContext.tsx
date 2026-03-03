'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { dashboardService, type OrgSummary } from '@/services/dashboardService'

type OrganizationContextType = {
  orgs: OrgSummary[]
  currentOrg: OrgSummary | null
  setCurrentOrgBySlug: (slug: string) => void
  isOwner: boolean
  isAdmin: boolean
  isOwnerOrAdmin: boolean
  canCheckin: boolean
  loading: boolean
}

const OrganizationContext = createContext<OrganizationContextType>({} as OrganizationContextType)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  const [orgs, setOrgs] = useState<OrgSummary[]>([])
  const [currentOrg, setCurrentOrg] = useState<OrgSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false)
      return
    }

    dashboardService.get(session.access_token)
      .then((data) => {
        setOrgs(data.orgs ?? [])
        setCurrentOrg(data.orgs?.[0] ?? null)
      })
      .finally(() => setLoading(false))
  }, [session?.access_token])

  const setCurrentOrgBySlug = (slug: string) => {
    const org = orgs.find(o => o.slug === slug)
    if (org) setCurrentOrg(org)
  }

  const role = currentOrg?.role ?? null

  const isOwner        = role === 'owner'
  const isAdmin        = role === 'admin'
  const isOwnerOrAdmin = isOwner || isAdmin
  const canCheckin     = isOwner || isAdmin || role === 'checkin_staff'

  return (
    <OrganizationContext.Provider value={{
      orgs,
      currentOrg,
      setCurrentOrgBySlug,
      isOwner,
      isAdmin,
      isOwnerOrAdmin,
      canCheckin,
      loading,
    }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export const useOrganization = () => useContext(OrganizationContext)
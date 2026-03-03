'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useOrganization } from '@/context/OrganizationContext'

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const { 'org-slug': slug } = useParams()
  const { setCurrentOrgBySlug, loading } = useOrganization()

  useEffect(() => {
    if (!loading && slug) {
      setCurrentOrgBySlug(slug as string)
    }
  }, [slug, loading])

  return <>{children}</>
}
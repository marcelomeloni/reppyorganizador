'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { manageService, type EventManageData } from '@/services/manageService'

type ManageContextValue = {
  data: EventManageData | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

const ManageContext = createContext<ManageContextValue>({
  data: null,
  loading: true,
  error: null,
  reload: async () => {},
})

export function EventManageProvider({ children }: { children: React.ReactNode }) {
  const { 'org-slug': slug, id } = useParams()
  const { session } = useAuth()

  const [data, setData]       = useState<EventManageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!session?.access_token || !slug || !id) return
    try {
      setLoading(true)
      setError(null)
      const result = await manageService.getManage(
        session.access_token,
        slug as string,
        id as string,
      )
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados do evento')
    } finally {
      setLoading(false)
    }
  }, [session?.access_token, slug, id])

  useEffect(() => { fetch() }, [fetch])

  return (
    <ManageContext.Provider value={{ data, loading, error, reload: fetch }}>
      {children}
    </ManageContext.Provider>
  )
}

export function useManage() {
  return useContext(ManageContext)
}
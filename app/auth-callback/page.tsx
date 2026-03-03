'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
import { CircleNotch } from '@phosphor-icons/react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { session, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!session?.access_token) {
      router.push('/login')
      return
    }

    authService.callback(session.access_token)
      .then((data) => router.push(data.redirect))
      .catch(() => router.push('/login'))
  }, [session, loading])

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-card-lg border border-gray-200 shadow-sm flex flex-col items-center max-w-sm w-full">
        <CircleNotch size={48} weight="bold" className="text-primary-dark animate-spin mb-6" />
        <h2 className="font-bricolage text-2xl font-extrabold text-black mb-2 leading-tight">
          Preparando seu acesso
        </h2>
        <p className="font-body text-sm text-gray-500">
          Autenticando com segurança e buscando suas organizações...
        </p>
      </div>
    </div>
  )
}
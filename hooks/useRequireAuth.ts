import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  // A MÁGICA TÁ AQUI: Mentimos pro Dashboard que ainda tá carregando se não tiver usuário.
  // Assim a tela do Dashboard NUNCA é desenhada ("splash") se você não estiver logado.
  return { user, loading: loading || !user } 
}
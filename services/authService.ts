import { api } from './apiService'

export type AuthCallbackResponse = {
  redirect: '/dashboard' | '/onboarding'
  user: {
    id: string
    email: string | null
    full_name: string | null
    cpf: string | null
    phone: string | null
    avatar_url: string | null
    is_guest: boolean
  }
  orgs: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    role: 'owner' | 'admin' | 'promoter' | 'checkin_staff'
  }[]
}

export const authService = {
  callback: (token: string) =>
    api.get<AuthCallbackResponse>('/auth/callback', token),
}
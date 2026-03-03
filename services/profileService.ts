import { api } from './apiService'

export type ProfileResponse = {
  id: string
  full_name: string | null
  email: string | null
  cpf: string | null
  phone: string | null
  avatar_url: string | null
}

export const profileService = {
  get: (token: string) =>
    api.get<ProfileResponse>('/profile', token),
}
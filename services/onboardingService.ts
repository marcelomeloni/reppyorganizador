import { api } from './apiService'

export type CreateOrgPayload = {
  full_name: string
  cpf: string
  org_name: string
  org_slug: string
  org_description: string
  org_email: string
  org_phone: string
  org_instagram: string
}

export type CreateOrgResponse = {
  redirect: string
  org_id: string
  message: string
}

export type UpdateProfilePayload = {
  cpf: string
}

export const onboardingService = {
  createOrg: (token: string, payload: CreateOrgPayload) =>
    api.post<CreateOrgResponse>('/onboarding', token, payload),

  updateProfile: (token: string, payload: UpdateProfilePayload) =>
    api.patch<{ message: string }>('/profile', token, payload),
}
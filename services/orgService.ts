import { api } from './apiService'

export type OrgDetails = {
  id: string
  name: string
  slug: string
  description: string | null
  email: string | null
  phone: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  logo_url: string | null
  platform_fee_percentage: number
  platform_fee_fixed: number
  created_at: string
}

export type UpdateOrgPayload = {
  name?: string
  description?: string
  email?: string
  phone?: string
  instagram?: string
  facebook?: string
  website?: string
}

export const orgService = {
  get: (token: string, slug: string) =>
    api.get<OrgDetails>(`/org/${slug}`, token),

  update: (token: string, slug: string, payload: UpdateOrgPayload) =>
    api.patch<{ message: string }>(`/org/${slug}`, token, payload),
  
  deleteOrg: (token: string, slug: string, confirmName: string) =>
  api.delete<{ message: string }>(`/org/${slug}`, token, { confirm_name: confirmName }),
}

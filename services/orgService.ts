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
  banner_url: string | null
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

type UploadImageResponse = { url: string }

async function uploadImage(
  token: string,
  slug: string,
  file: File,
  type: 'logo' | 'banner',
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/org/${slug}/${type}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error ?? `Erro ao fazer upload do ${type}`)
  }

  const data: UploadImageResponse = await response.json()
  return data.url
}

export const orgService = {
  get: (token: string, slug: string) =>
    api.get<OrgDetails>(`/org/${slug}`, token),

  update: (token: string, slug: string, payload: UpdateOrgPayload) =>
    api.patch<{ message: string }>(`/org/${slug}`, token, payload),

  uploadLogo: (token: string, slug: string, file: File) =>
    uploadImage(token, slug, file, 'logo'),

  uploadBanner: (token: string, slug: string, file: File) =>
    uploadImage(token, slug, file, 'banner'),

  deleteOrg: (token: string, slug: string, confirmName: string) =>
    api.delete<{ message: string }>(`/org/${slug}`, token, {
      confirm_name: confirmName,
    }),
}
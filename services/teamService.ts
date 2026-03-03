import { api } from './apiService'

export type OrgMember = {
  id: string
  user_id: string
  role: 'owner' | 'admin' | 'promoter' | 'checkin_staff'
  joined_at: string
  full_name: string | null
  email: string | null
  cpf: string | null
  avatar_url: string | null
}

export const teamService = {
  getMembers: (token: string, slug: string) =>
    api.get<OrgMember[]>(`/org/${slug}/members`, token),

  addMember: (token: string, slug: string, cpf: string, role: OrgMember['role']) =>
    api.post<{ message: string }>(`/org/${slug}/members`, token, { cpf, role }),

  updateRole: (token: string, slug: string, memberID: string, role: OrgMember['role']) =>
    api.patch<{ message: string }>(`/org/${slug}/members/${memberID}`, token, { role }),

  removeMember: (token: string, slug: string, memberID: string) =>
    api.delete<{ message: string }>(`/org/${slug}/members/${memberID}`, token),
}
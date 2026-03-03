import { api } from './apiService'

export type OrgSummary = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  role: 'owner' | 'admin' | 'promoter' | 'checkin_staff'
  events_count: number
}

export type DashboardResponse = {
  user: {
    id: string
    full_name: string | null
    email: string | null
    cpf: string | null
    avatar_url: string | null
    member_since: string
  }
  orgs: OrgSummary[]
}

export const dashboardService = {
  get: (token: string) =>
    api.get<DashboardResponse>('/dashboard', token),
}
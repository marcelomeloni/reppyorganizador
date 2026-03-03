import { api } from './apiService'

export type OrgOverview = {
  total_tickets: number
  total_revenue: number
  total_members: number
  upcoming_events: {
    id: string
    title: string
    slug: string
    status: string
    image_url: string | null
    start_date: string | null
    venue: string | null
    tickets_sold: number
    total_capacity: number
  }[]
}

export const orgDashboardService = {
  getOverview: (token: string, slug: string) =>
    api.get<OrgOverview>(`/org/${slug}/overview`, token),
}
import { api } from './apiService'
import type { TicketCategory } from '@/types/tickets'

export type EventSummary = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'cancelled' | 'finished'
  image_url: string | null
  start_date: string | null
  venue: string | null
  city: string | null
  tickets_sold: number
  total_capacity: number
}

export type TicketBatch = {
  id: string
  name: string
  type: 'paid' | 'free' | 'donation'
  price: number
  quantity_total: number
  quantity_sold: number
  status: 'active' | 'paused' | 'sold_out' | 'finished'
  fee_payer: 'buyer' | 'organizer'
  availability: 'public' | 'private' | 'invite_only'
  min_purchase: number
  max_purchase: number
  start_date: string | null
  end_date: string | null
}

export type LocationDetail = {
  venue_name?: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
}

export type RequirementDetail = {
  min_age?: string
  required_docs?: string[]
  accepted_terms?: boolean
}

export type EventDetail = {
  id: string
  title: string
  slug: string
  description: string | null
  category: string | null
  instagram: string | null
  status: 'draft' | 'published' | 'cancelled' | 'finished'
  image_url: string | null
  logo_url: string | null
  start_date: string | null
  end_date: string | null
  location: LocationDetail | null
  requirements: RequirementDetail | null
  ticket_categories: TicketCategory[] | null
  form_fields: string | null
  views: number
  created_at: string
  batches: TicketBatch[]
}

export const eventService = {
  list: (token: string, slug: string, status?: string) =>
    api.get<EventSummary[]>(
      `/org/${slug}/events${status ? `?status=${status}` : ''}`,
      token
    ),

  get: (token: string, slug: string, eventID: string) =>
    api.get<EventDetail>(`/org/${slug}/events/${eventID}`, token),
}
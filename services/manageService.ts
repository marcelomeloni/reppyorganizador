import { api } from './apiService'

export type EventManageData = {
  event: {
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
    location: string | null
    requirements: string | null
    views: number
    created_at: string
    org_email: string | null
    ticket_categories: { id: string; name: string }[]
  }
  stats: {
    tickets_sold: number
    total_capacity: number
    gross_revenue: number
    net_revenue: number
    platform_fee: number
    discount_total: number
    orders_approved: number
    orders_cancelled: number
  }
  checkin: {
    total_tickets: number
    total_checked_in: number
    pending_checkin: number
    checkin_pct: number
  }
  has_bank_account: boolean
}

export type CheckinTicket = {
  id: string
  qr_code: string
  status: 'valid' | 'used' | 'cancelled'
  checked_in_at: string | null
  batch_name: string
  batch_type: string
  order_id: string
  user: {
    id: string
    full_name: string | null
    email: string | null
    cpf: string | null
    avatar_url: string | null
  }
}

export type CheckinData = {
  summary: {
    total_tickets: number
    total_checked_in: number
    pending_checkin: number
    checkin_pct: number
  }
  tickets: CheckinTicket[]
}

export type FinanceBatch = {
  id: string
  name: string
  price: number
  quantity_total: number
  quantity_sold: number
  net_revenue: number
}

export type FinanceOrder = {
  id: string
  status: string
  payment_method: string
  total_amount: number
  net_amount: number
  platform_fee_amount: number
  discount_amount: number
  created_at: string
  notes: string | null
  buyer_name: string | null
  buyer_email: string | null
  buyer_cpf: string | null
  batch_name: string | null
  batch_type: string | null
  batch_price: number | null
}

export type FinancePainelData = {
  kpis: {
    gross_revenue: number
    net_revenue: number
    platform_fee: number
    refund_total: number
    orders_approved: number
    orders_cancelled: number
    avg_ticket: number
  }
  batches: FinanceBatch[]
  orders: FinanceOrder[]
}

export type FinanceResumoData = {
  totals: {
    gross_revenue: number
    net_revenue: number
    platform_fee: number
    discount_total: number
    refund_total: number
  }
  batches: FinanceBatch[]
}

export type Coupon = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  active: boolean
  created_at: string
}

export type CreateCouponBody = {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses?: number | null
  expires_at?: string | null
  batch_ids?: string[]
}

export type Refund = {
  id: string
  order_id: string
  order_total: number
  amount: number
  reason: string | null
  status: 'pending' | 'completed' | 'rejected'
  created_at: string
  buyer_name: string | null
  batch_name: string | null
}

export type Participant = {
  ticket_id: string
  qr_code: string
  ticket_status: 'valid' | 'used' | 'cancelled'
  checked_in_at: string | null
  batch_id: string
  batch_name: string
  batch_type: string
  order_id: string
  purchase_date: string
  user: {
    id: string
    full_name: string | null
    email: string | null
    cpf: string | null
    avatar_url: string | null
  }
}

const base = (slug: string, id: string) => `/org/${slug}/events/${id}`

export const manageService = {
  getManage: (token: string, slug: string, id: string) =>
    api.get<EventManageData>(`${base(slug, id)}/manage`, token),

  getCheckinData: (token: string, slug: string, id: string) =>
    api.get<CheckinData>(`${base(slug, id)}/checkin-data`, token),

  patchCheckin: (token: string, slug: string, id: string, ticketID: string, checkedIn: boolean) =>
    api.patch<{ ok: boolean }>(`${base(slug, id)}/checkin-data/${ticketID}`, token, { checked_in: checkedIn }),

  getFinancePainel: (token: string, slug: string, id: string) =>
    api.get<FinancePainelData>(`${base(slug, id)}/finance/painel`, token),

  getFinanceResumo: (token: string, slug: string, id: string) =>
    api.get<FinanceResumoData>(`${base(slug, id)}/finance/resumo`, token),

  getCoupons: (token: string, slug: string, id: string) =>
    api.get<Coupon[]>(`${base(slug, id)}/coupons`, token),

  createCoupon: (token: string, slug: string, id: string, body: CreateCouponBody) =>
    api.post<{ id: string; batch_ids: string[] }>(`${base(slug, id)}/coupons`, token, body),

  patchCoupon: (token: string, slug: string, id: string, couponID: string, active: boolean) =>
    api.patch<{ ok: boolean }>(`${base(slug, id)}/coupons/${couponID}`, token, { active }),

  deleteCoupon: (token: string, slug: string, id: string, couponID: string) =>
    api.delete<{ ok: boolean }>(`${base(slug, id)}/coupons/${couponID}`, token),

  getCancellations: (token: string, slug: string, id: string) =>
    api.get<Refund[]>(`${base(slug, id)}/cancellations`, token),

  patchRefund: (token: string, slug: string, id: string, refundID: string, status: 'approved' | 'rejected') =>
    api.patch<{ ok: boolean }>(`${base(slug, id)}/cancellations/${refundID}`, token, { status }),

  getParticipants: (token: string, slug: string, id: string) =>
    api.get<Participant[]>(`${base(slug, id)}/participants`, token),
}
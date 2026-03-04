import { api } from '@/services/apiService'
import type { BasicFormData } from '@/components/eventos/steps/StepBasic'
import type { LocationFormData } from '@/components/eventos/steps/StepLocation'
import type { DatesFormData } from '@/components/eventos/steps/StepDates'
import type { RequirementsFormData } from '@/components/eventos/steps/StepRequirements'
import type { TicketCategory, TicketLot } from '@/types/tickets'

// ─── Tipos de resposta ────────────────────────────────────────────────────────

export interface SaveDraftResponse {
  event_id: string
  slug:     string
  status:   'draft'
  message:  string
}

// ─── Helpers de conversão ─────────────────────────────────────────────────────

// "2026-06-14T23:00" (datetime-local) → ISO 8601
function toISO(datetimeLocal: string): string {
  if (!datetimeLocal) return ''
  return new Date(datetimeLocal).toISOString()
}

// "25,00" → 25.0
function parseBRL(value: string): number {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0
}

function mapLot(lot: TicketLot) {
  return {
    name:           lot.name,
    price:          parseBRL(lot.price),
    quantity:       parseInt(lot.quantity) || 0,
    sales_trigger:  lot.salesTrigger,
    trigger_lot_id: lot.triggerLotId ?? '',
    fee_payer:      lot.feePayer,
    min_purchase:   lot.minPurchase,
    max_purchase:   lot.maxPurchase,
    sales_start:    toISO(lot.salesStart),
    sales_end:      toISO(lot.salesEnd),
  }
}

function mapCategories(categories: TicketCategory[]) {
  return categories.map((cat) => ({
    name:            cat.name,
    type:            cat.type,
    description:     cat.description,
    availability:    cat.availability,
    is_transferable: cat.isTransferable,
    in_reppy_market: cat.inReppyMarket,
    lots:            cat.lots.map(mapLot),
  }))
}

function buildPayload(
  basic:        Partial<BasicFormData>,
  location:     Partial<LocationFormData>,
  dates:        Partial<DatesFormData>,
  categories:   TicketCategory[],
  requirements: Partial<RequirementsFormData>,
) {
  return {
    title:       basic.name        ?? '',
    description: basic.description ?? '',
    instagram:   basic.instagram   ?? '',
    category:    basic.category    ?? '',
    location: {
      venue_name:   location.venueName    ?? '',
      cep:          location.cep          ?? '',
      street:       location.street       ?? '',
      number:       location.number       ?? '',
      complement:   location.complement   ?? '',
      neighborhood: location.neighborhood ?? '',
      city:         location.city         ?? '',
      state:        location.state        ?? '',
    },
    start_date: dates.startDate && dates.startTime
      ? toISO(`${dates.startDate}T${dates.startTime}`)
      : '',
    end_date: dates.endDate && dates.endTime
      ? toISO(`${dates.endDate}T${dates.endTime}`)
      : '',
    ticket_categories: mapCategories(categories),
    requirements: {
      min_age:        requirements.minAge        ?? '',
      required_docs:  requirements.requiredDocs  ?? [],
      accepted_terms: requirements.acceptedTerms ?? false,
    },
  }
}

// ─── Funções exportadas ───────────────────────────────────────────────────────

export const saveEventService = {
  /**
   * Salva o evento como rascunho. Apenas basic.name é obrigatório.
   * Retorna event_id e slug para uso nas etapas seguintes.
   */
  saveDraft: (
    token:        string,
    orgSlug:      string,
    basic:        Partial<BasicFormData>,
    location:     Partial<LocationFormData>,
    dates:        Partial<DatesFormData>,
    categories:   TicketCategory[],
    requirements: Partial<RequirementsFormData>,
  ): Promise<SaveDraftResponse> =>
    api.post<SaveDraftResponse>(
      `/org/${orgSlug}/events`,
      token,
      buildPayload(basic, location, dates, categories, requirements),
    ),

  /**
   * Atualiza um rascunho ou evento publicado.
   * Apenas os campos enviados são alterados (COALESCE no backend).
   * Se categories vier preenchido, os lotes existentes são substituídos.
   */
  updateEvent: (
    token:        string,
    orgSlug:      string,
    eventID:      string,
    basic:        Partial<BasicFormData>,
    location:     Partial<LocationFormData>,
    dates:        Partial<DatesFormData>,
    categories:   TicketCategory[],
    requirements: Partial<RequirementsFormData>,
  ): Promise<{ message: string }> =>
    api.patch<{ message: string }>(
      `/org/${orgSlug}/events/${eventID}`,
      token,
      buildPayload(basic, location, dates, categories, requirements),
    ),

  /**
   * Publica o evento. O backend valida todos os campos obrigatórios e lança
   * ApiError(422) com fields[] caso a validação falhe.
   */
  publishEvent: (
    token:   string,
    orgSlug: string,
    eventID: string,
  ): Promise<{ message: string }> =>
    api.patch<{ message: string }>(
      `/org/${orgSlug}/events/${eventID}/publish`,
      token,
      {},
    ),

  /**
   * Cancela o evento.
   * Eventos com ingressos vendidos exigem role owner — o backend retorna 403 caso contrário.
   */
  cancelEvent: (
    token:   string,
    orgSlug: string,
    eventID: string,
  ): Promise<{ message: string; tickets_sold: number }> =>
    api.patch<{ message: string; tickets_sold: number }>(
      `/org/${orgSlug}/events/${eventID}/cancel`,
      token,
      {},
    ),

  /**
   * Faz upload do banner do evento.
   * Usa fetch diretamente pois o apiService não suporta multipart.
   */
  uploadBanner: async (
    token:   string,
    orgSlug: string,
    eventID: string,
    file:    File,
  ): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/org/${orgSlug}/events/${eventID}/banner`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      },
    )

    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error ?? 'Erro ao enviar banner')
    return json
  },
}
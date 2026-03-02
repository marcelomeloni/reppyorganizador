// types/tickets.ts

export interface TicketLot {
  id: string
  name: string          // "1º Lote", "2º Lote"…
  price: string         // "25,00"
  quantity: string
  salesStart: string    // datetime-local
  salesEnd: string
  salesTrigger: 'date' | 'batch'
  triggerLotId: string  // id do lote anterior (quando salesTrigger === 'batch')
  feePayer: 'customer' | 'organizer'
  minPurchase: number
  maxPurchase: number
}

export interface TicketCategory {
  id: string
  name: string                         // "Pista", "Estudante", "VIP"…
  type: 'free' | 'paid'
  description: string
  availability: 'public' | 'hidden' | 'guestlist'
  isTransferable: boolean              // Ingresso transferível?
  inReppyMarket: boolean               // Participa do Reppy Market?
  lots: TicketLot[]
}

export interface TicketsFormData {
  categories: TicketCategory[]
}
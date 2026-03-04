'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkle, Image as ImageIcon, MapPin, CalendarBlank, Ticket, ShieldCheck, CircleNotch } from '@phosphor-icons/react'
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgHeader } from '@/components/org/OrgHeader'
import { CreateEventStepper } from '@/components/eventos/CreateEventStepper'
import { StepNavigation } from '@/components/eventos/StepNavigation'
import { StepBasic, type BasicFormData } from '@/components/eventos/steps/StepBasic'
import { StepMedia, type MediaFormData } from '@/components/eventos/steps/StepMedia'
import { StepLocation, type LocationFormData } from '@/components/eventos/steps/StepLocation'
import { StepDates, type DatesFormData } from '@/components/eventos/steps/StepDates'
import { StepTickets, type TicketsFormData } from '@/components/eventos/steps/StepTickets'
import { StepRequirements, type RequirementsFormData } from '@/components/eventos/steps/StepRequirements'
import { saveEventService } from '@/services/saveEventService'
import { eventService } from '@/services/eventService'
import { ApiError } from '@/services/apiService'
import { useAuth } from '@/context/AuthContext'

const STEPS = [
  { id: 'basic', label: 'Básico', description: 'Nome e categoria', icon: <Sparkle size={16} weight="bold" /> },
  { id: 'media', label: 'Mídia', description: 'Banner e visual', icon: <ImageIcon size={16} weight="bold" /> },
  { id: 'location', label: 'Local', description: 'Endereço completo', icon: <MapPin size={16} weight="bold" /> },
  { id: 'dates', label: 'Datas', description: 'Início e fim', icon: <CalendarBlank size={16} weight="bold" /> },
  { id: 'tickets', label: 'Ingressos', description: 'Lotes e preços', icon: <Ticket size={16} weight="bold" /> },
  { id: 'requirements', label: 'Requisitos', description: 'Docs e termos', icon: <ShieldCheck size={16} weight="bold" /> },
]

export default function EditarEventoPage() {
  const { 'org-slug': orgSlug, id: eventIDParam } = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const token = session?.access_token ?? ''

  const eventID = eventIDParam as string

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [step, setStep] = useState(0)
  
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [publishErrors, setPublishErrors] = useState<string[]>([])
  
  // Novo estado para controlar se é rascunho ou publicado
  const [eventStatus, setEventStatus] = useState<string>('draft')

  const [basic, setBasic] = useState<BasicFormData>({ name: '', description: '', instagram: '', category: '' })
  const [media, setMedia] = useState<MediaFormData>({ bannerFile: null, bannerPreview: null })
  const [location, setLocation] = useState<LocationFormData>({ venueName: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' })
  const [dates, setDates] = useState<DatesFormData>({ startDate: '', startTime: '', endDate: '', endTime: '' })
  const [tickets, setTickets] = useState<TicketsFormData>({ categories: [] })
  const [requirements, setRequirements] = useState<RequirementsFormData>({ minAge: '18+', requiredDocs: ['rg'], acceptedTerms: false })

  useEffect(() => {
    if (!token || !eventID) return

    async function fetchEvent() {
      try {
        const data = await eventService.get(token, orgSlug as string, eventID)
        
        // Define o status vindo da API
        setEventStatus(data.status || 'draft')

        setBasic({
          name: data.title || '',
          description: data.description || '',
          instagram: data.instagram || '',
          category: data.category || ''
        })

        if (data.image_url) {
          setMedia({ bannerFile: null, bannerPreview: data.image_url })
        }

        if (data.location) {
          let parsedLoc = data.location as any
          if (typeof data.location === 'string') {
            try {
              parsedLoc = JSON.parse(data.location)
            } catch (e) {
              console.error("Erro ao fazer parse de location:", e)
            }
          }

          setLocation({
            venueName: parsedLoc.venue_name || parsedLoc.venueName || '',
            cep: parsedLoc.cep || '',
            street: parsedLoc.street || '',
            number: parsedLoc.number || '',
            complement: parsedLoc.complement || '',
            neighborhood: parsedLoc.neighborhood || '',
            city: parsedLoc.city || '',
            state: parsedLoc.state || ''
          })
        }

        const splitDate = (isoString: string | null) => {
          if (!isoString) return { date: '', time: '' }
          const d = new Date(isoString)
          const date = d.toISOString().split('T')[0]
          const time = d.toTimeString().split(' ')[0].substring(0, 5)
          return { date, time }
        }

        const start = splitDate(data.start_date)
        const end = splitDate(data.end_date)
        
        setDates({
          startDate: start.date,
          startTime: start.time,
          endDate: end.date,
          endTime: end.time
        })

        if (data.ticket_categories) {
          const mappedCategories = data.ticket_categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name || '',
            type: cat.type || 'paid',
            description: cat.description || '',
            availability: cat.availability || 'public',
            isTransferable: cat.is_transferable ?? true,
            inReppyMarket: cat.in_reppy_market ?? true,
            lots: (cat.lots || []).map((lot: any) => ({
              id: lot.id,
              name: lot.name || '',
              price: (lot.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
              quantity: (lot.quantity_total || 0).toString(),
              salesTrigger: lot.sales_trigger || 'date',
              triggerLotId: lot.trigger_lot_id || '',
              feePayer: lot.fee_payer || 'buyer',
              minPurchase: lot.min_purchase || 1,
              maxPurchase: lot.max_purchase || 5,
              salesStart: lot.start_date ? lot.start_date.substring(0, 16) : '',
              salesEnd: lot.end_date ? lot.end_date.substring(0, 16) : ''
            }))
          }))

          setTickets({ categories: mappedCategories })
        }

        if (data.requirements) {
          let parsedReq = data.requirements as any
          if (typeof data.requirements === 'string') {
            try {
              parsedReq = JSON.parse(data.requirements)
            } catch (e) {
              console.error("Erro ao fazer parse de requirements:", e)
            }
          }

          setRequirements({
            minAge: parsedReq.min_age || parsedReq.minAge || '18+',
            requiredDocs: parsedReq.required_docs || parsedReq.requiredDocs || ['rg'],
            acceptedTerms: parsedReq.accepted_terms || parsedReq.acceptedTerms || false
          })
        }

      } catch (err) {
        console.error("Erro ao carregar evento", err)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchEvent()
  }, [token, eventID, orgSlug])

  const canProceed = [
    basic.name.length > 2 && basic.category !== '',
    media.bannerPreview !== null,
    location.venueName !== '' && location.city !== '',
    dates.startDate !== '' && dates.endDate !== '',
    true,
    requirements.acceptedTerms,
  ][step]

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await saveEventService.updateEvent(token, orgSlug as string, eventID, basic, location, dates, tickets.categories, requirements)
      
      if (media.bannerFile) {
        await saveEventService.uploadBanner(token, orgSlug as string, eventID, media.bannerFile)
      }
    } catch (err) {
      console.error('Erro ao atualizar rascunho:', err)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setPublishErrors([])
    try {
      await saveEventService.updateEvent(token, orgSlug as string, eventID, basic, location, dates, tickets.categories, requirements)

      if (media.bannerFile) {
        await saveEventService.uploadBanner(token, orgSlug as string, eventID, media.bannerFile)
      }

      // Só publica se for rascunho. Se já estiver publicado, a atualização dos dados (patch) já basta.
      if (eventStatus === 'draft') {
        await saveEventService.publishEvent(token, orgSlug as string, eventID)
      }
      
      router.push(`/${orgSlug}/eventos`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = JSON.parse(err.message) as { fields?: string[] }
        setPublishErrors(body.fields ?? [err.message])
      } else {
        console.error('Erro ao publicar evento:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex min-h-screen bg-[#F7F7F2] items-center justify-center">
        <div className="flex flex-col items-center text-[#9A9A8F]">
          <CircleNotch size={32} weight="bold" className="animate-spin mb-4" />
          <p className="text-sm font-bold animate-pulse">Carregando dados do evento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F2]">
      <OrgSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <OrgHeader onMenuOpen={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto">
          <div className="mb-5 md:mb-8">
            <p className="text-[11px] font-bold text-[#9A9A8F] uppercase tracking-wider mb-1">
              Editando Evento
            </p>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl md:text-[28px] tracking-tight text-[#0A0A0A] leading-tight">
              Atualize as informações
            </h1>
          </div>

          <div className="flex flex-col md:flex-row md:gap-8 md:items-start">
            <CreateEventStepper steps={STEPS} currentStep={step} onStepClick={setStep} />
            <div className="flex-1 min-w-0 bg-white border border-[#E0E0D8] rounded-[20px] md:rounded-[24px] p-5 md:p-7 shadow-sm">
              
              {step === 0 && <StepBasic data={basic} onChange={setBasic} />}
              {step === 1 && <StepMedia data={media} onChange={setMedia} eventName={basic.name} />}
              {step === 2 && <StepLocation data={location} onChange={setLocation} />}
              {step === 3 && <StepDates data={dates} onChange={setDates} />}
              {step === 4 && <StepTickets data={tickets} onChange={setTickets} />}
              {step === 5 && <StepRequirements data={requirements} onChange={setRequirements} />}

              {publishErrors.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-xs font-bold text-red-600 mb-2">Corrija os campos abaixo antes de publicar:</p>
                  <ul className="space-y-1">
                    {publishErrors.map((e) => (
                      <li key={e} className="text-xs text-red-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />{e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <StepNavigation
                currentStep={step}
                totalSteps={STEPS.length}
                onPrev={() => setStep((s) => s - 1)}
                onNext={() => setStep((s) => s + 1)}
                onSubmit={handleSubmit}
                onSaveDraft={handleSaveDraft}
                isLoading={isLoading}
                isSavingDraft={isSavingDraft}
                canProceed={canProceed}
                eventStatus={eventStatus} // Passando o status pro botão
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Sparkle, Image, MapPin, CalendarBlank, Ticket, ShieldCheck,
} from '@phosphor-icons/react'
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
import { ApiError } from '@/services/apiService'

import { useAuth } from '@/context/AuthContext'

const STEPS = [
  { id: 'basic',        label: 'Básico',     description: 'Nome e categoria',  icon: <Sparkle size={16} weight="bold" />       },
  { id: 'media',        label: 'Mídia',      description: 'Banner e visual',   icon: <Image size={16} weight="bold" />         },
  { id: 'location',     label: 'Local',      description: 'Endereço completo', icon: <MapPin size={16} weight="bold" />        },
  { id: 'dates',        label: 'Datas',      description: 'Início e fim',      icon: <CalendarBlank size={16} weight="bold" /> },
  { id: 'tickets',      label: 'Ingressos',  description: 'Lotes e preços',    icon: <Ticket size={16} weight="bold" />        },
  { id: 'requirements', label: 'Requisitos', description: 'Docs e termos',     icon: <ShieldCheck size={16} weight="bold" />   },
]

const STEP_TITLES = [
  'Qual é o nome do evento?',
  'Como vai aparecer pra galera?',
  'Onde vai rolar?',
  'Quando vai acontecer?',
  'Quanto vai custar?',
  'Quais os requisitos?',
]

const STEP_SUBS = [
  'Comece pelo básico: nome, descrição e categoria.',
  'Um bom banner faz toda a diferença na conversão.',
  'Endereço completo para o pessoal chegar.',
  'Data de início e encerramento do evento.',
  'Configure os lotes e preços dos ingressos.',
  'Documentos, faixa etária e termos de uso.',
]

export default function NovoEventoPage() {
  const { 'org-slug': orgSlug } = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const token = session?.access_token ?? ''

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  // eventID é preenchido após o primeiro saveDraft — reutilizado nas chamadas seguintes
  const [eventID, setEventID] = useState<string | null>(null)
  const [publishErrors, setPublishErrors] = useState<string[]>([])

  const [basic, setBasic] = useState<BasicFormData>({
    name: '', description: '', instagram: '', category: '',
  })
  const [media, setMedia] = useState<MediaFormData>({
    bannerFile: null, bannerPreview: null,
  })
  const [location, setLocation] = useState<LocationFormData>({
    venueName: '', cep: '', street: '', number: '',
    complement: '', neighborhood: '', city: '', state: '',
  })
  const [dates, setDates] = useState<DatesFormData>({
    startDate: '', startTime: '', endDate: '', endTime: '',
  })
  const [tickets, setTickets] = useState<TicketsFormData>({ categories: [] })
  const [requirements, setRequirements] = useState<RequirementsFormData>({
    minAge: '18+', requiredDocs: ['rg'], acceptedTerms: false,
  })

  const canProceed = [
    basic.name.length > 2 && basic.category !== '',
    media.bannerPreview !== null,
    location.venueName !== '' && location.city !== '',
    dates.startDate !== '' && dates.endDate !== '',
    true,
    requirements.acceptedTerms,
  ][step]

  // Persiste o estado atual como rascunho.
  // Na primeira chamada cria o evento e guarda o eventID.
  // Nas chamadas seguintes atualiza o mesmo evento.
  async function persistDraft() {
    const slug = orgSlug as string

    if (!eventID) {
      const res = await saveEventService.saveDraft(
        token, slug, basic, location, dates, tickets.categories, requirements,
      )
      setEventID(res.event_id)
      return res.event_id
    }

    await saveEventService.updateEvent(
      token, slug, eventID, basic, location, dates, tickets.categories, requirements,
    )
    return eventID
  }

  // Salva rascunho e, se houver banner selecionado, faz o upload dele também.
  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      const id = await persistDraft()

      if (media.bannerFile) {
        await saveEventService.uploadBanner(token, orgSlug as string, id, media.bannerFile)
      }
    } catch (err) {
      console.error('Erro ao salvar rascunho:', err)
    } finally {
      setIsSavingDraft(false)
    }
  }

const handleSubmit = async () => {
  setIsLoading(true)
  setPublishErrors([])
  try {
    const id = await persistDraft()
    if (!id) throw new Error('Falha ao obter ID do evento')  // guarda

    if (media.bannerFile) {
      await saveEventService.uploadBanner(token, orgSlug as string, id, media.bannerFile)
    }

    await saveEventService.publishEvent(token, orgSlug as string, id)
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

  return (
    <div className="flex min-h-screen bg-[#F7F7F2]">
      <OrgSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <OrgHeader onMenuOpen={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto">

          <div className="mb-5 md:mb-8">
            <p className="text-[11px] font-bold text-[#9A9A8F] uppercase tracking-wider mb-1">
              Novo Evento
            </p>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl md:text-[28px] tracking-tight text-[#0A0A0A] leading-tight">
              {STEP_TITLES[step]}
            </h1>
            <p className="text-[#9A9A8F] text-xs sm:text-sm mt-1.5">
              {STEP_SUBS[step]}
            </p>
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

              {/* Erros de validação do publish */}
              {publishErrors.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-xs font-bold text-red-600 mb-2">
                    Corrija os campos abaixo antes de publicar:
                  </p>
                  <ul className="space-y-1">
                    {publishErrors.map((e) => (
                      <li key={e} className="text-xs text-red-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                        {e}
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
              />
            </div>
          </div>

          <div className="h-6 md:hidden" />
        </main>
      </div>
    </div>
  )
}
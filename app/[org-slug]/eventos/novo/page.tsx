'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Sparkle,
  Image,
  MapPin,
  CalendarBlank,
  Ticket,
  ShieldCheck,
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

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  // NOVO: Estado para controlar o loading do rascunho
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  // Estados dos steps
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
  const [tickets, setTickets] = useState<TicketsFormData>({ lots: [] })
  const [requirements, setRequirements] = useState<RequirementsFormData>({
    minAge: '18+', requiredDocs: ['rg'], acceptedTerms: false,
  })

  // Validação por step
  const canProceed = [
    basic.name.length > 2 && basic.category !== '',
    media.bannerPreview !== null,
    location.venueName !== '' && location.city !== '',
    dates.startDate !== '' && dates.endDate !== '',
    true,
    requirements.acceptedTerms,
  ][step]

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    router.push(`/${orgSlug}/eventos`)
  }

  // NOVO: Função para salvar o rascunho
  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    // Simula o tempo de salvamento na API
    await new Promise((r) => setTimeout(r, 1000))
    setIsSavingDraft(false)
    
    // Opcional: Adicionar um toast de sucesso aqui
    alert('Rascunho salvo com sucesso!')
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F2]">
      {/* Sidebar com drawer mobile */}
      <OrgSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        {/* Header com hamburguer */}
        <OrgHeader onMenuOpen={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto">

          {/* ── Page header ── */}
          <div className="mb-5 md:mb-8">
            <p className="text-[11px] font-bold text-[#9A9A8F] uppercase tracking-wider mb-1">
              Novo Evento
            </p>
            {/* Título muda por step — mais compacto no mobile */}
            <h1 className="font-display font-extrabold text-xl sm:text-2xl md:text-[28px] tracking-tight text-[#0A0A0A] leading-tight">
              {STEP_TITLES[step]}
            </h1>
            <p className="text-[#9A9A8F] text-xs sm:text-sm mt-1.5">
              {STEP_SUBS[step]}
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:gap-8 md:items-start">

            {/* Stepper — renderiza horizontal no mobile, vertical no desktop */}
            <CreateEventStepper
              steps={STEPS}
              currentStep={step}
              onStepClick={setStep}
            />

      
            <div className="flex-1 min-w-0 bg-white border border-[#E0E0D8] rounded-[20px] md:rounded-[24px] p-5 md:p-7 shadow-sm">

    
              <div>
                {step === 0 && <StepBasic data={basic} onChange={setBasic} />}
                {step === 1 && <StepMedia data={media} onChange={setMedia} eventName={basic.name} />}
                {step === 2 && <StepLocation data={location} onChange={setLocation} />}
                {step === 3 && <StepDates data={dates} onChange={setDates} />}
                {step === 4 && <StepTickets data={tickets} onChange={setTickets} />}
                {step === 5 && <StepRequirements data={requirements} onChange={setRequirements} />}
              </div>


              <StepNavigation
                currentStep={step}
                totalSteps={STEPS.length}
                onPrev={() => setStep((s) => s - 1)}
                onNext={() => setStep((s) => s + 1)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                canProceed={canProceed}
                onSaveDraft={handleSaveDraft}   
                isSavingDraft={isSavingDraft}                 />
            </div>
          </div>

        
          <div className="h-6 md:hidden" />
        </main>
      </div>
    </div>
  )
}
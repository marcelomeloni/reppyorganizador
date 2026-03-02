'use client'
import { useState, useEffect } from 'react'
import { Buildings, UserFocus, ArrowRight } from '@phosphor-icons/react'
import { CreateOrgForm } from '@/components/onboarding/createorg/CreateOrgForm'
import { CompleteRegisterForm } from '@/components/onboarding/completeregister/CompleteRegisterForm'

type Step = 'choose' | 'create' | 'check-access'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('choose')
  const [isLoading, setIsLoading] = useState(false)
  
  // Esses estados virão da sua API no futuro
  // Se o perfil está completo, ele já pula o form
  const [hasCpfRegistered, setHasCpfRegistered] = useState(false) // Ex: Simulando que já tem CPF
  const [userCpf, setUserCpf] = useState("123.456.789-00")

  const handleCreateOrg = (name: string) => {
    setIsLoading(true)
    // Chamada de API aqui
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <title>Onboarding | Plataforma de Eventos</title>
      <meta name="description" content="Configure sua organização ou acesse seus eventos." />

      {/* Grid de fundo decorativo */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "180px" }} />

      <div className="w-full max-w-2xl relative z-10">
        
        {step === 'choose' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="text-center mb-10">
              <h1 className="font-bricolage font-extrabold text-4xl text-black mb-3 tracking-tight">Como quer começar?</h1>
              <p className="font-body text-gray-500">Selecione uma opção para configurar seu acesso.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => setStep('create')} className="group bg-white p-8 rounded-[28px] border-2 border-transparent hover:border-primary shadow-sm hover:shadow-xl transition-all text-left flex flex-col gap-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Buildings size={32} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bricolage font-bold text-2xl text-black">Criar Organização</h3>
                  <p className="font-body text-sm text-gray-500 mt-2">Para donos de repúblicas ou produtoras.</p>
                </div>
                <ArrowRight size={20} weight="bold" className="text-primary mt-auto group-hover:translate-x-2 transition-transform" />
              </button>

              <button onClick={() => setStep('check-access')} className="group bg-white p-8 rounded-[28px] border-2 border-transparent hover:border-black shadow-sm hover:shadow-xl transition-all text-left flex flex-col gap-6">
                <div className="w-14 h-14 rounded-full bg-gray-100 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserFocus size={32} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bricolage font-bold text-2xl text-black">Acessar Evento</h3>
                  <p className="font-body text-sm text-gray-500 mt-2">Para quem foi adicionado como staff ou admin.</p>
                </div>
                <ArrowRight size={20} weight="bold" className="text-black mt-auto group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 'create' && (
          <CreateOrgForm 
            onBack={() => setStep('choose')} 
            onSubmit={handleCreateOrg}
            isLoading={isLoading}
          />
        )}

        {step === 'check-access' && (
          <CompleteRegisterForm 
            onBack={() => setStep('choose')}
            hasCpfRegistered={hasCpfRegistered}
            setHasCpfRegistered={setHasCpfRegistered}
            userCpf={userCpf}
          />
        )}
      </div>
    </div>
  )
}
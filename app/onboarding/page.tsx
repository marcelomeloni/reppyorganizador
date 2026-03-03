'use client'
import { useState } from 'react'
import { Buildings, UserFocus, ArrowRight, CircleNotch } from '@phosphor-icons/react'
import { CreateOrgForm } from '@/components/onboarding/createorg/CreateOrgForm'
import { CompleteRegisterForm } from '@/components/onboarding/completeregister/CompleteRegisterForm'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { onboardingService } from '@/services/onboardingService'
import { profileService, type ProfileResponse } from '@/services/profileService'
import { ApiError } from '@/services/apiService'

type Step = 'choose' | 'create' | 'check-access'

export default function OnboardingPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('choose')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)

  const fetchProfile = async () => {
    if (!session?.access_token) return null
    try {
      const p = await profileService.get(session.access_token)
      setProfile(p)
      return p
    } catch {
      return null
    }
  }

  const handleGoToCreate = async () => {
    setIsLoading(true)
    await fetchProfile()
    setIsLoading(false)
    setStep('create')
  }

  const handleGoToCheckAccess = async () => {
    setIsLoading(true)
    await fetchProfile()
    setIsLoading(false)
    setStep('check-access')
  }

  const handleCreateOrg = async (data: {
    name: string; email: string; phone: string
    description: string; instagram: string
    fullName: string; cpf: string
  }) => {
    if (!session?.access_token) return
    setIsLoading(true)
    setError(null)
    try {
      const slug = data.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      await onboardingService.createOrg(session.access_token, {
        full_name:       data.fullName,
        cpf:             data.cpf,
        org_name:        data.name,
        org_slug:        slug,
        org_description: data.description,
        org_email:       data.email,
        org_phone:       data.phone,
        org_instagram:   data.instagram,
      })
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteProfile = async (cpf: string) => {
    if (!session?.access_token) return false
    setIsLoading(true)
    setError(null)
    try {
      await onboardingService.updateProfile(session.access_token, { cpf })
      return true
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro de conexão')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-2xl relative z-10">

        {error && (
          <div className="mb-4 px-5 py-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-body">
            {error}
          </div>
        )}

        {step === 'choose' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="text-center mb-10">
              <h1 className="font-bricolage font-extrabold text-4xl text-black mb-3 tracking-tight">
                Como quer começar?
              </h1>
              <p className="font-body text-gray-500">
                Olá{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}! Selecione uma opção.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleGoToCreate}
                disabled={isLoading}
                className="group bg-white p-8 rounded-[28px] border-2 border-transparent hover:border-primary shadow-sm hover:shadow-xl transition-all text-left flex flex-col gap-6 disabled:opacity-60"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isLoading ? <CircleNotch size={28} className="animate-spin" /> : <Buildings size={32} weight="fill" />}
                </div>
                <div>
                  <h3 className="font-bricolage font-bold text-2xl text-black">Criar Organização</h3>
                  <p className="font-body text-sm text-gray-500 mt-2">Para donos de repúblicas ou produtoras.</p>
                </div>
                <ArrowRight size={20} weight="bold" className="text-primary mt-auto group-hover:translate-x-2 transition-transform" />
              </button>

              <button
                onClick={handleGoToCheckAccess}
                disabled={isLoading}
                className="group bg-white p-8 rounded-[28px] border-2 border-transparent hover:border-black shadow-sm hover:shadow-xl transition-all text-left flex flex-col gap-6 disabled:opacity-60"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isLoading ? <CircleNotch size={28} className="animate-spin" /> : <UserFocus size={32} weight="fill" />}
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
            defaultFullName={profile?.full_name ?? user?.user_metadata?.full_name ?? ''}
            defaultEmail={user?.email ?? ''}
            defaultCpf={profile?.cpf ?? ''}
          />
        )}

        {step === 'check-access' && (
          <CompleteRegisterForm
            onBack={() => setStep('choose')}
            onCompleteProfile={handleCompleteProfile}
            isLoading={isLoading}
            existingCpf={profile?.cpf ?? null}
          />
        )}
      </div>
    </div>
  )
}
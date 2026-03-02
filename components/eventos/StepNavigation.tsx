'use client'
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  isLoading?: boolean
  canProceed?: boolean
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  isLoading = false,
  canProceed = true,
}: StepNavigationProps) {
  const isLast = currentStep === totalSteps - 1
  const isFirst = currentStep === 0

  return (
    <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-[#E0E0D8]">
      {/* Voltar */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className="flex items-center gap-2 px-4 md:px-5 py-3 rounded-[100px] font-bold text-sm
          border-2 border-[#E0E0D8] text-[#9A9A8F] hover:border-[#0A0A0A] hover:text-[#0A0A0A]
          transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95
          flex-1 md:flex-none justify-center md:justify-start"
      >
        <ArrowLeft size={16} weight="bold" />
        <span className="hidden sm:inline">Voltar</span>
      </button>

      {/* Contador — só desktop */}
      <span className="hidden md:block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-wider">
        {currentStep + 1} / {totalSteps}
      </span>

      {/* Continuar / Publicar */}
      {isLast ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !canProceed}
          className="flex items-center gap-2 px-5 md:px-6 py-3 rounded-[100px] font-bold text-sm
            bg-[#1BFF11] text-[#0A0A0A] hover:bg-[#0FD40A]
            transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
            shadow-lg shadow-[#1BFF11]/20
            flex-1 md:flex-none justify-center"
        >
          {isLoading ? (
            <span className="animate-pulse">Publicando...</span>
          ) : (
            <><Check size={16} weight="bold" /> Publicar Evento</>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-5 md:px-6 py-3 rounded-[100px] font-bold text-sm
            bg-[#0A0A0A] text-white hover:bg-[#1BFF11] hover:text-[#0A0A0A]
            transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
            shadow-lg shadow-black/10
            flex-1 md:flex-none justify-center"
        >
          Continuar
          <ArrowRight size={16} weight="bold" />
        </button>
      )}
    </div>
  )
}
'use client'
import { Check } from '@phosphor-icons/react'

export interface StepConfig {
  id: string
  label: string
  description: string
  icon: React.ReactNode
}

interface CreateEventStepperProps {
  steps: StepConfig[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export function CreateEventStepper({ steps, currentStep, onStepClick }: CreateEventStepperProps) {
  const progress = Math.round((currentStep / (steps.length - 1)) * 100)

  return (
    <>
      {/* ── Mobile: barra horizontal com dots ───────────────────────────── */}
      <div className="md:hidden w-full mb-6">
        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          {steps.map((step, index) => {
            const isDone = index < currentStep
            const isActive = index === currentStep
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => index <= currentStep && onStepClick?.(index)}
                disabled={index > currentStep}
                className="transition-all"
                aria-label={step.label}
              >
                <div
                  className={`
                    rounded-full transition-all duration-300
                    ${isActive
                      ? 'w-6 h-2 bg-[#0A0A0A]'
                      : isDone
                        ? 'w-2 h-2 bg-[#0A0A0A] opacity-40'
                        : 'w-2 h-2 bg-[#E0E0D8]'}
                  `}
                />
              </button>
            )
          })}
        </div>

        {/* Label do step atual */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1BFF11] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#0A0A0A]">
                {String(currentStep + 1).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wider">
              {steps[currentStep]?.label}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#9A9A8F]">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="mt-2.5 h-1 bg-[#E0E0D8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1BFF11] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Desktop: sidebar vertical ────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 lg:w-64 shrink-0 flex-col gap-1 py-2">
        {steps.map((step, index) => {
          const isDone = index < currentStep
          const isActive = index === currentStep
          const isLocked = index > currentStep

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => !isLocked && onStepClick?.(index)}
              disabled={isLocked}
              className={`
                group flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all
                ${isActive
                  ? 'bg-[#0A0A0A] shadow-lg shadow-black/15'
                  : isDone
                    ? 'hover:bg-[#F0F0EB] cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'}
              `}
            >
              {/* Indicador numérico */}
              <div
                className={`
                  w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all
                  ${isActive ? 'bg-[#1BFF11]' : isDone ? 'bg-[#0A0A0A]' : 'bg-[#E0E0D8]'}
                `}
              >
                {isDone ? (
                  <Check size={13} weight="bold" className="text-white" />
                ) : (
                  <span className={`text-[10px] font-bold ${isActive ? 'text-[#0A0A0A]' : 'text-[#9A9A8F]'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Texto */}
              <div className="min-w-0">
                <p className={`text-sm font-bold leading-none truncate ${
                  isActive ? 'text-white' : isDone ? 'text-[#0A0A0A]' : 'text-[#9A9A8F]'
                }`}>
                  {step.label}
                </p>
                <p className="text-[11px] mt-0.5 leading-tight truncate text-[#9A9A8F]">
                  {step.description}
                </p>
              </div>
            </button>
          )
        })}

        {/* Barra de progresso */}
        <div className="mt-4 mx-3">
          <div className="h-1 bg-[#E0E0D8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1BFF11] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-[#9A9A8F] font-bold mt-2 text-right">
            {progress}% completo
          </p>
        </div>
      </aside>
    </>
  )
}
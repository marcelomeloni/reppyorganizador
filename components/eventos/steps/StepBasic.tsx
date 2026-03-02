'use client'
import {
  Confetti,
  MicrophoneStage,
  Martini,
  Guitar,
  Trophy,
  Tent,
  Palette,
  GameController,
  Star,
} from '@phosphor-icons/react'

const CATEGORIES = [
  { value: 'Festa',       label: 'Festa',         Icon: Confetti          },
  { value: 'Show',        label: 'Show',           Icon: MicrophoneStage },
  { value: 'Bar',         label: 'Bar',            Icon: Martini        },
  { value: 'Festival',    label: 'Festival',       Icon: Guitar         },
  { value: 'Atletica',    label: 'Atlética',       Icon: Trophy         },
  { value: 'Camping',     label: 'Camping',        Icon: Tent           },
  { value: 'Arte',        label: 'Arte & Cultura', Icon: Palette        },
  { value: 'Games',       label: 'Games',          Icon: GameController },
  { value: 'Outros',      label: 'Outros',         Icon: Star           },
]

export interface BasicFormData {
  name: string
  description: string
  instagram: string
  category: string
}

interface StepBasicProps {
  data: BasicFormData
  onChange: (data: BasicFormData) => void
}

const inputClass =
  'w-full px-5 py-3.5 bg-[#F7F7F2] border border-[#E0E0D8] rounded-xl focus:border-[#0A0A0A] focus:bg-white transition-all outline-none font-medium text-sm text-[#0A0A0A] placeholder:text-[#9A9A8F]'

export function StepBasic({ data, onChange }: StepBasicProps) {
  const set = (key: keyof BasicFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [key]: e.target.value })

  return (
    <div className="space-y-6">
      {/* Nome */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">
          Nome do Evento *
        </label>
        <input
          required
          type="text"
          value={data.name}
          onChange={set('name')}
          placeholder="Ex: Calourada FAUUSP 2026"
          className={`${inputClass} text-base font-bold`}
          maxLength={80}
        />
        <p className="text-[11px] text-[#9A9A8F] text-right mr-1">{data.name.length}/80</p>
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">
          Descrição
        </label>
        <textarea
          rows={4}
          value={data.description}
          onChange={set('description')}
          placeholder="Conta o que vai rolar, o clima, o line-up, o que torna esse evento único…"
          className={`${inputClass} resize-none leading-relaxed`}
          maxLength={500}
        />
        <p className="text-[11px] text-[#9A9A8F] text-right mr-1">{data.description.length}/500</p>
      </div>

      {/* Instagram */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">
          Instagram do Evento
        </label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9A9A8F] font-bold text-sm pointer-events-none">
            @
          </span>
          <input
            type="text"
            value={data.instagram}
            onChange={set('instagram')}
            placeholder="calourada.fauusp"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">
          Categoria *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CATEGORIES.map(({ value, label, Icon }) => {
            const active = data.category === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...data, category: value })}
                className={`
                  flex flex-col items-center gap-2 px-3 py-3.5 rounded-xl border-2 transition-all text-center
                  ${active
                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
                    : 'border-[#E0E0D8] bg-white text-[#5C5C52] hover:border-[#0A0A0A]/30 hover:bg-[#F0F0EB]'}
                `}
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center
                    ${active ? 'bg-[#1BFF11]' : 'bg-[#F0F0EB]'}`}
                >
                  <Icon
                    size={18}
                    weight="bold"
                    className={active ? 'text-[#0A0A0A]' : 'text-[#9A9A8F]'}
                  />
                </span>
                <span className="text-[11px] font-bold leading-tight">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
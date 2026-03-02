import { CalendarBlank, Clock, Info } from '@phosphor-icons/react'

export interface DatesFormData {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

const inp =
  'w-full px-4 py-3.5 bg-[#F7F7F2] border border-[#E0E0D8] rounded-xl focus:border-[#0A0A0A] focus:bg-white transition-all outline-none font-medium text-sm text-[#0A0A0A]'

function fmt(date: string, time: string) {
  if (!date) return ''
  return new Date(`${date}T${time || '00:00'}`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: time ? '2-digit' : undefined,
    minute: time ? '2-digit' : undefined,
  })
}

function dur(sd: string, st: string, ed: string, et: string) {
  if (!sd || !ed) return ''
  const ms =
    new Date(`${ed}T${et || '23:59'}`).getTime() -
    new Date(`${sd}T${st || '00:00'}`).getTime()
  if (ms <= 0) return ''
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(h / 24)
  return d >= 1 ? `${d} dia${d > 1 ? 's' : ''}${h % 24 ? ` e ${h % 24}h` : ''}` : `${h}h`
}

export function StepDates({ data, onChange }: { data: DatesFormData; onChange: (d: DatesFormData) => void }) {
  const set = (k: keyof DatesFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [k]: e.target.value })

  const today = new Date().toISOString().split('T')[0]
  const duration = dur(data.startDate, data.startTime, data.endDate, data.endTime)

  const blocks = [
    { label: 'Inicio do Evento', dark: true,  dk: 'startDate' as const, tk: 'startTime' as const, min: today },
    { label: 'Fim do Evento',    dark: false, dk: 'endDate'   as const, tk: 'endTime'   as const, min: data.startDate || today },
  ]

  return (
    <div className="space-y-4">
      {blocks.map(({ label, dark, dk, tk, min }) => (
        <div key={label} className="bg-white border border-[#E0E0D8] rounded-2xl overflow-hidden">
          <div className={`px-4 py-3 flex items-center gap-2 ${dark ? 'bg-[#0A0A0A]' : 'bg-[#F0F0EB]'}`}>
            <CalendarBlank size={14} weight="bold" className={dark ? 'text-[#1BFF11]' : 'text-[#9A9A8F]'} />
            <span className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-white' : 'text-[#5C5C52]'}`}>
              {label}
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">Data *</label>
              <div className="relative">
                <CalendarBlank size={16} weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
                <input required type="date" value={data[dk]} min={min} onChange={set(dk)} className={`${inp} pl-10`} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">Horario *</label>
              <div className="relative">
                <Clock size={16} weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
                <input required type="time" value={data[tk]} onChange={set(tk)} className={`${inp} pl-10`} />
              </div>
            </div>

            {data[dk] && (
              <div className="sm:col-span-2 flex items-center gap-2 bg-[#F7F7F2] rounded-xl px-4 py-2.5">
                <CalendarBlank size={13} className={dark ? 'text-[#1BFF11]' : 'text-[#9A9A8F]'} />
                <p className="text-sm font-bold text-[#0A0A0A] capitalize leading-snug">{fmt(data[dk], data[tk])}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {duration && (
        <div className="flex items-center gap-2.5 bg-[#F0F0EB] border border-[#E0E0D8] rounded-xl px-4 py-3">
          <Clock size={16} weight="fill" className="text-[#1BFF11] shrink-0" />
          <p className="text-sm font-bold text-[#0A0A0A]">
            Duracao: <span className="text-[#1BFF11]">{duration}</span>
          </p>
        </div>
      )}

      <div className="flex items-start gap-2 text-[#9A9A8F]">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Festas que passam da meia-noite: coloque o fim no dia seguinte. Ex: sab 23h ate dom 05h.
        </p>
      </div>
    </div>
  )
}
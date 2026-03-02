'use client'
import { useState } from 'react'
import { MapPin, SpinnerGap, MagnifyingGlass } from '@phosphor-icons/react'

export interface LocationFormData {
  venueName: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

const inputClass =
  'w-full px-4 py-3.5 bg-[#F7F7F2] border border-[#E0E0D8] rounded-xl focus:border-[#0A0A0A] focus:bg-white transition-all outline-none font-medium text-sm text-[#0A0A0A] placeholder:text-[#9A9A8F]'

interface StepLocationProps {
  data: LocationFormData
  onChange: (data: LocationFormData) => void
}

export function StepLocation({ data, onChange }: StepLocationProps) {
  const [loadingCep, setLoadingCep] = useState(false)
  const [cepError, setCepError] = useState('')

  const set = (key: keyof LocationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...data, [key]: e.target.value })

  const handleCepBlur = async () => {
    const raw = data.cep.replace(/\D/g, '')
    if (raw.length !== 8) return
    setLoadingCep(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
      const json = await res.json()
      if (json.erro) {
        setCepError('CEP nao encontrado.')
      } else {
        onChange({
          ...data,
          street: json.logradouro || '',
          neighborhood: json.bairro || '',
          city: json.localidade || '',
          state: json.uf || '',
        })
      }
    } catch {
      setCepError('Erro ao buscar CEP. Preencha manualmente.')
    } finally {
      setLoadingCep(false)
    }
  }

  const maskCep = (v: string) => {
    v = v.replace(/\D/g, '').slice(0, 8)
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5)
    return v
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">
          Nome do Local *
        </label>
        <div className="relative">
          <MapPin size={16} weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F]" />
          <input
            required
            type="text"
            value={data.venueName}
            onChange={set('venueName')}
            placeholder="Ex: Vila Ipojuca, Espaco Cultural USP..."
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">
          CEP *
        </label>
        <div className="relative">
          <input
            required
            type="text"
            value={data.cep}
            onChange={(e) => onChange({ ...data, cep: maskCep(e.target.value) })}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            className={`${inputClass} font-mono pr-10`}
            maxLength={9}
          />
          {loadingCep ? (
            <SpinnerGap size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A8F] animate-spin" />
          ) : (
            <MagnifyingGlass size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A8F]" />
          )}
        </div>
        {cepError && <p className="text-[11px] text-[#FF2D2D] ml-1">{cepError}</p>}
        <p className="text-[11px] text-[#9A9A8F] ml-1">CEP preenche o endereco automaticamente.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">Rua *</label>
          <input required type="text" value={data.street} onChange={set('street')} placeholder="Rua das Flores" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">Numero *</label>
          <input required type="text" value={data.number} onChange={set('number')} placeholder="123" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">Complemento</label>
          <input type="text" value={data.complement} onChange={set('complement')} placeholder="Apto, bloco..." className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">Bairro *</label>
          <input required type="text" value={data.neighborhood} onChange={set('neighborhood')} placeholder="Centro" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">Cidade *</label>
          <input required type="text" value={data.city} onChange={set('city')} placeholder="Sao Paulo" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">Estado *</label>
          <select required value={data.state} onChange={set('state')} className={`${inputClass} appearance-none`}>
            <option value="">UF</option>
            {BR_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
      </div>

      {data.city && data.state && (
        <div className="flex items-center gap-2.5 bg-[#F0F0EB] border border-[#E0E0D8] rounded-xl px-4 py-3">
          <MapPin size={16} weight="fill" className="text-[#1BFF11] shrink-0" />
          <p className="text-sm text-[#5C5C52] font-medium leading-tight">
            {[data.street, data.number, data.complement].filter(Boolean).join(', ')}
            {data.neighborhood ? ` - ${data.neighborhood}` : ''}
            {` - ${data.city}, ${data.state}`}
          </p>
        </div>
      )}
    </div>
  )
}
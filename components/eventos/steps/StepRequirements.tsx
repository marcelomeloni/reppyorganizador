import { useState } from 'react'
import { IdentificationCard, Users, Note, CheckCircle } from '@phosphor-icons/react'

export interface RequirementsFormData {
  minAge: string
  requiredDocs: string[]
  acceptedTerms: boolean
}

const DOCS = [
  { id: 'rg', label: 'RG', icon: IdentificationCard },
  { id: 'cnh', label: 'CNH', icon: IdentificationCard },
  { id: 'passaporte', label: 'Passaporte', icon: IdentificationCard },
  { id: 'matricula', label: 'Matricula universitaria', icon: Note },
  { id: 'cpf', label: 'CPF', icon: Note },
]

const AGE_OPTIONS = ['Livre', '14+', '16+', '18+']

export function StepRequirements({ data, onChange }: { data: RequirementsFormData; onChange: (d: RequirementsFormData) => void }) {
  const toggleDoc = (id: string) => {
    const has = data.requiredDocs.includes(id)
    onChange({ ...data, requiredDocs: has ? data.requiredDocs.filter(d => d !== id) : [...data.requiredDocs, id] })
  }

  return (
    <div className="space-y-6">
      {/* Faixa etaria */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 flex items-center gap-1.5">
          <Users size={12} weight="bold" /> Faixa Etaria *
        </label>
        <div className="flex gap-2 flex-wrap">
          {AGE_OPTIONS.map(age => (
            <button key={age} type="button" onClick={() => onChange({ ...data, minAge: age })}
              className={`px-5 py-2.5 rounded-[100px] text-sm font-bold border-2 transition-all
                ${data.minAge === age
                  ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                  : 'border-[#E0E0D8] text-[#5C5C52] hover:border-[#0A0A0A]/30 bg-white'}`}>
              {age}
            </button>
          ))}
        </div>
      </div>

      {/* Documentos exigidos */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 flex items-center gap-1.5">
          <IdentificationCard size={12} weight="bold" /> Documentos Necessarios
        </label>
        <div className="grid grid-cols-1 gap-2">
          {DOCS.map(({ id, label, icon: Icon }) => {
            const checked = data.requiredDocs.includes(id)
            return (
              <button key={id} type="button" onClick={() => toggleDoc(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left
                  ${checked ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white' : 'border-[#E0E0D8] bg-white text-[#5C5C52] hover:border-[#0A0A0A]/30'}`}>
                <Icon size={18} weight="bold" className={checked ? 'text-[#1BFF11]' : 'text-[#9A9A8F]'} />
                <span className="text-sm font-semibold">{label}</span>
                {checked && <CheckCircle size={16} weight="fill" className="text-[#1BFF11] ml-auto" />}
              </button>
            )
          })}
        </div>
        {data.requiredDocs.length === 0 && (
          <p className="text-[11px] text-[#9A9A8F] ml-1">Nenhum documento selecionado — entrada livre com qualquer ID.</p>
        )}
      </div>

      {/* Termos */}
      <div className="bg-[#F7F7F2] border border-[#E0E0D8] rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-[#0A0A0A]">Termos e Condicoes</h4>
        <div className="h-32 overflow-y-auto text-[11px] text-[#9A9A8F] leading-relaxed pr-2 space-y-2">
          <p>Ao publicar este evento na Reppy, voce confirma que todas as informacoes fornecidas sao verdadeiras.</p>
          <p>Voce e responsavel pelo cumprimento das legislacoes locais sobre realizacao de eventos, incluindo alvara, ECAD, e normas de segurança.</p>
          <p>A Reppy nao se responsabiliza por cancelamentos ou alteracoes feitas pelo organizador.</p>
          <p>Ingressos vendidos estao sujeitos a politica de reembolso definida pelo organizador.</p>
          <p>A Reppy reserva o direito de remover eventos que violem seus Termos de Uso.</p>
        </div>
        <button type="button" onClick={() => onChange({ ...data, acceptedTerms: !data.acceptedTerms })}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 transition-all text-left
            ${data.acceptedTerms ? 'border-[#1BFF11] bg-[#1BFF11]/5' : 'border-[#E0E0D8] bg-white'}`}>
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
            ${data.acceptedTerms ? 'bg-[#0A0A0A] border-[#0A0A0A]' : 'border-[#E0E0D8] bg-white'}`}>
            {data.acceptedTerms && <CheckCircle size={12} weight="fill" className="text-[#1BFF11]" />}
          </div>
          <span className="text-sm font-semibold text-[#0A0A0A]">
            Li e aceito os Termos de Uso da Reppy *
          </span>
        </button>
      </div>
    </div>
  )
}
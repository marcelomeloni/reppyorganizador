'use client'
import { useState } from 'react'
import { ArrowLeft, IdentificationCard, Info, CheckCircle, Copy } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

interface CompleteRegisterFormProps {
  onBack: () => void
  onCompleteProfile: (cpf: string, phone: string) => Promise<boolean | undefined>
  isLoading: boolean
  existingCpf: string | null  // null = ainda não tem CPF cadastrado
}

export function CompleteRegisterForm({
  onBack,
  onCompleteProfile,
  isLoading,
  existingCpf,
}: CompleteRegisterFormProps) {
  const router = useRouter()
  const [cpfInput, setCpfInput] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const displayCpf = existingCpf ?? cpfInput

  const handleCpfMask = (v: string) => {
    v = v.replace(/\D/g, '')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    return v.slice(0, 14)
  }

  const handlePhoneMask = (v: string) => {
    v = v.replace(/\D/g, '')
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d{5})(\d)/, '$1-$2')
    return v.slice(0, 15)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayCpf)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    const ok = await onCompleteProfile(cpfInput, phone)
    if (ok) setSaved(true)
  }

  const showSaved = existingCpf !== null || saved

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-left-6 duration-300 max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-body text-sm font-bold"
      >
        <ArrowLeft size={16} weight="bold" /> Voltar
      </button>

      {!showSaved ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-bricolage font-extrabold text-3xl text-black mb-2">Complete seu perfil</h2>
            <p className="font-body text-sm text-gray-500">Dados necessários para validar seus acessos.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-display text-xs font-bold text-gray-400 uppercase ml-1">CPF *</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpfInput}
                onChange={(e) => setCpfInput(handleCpfMask(e.target.value))}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[18px] focus:outline-none focus:border-black transition-all font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-display text-xs font-bold text-gray-400 uppercase ml-1">Telefone</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(handlePhoneMask(e.target.value))}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[18px] focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading || cpfInput.length < 14}
            className="w-full py-4 bg-black text-white font-display font-bold rounded-[18px] hover:bg-gray-900 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Salvar e verificar acessos'}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <IdentificationCard size={40} weight="fill" />
          </div>

          <div>
            <h2 className="font-bricolage font-extrabold text-2xl text-black">Perfil Identificado</h2>
            <p className="font-body text-sm text-gray-500 mt-2 leading-relaxed">
              Sua conta está vinculada ao CPF:
            </p>
            <button
              onClick={copyToClipboard}
              className="mt-3 flex items-center gap-2 mx-auto bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-all group"
            >
              <strong className="text-black text-lg font-mono">{displayCpf}</strong>
              {copied
                ? <CheckCircle size={18} className="text-green-600" weight="fill" />
                : <Copy size={18} className="text-gray-400 group-hover:text-black" />}
            </button>
            {copied && (
              <span className="text-[10px] text-green-600 font-bold uppercase mt-1 block animate-pulse">Copiado!</span>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 text-left space-y-4">
            <div className="flex gap-3">
              <Info size={20} weight="fill" className="text-primary-dark shrink-0 mt-0.5" />
              <p className="font-body text-xs text-gray-600 leading-relaxed">
                Envie seu CPF para o <strong>organizador</strong>. Assim que ele te adicionar, o evento aparecerá no seu painel.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-black text-white font-display font-bold rounded-[18px] hover:bg-gray-900 transition-all"
          >
            Ir para o Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
'use client'
import { useState } from 'react'
import {
  Plus,
  Bank,
  Key,
  CheckCircle,
  CircleNotch,
  XCircle,
} from '@phosphor-icons/react'
import { bankService } from '@/services/bankService'

const BLANK_FORM = {
  holder_name:     '',
  holder_document: '',
  bank_code:       '',
  bank_name:       '',
  agency:          '',
  agency_digit:    '',
  account_number:  '',
  account_digit:   '',
  account_type:    '' as '' | 'checking' | 'savings',
  pix_key:         '',
  pix_key_type:    '' as '' | 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
  is_default:      false,
}

interface Props {
  onClose:   () => void
  onSuccess: () => void
  token:     string
  slug:      string
}

const inputCls =
  'w-full px-3 py-2.5 rounded-[12px] bg-[#F7F7F2] border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] focus:outline-none focus:border-[#0A0A0A]/30 transition-colors'
const labelCls =
  'block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5'

export function BankAccountModal({ onClose, onSuccess, token, slug }: Props) {
  const [form, setForm]   = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [tab, setTab]       = useState<'bank' | 'pix'>('bank')

  const set = (k: keyof typeof BLANK_FORM, v: any) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.holder_name.trim() || !form.holder_document.trim()) {
      setError('Preencha o nome e o documento do titular.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await bankService.addAccount(token, slug, {
        holder_name:     form.holder_name,
        holder_document: form.holder_document.replace(/\D/g, ''),
        bank_code:       form.bank_code      || undefined,
        bank_name:       form.bank_name      || undefined,
        agency:          form.agency         || undefined,
        agency_digit:    form.agency_digit   || undefined,
        account_number:  form.account_number || undefined,
        account_digit:   form.account_digit  || undefined,
        account_type:    (form.account_type  || undefined) as any,
        pix_key:         form.pix_key        || undefined,
        pix_key_type:    (form.pix_key_type  || undefined) as any,
        is_default:      form.is_default,
      })
      onSuccess()
      onClose()
    } catch {
      setError('Erro ao salvar conta. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: 'bank' | 'pix'; label: string; icon: React.ElementType }[] = [
    { key: 'bank', label: 'Dados Bancários', icon: Bank },
    { key: 'pix',  label: 'Chave Pix',       icon: Key  },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] border border-[#E0E0D8] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0EB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#F0F0EB] flex items-center justify-center text-[#5C5C52]">
              <Bank size={16} weight="bold" />
            </div>
            <h2 className="font-extrabold text-[#0A0A0A] text-base tracking-tight">
              Nova Conta Bancária
            </h2>
          </div>
          <button onClick={onClose} className="text-[#9A9A8F] hover:text-[#0A0A0A] transition-colors p-1">
            <XCircle size={22} weight="fill" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Titular */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nome do Titular</label>
              <input
                className={inputCls}
                placeholder="Nome completo ou razão social"
                value={form.holder_name}
                onChange={(e) => set('holder_name', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>CPF / CNPJ</label>
              <input
                className={inputCls}
                placeholder="000.000.000-00"
                value={form.holder_document}
                onChange={(e) => set('holder_document', e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#F0F0EB] p-1 rounded-[12px]">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex flex-1 items-center justify-center gap-2 py-2 rounded-[10px] text-xs font-bold transition-all ${
                  tab === key
                    ? 'bg-white text-[#0A0A0A] shadow-sm'
                    : 'text-[#9A9A8F] hover:text-[#5C5C52]'
                }`}
              >
                <Icon size={13} weight="bold" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab: bank */}
          {tab === 'bank' && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Código do Banco</label>
                  <input className={inputCls} placeholder="ex: 341" value={form.bank_code}
                    onChange={(e) => set('bank_code', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Nome do Banco</label>
                  <input className={inputCls} placeholder="ex: Itaú" value={form.bank_name}
                    onChange={(e) => set('bank_name', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Agência</label>
                  <input className={inputCls} placeholder="0000" value={form.agency}
                    onChange={(e) => set('agency', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Dígito</label>
                  <input className={inputCls} placeholder="0" value={form.agency_digit}
                    onChange={(e) => set('agency_digit', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Número da Conta</label>
                  <input className={inputCls} placeholder="00000-0" value={form.account_number}
                    onChange={(e) => set('account_number', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Dígito</label>
                  <input className={inputCls} placeholder="0" value={form.account_digit}
                    onChange={(e) => set('account_digit', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Tipo de Conta</label>
                <select className={inputCls} value={form.account_type}
                  onChange={(e) => set('account_type', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab: pix */}
          {tab === 'pix' && (
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Tipo de Chave</label>
                <select className={inputCls} value={form.pix_key_type}
                  onChange={(e) => set('pix_key_type', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Chave Pix</label>
                <input className={inputCls} placeholder="Digite a chave..." value={form.pix_key}
                  onChange={(e) => set('pix_key', e.target.value)} />
              </div>
            </div>
          )}

          {/* Conta padrão */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => set('is_default', !form.is_default)}
              className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all ${
                form.is_default
                  ? 'bg-[#0A0A0A] border-[#0A0A0A]'
                  : 'border-[#D0D0C8] group-hover:border-[#9A9A8F]'
              }`}
            >
              {form.is_default && <CheckCircle size={12} weight="fill" className="text-white" />}
            </div>
            <span className="text-sm font-semibold text-[#0A0A0A]">Definir como conta padrão</span>
          </label>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-[100px] border border-[#E0E0D8] text-sm font-bold text-[#5C5C52] hover:bg-[#F0F0EB] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-[100px] bg-[#0A0A0A] text-white text-sm font-bold hover:bg-[#222] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <CircleNotch size={16} className="animate-spin" /> : <Plus size={16} weight="bold" />}
              {saving ? 'Salvando...' : 'Adicionar Conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
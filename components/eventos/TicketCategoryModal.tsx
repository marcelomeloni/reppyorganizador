'use client'
import { useState, useMemo } from 'react'
import {
  X,
  Ticket,
  Plus,
  Trash,
  ArrowsLeftRight,
  Storefront,
  CalendarBlank,
  Clock,
  Link,
  Info,
  CaretDown,
  CaretUp,
  PencilSimple,
  Check,
  Warning,
} from '@phosphor-icons/react'
import type { TicketCategory, TicketLot } from '@/types/tickets'

// ─── Fee Settings ────────────────────────────────────────────────────────────
interface FeeSettings {
  percentage: number
  fixed: number
}

const DEFAULT_FEE: FeeSettings = { percentage: 10, fixed: 0 }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function newLot(overrides: Partial<TicketLot> = {}): TicketLot {
  return {
    id: crypto.randomUUID(),
    name: '',
    price: '',
    quantity: '',
    salesStart: '',
    salesEnd: '',
    salesTrigger: 'date',
    triggerLotId: '',
    feePayer: 'customer',
    minPurchase: 1,
    maxPurchase: 10,
    ...overrides,
  }
}

function newCategory(): TicketCategory {
  return {
    id: crypto.randomUUID(),
    name: '',
    type: 'paid',
    description: '',
    availability: 'public',
    isTransferable: true,
    inReppyMarket: true,
    lots: [newLot({ name: '1º Lote' })],
  }
}

function fmtBRL(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

function parseBRL(str: string) {
  return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0
}

const inp =
  'w-full px-4 py-3 bg-[#F7F7F2] border border-[#E0E0D8] rounded-xl focus:border-[#0A0A0A] focus:bg-white transition-all outline-none font-medium text-sm text-[#0A0A0A] placeholder:text-[#9A9A8F]'

// ─── Lot Row ─────────────────────────────────────────────────────────────────
function LotRow({
  lot,
  index,
  isOnly,
  previousLots,
  categoryType,
  feeSettings,
  onChange,
  onRemove,
}: {
  lot: TicketLot
  index: number
  isOnly: boolean
  previousLots: TicketLot[]
  categoryType: 'free' | 'paid'
  feeSettings: FeeSettings
  onChange: (updated: TicketLot) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(index === 0)
  const set = (key: keyof TicketLot) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...lot, [key]: e.target.value })

  const price = parseBRL(lot.price)
  const fee = (price * feeSettings.percentage) / 100 + feeSettings.fixed
  const customerPays = lot.feePayer === 'customer' ? price + fee : price
  const organizerGets = lot.feePayer === 'customer' ? price : price - fee

  return (
    <div className="border border-[#E0E0D8] rounded-2xl overflow-hidden">
      {/* Header do lote */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F7F7F2]">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-[#1BFF11] flex items-center justify-center text-[10px] font-bold shrink-0">
            {index + 1}
          </div>
          <span className="text-sm font-bold text-[#0A0A0A] truncate">
            {lot.name || `Lote ${index + 1}`}
          </span>
          {categoryType === 'paid' && lot.price && (
            <span className="text-xs font-bold text-[#9A9A8F] ml-1">· R$ {lot.price}</span>
          )}
          {lot.quantity && (
            <span className="text-xs font-bold text-[#9A9A8F]">· {lot.quantity} un</span>
          )}
          {open ? (
            <CaretUp size={14} className="text-[#9A9A8F] ml-auto shrink-0" />
          ) : (
            <CaretDown size={14} className="text-[#9A9A8F] ml-auto shrink-0" />
          )}
        </button>
        {!isOnly && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-3 p-1.5 text-[#9A9A8F] hover:text-[#FF2D2D] transition-colors"
          >
            <Trash size={15} weight="bold" />
          </button>
        )}
      </div>

      {open && (
        <div className="p-4 space-y-4 bg-white">
          {/* Nome + Qtd + Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">Nome do Lote</label>
              <input
                type="text"
                value={lot.name}
                placeholder="Ex: 1º Lote"
                onChange={set('name')}
                className={inp}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">Quantidade *</label>
              <input
                type="number"
                min="1"
                value={lot.quantity}
                placeholder="100"
                onChange={set('quantity')}
                className={inp}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">
                {categoryType === 'free' ? 'Preço' : 'Preço (R$) *'}
              </label>
              <input
                type="text"
                disabled={categoryType === 'free'}
                value={categoryType === 'free' ? 'Grátis' : lot.price}
                placeholder="0,00"
                onChange={set('price')}
                className={`${inp} ${categoryType === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Resumo financeiro */}
          {categoryType === 'paid' && price > 0 && (
            <div className="bg-[#F7F7F2] border border-[#E0E0D8] rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Toggle quem paga a taxa */}
                <button
                  type="button"
                  onClick={() =>
                    onChange({ ...lot, feePayer: lot.feePayer === 'customer' ? 'organizer' : 'customer' })
                  }
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all
                    ${lot.feePayer === 'customer'
                      ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                      : 'border-[#E0E0D8] bg-white text-[#5C5C52]'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                    ${lot.feePayer === 'customer' ? 'border-[#1BFF11] bg-[#1BFF11]' : 'border-[#E0E0D8]'}`}>
                    {lot.feePayer === 'customer' && <Check size={10} weight="bold" className="text-[#0A0A0A]" />}
                  </div>
                  Repassar taxa ao comprador
                </button>

                {/* Resumo */}
                <div className="text-sm space-y-1 text-right">
                  <div className="flex justify-between gap-8 text-[#9A9A8F]">
                    <span>Taxa ({feeSettings.percentage}%)</span>
                    <span>{fmtBRL(fee)}</span>
                  </div>
                  <div className="flex justify-between gap-8 font-bold text-[#0A0A0A]">
                    <span>Comprador paga</span>
                    <span>{fmtBRL(customerPays)}</span>
                  </div>
                  <div className="flex justify-between gap-8 font-bold text-[#1BFF11]">
                    <span>Você recebe</span>
                    <span>{fmtBRL(organizerGets)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trigger de vendas */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">
              Início das Vendas
            </label>
            <div className="flex gap-2">
              {(['date', 'batch'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ ...lot, salesTrigger: t })}
                  className={`px-4 py-2 rounded-[100px] text-xs font-bold border-2 transition-all
                    ${lot.salesTrigger === t
                      ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                      : 'border-[#E0E0D8] text-[#5C5C52] bg-white hover:border-[#0A0A0A]/30'}`}
                >
                  {t === 'date' ? 'Por Data' : 'Quando Lote Anterior Esgotar'}
                </button>
              ))}
            </div>

            {lot.salesTrigger === 'batch' && (
              <div className="space-y-1.5">
                {previousLots.length === 0 ? (
                  <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-xs text-orange-700">
                    <Warning size={14} className="shrink-0 mt-0.5" />
                    Crie ao menos um lote por data antes de usar essa opção.
                  </div>
                ) : (
                  <div className="relative">
                    <Link size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
                    <select
                      value={lot.triggerLotId}
                      onChange={set('triggerLotId')}
                      className={`${inp} pl-10 appearance-none`}
                    >
                      <option value="">Selecione o lote gatilho…</option>
                      {previousLots.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name || `Lote ${previousLots.indexOf(l) + 1}`} · {l.quantity} un
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Datas de vendas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">
                Início das Vendas
              </label>
              <div className="relative">
                <CalendarBlank size={15} weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
                <input
                  type="datetime-local"
                  value={lot.salesStart}
                  disabled={lot.salesTrigger === 'batch'}
                  onChange={set('salesStart')}
                  className={`${inp} pl-10 ${lot.salesTrigger === 'batch' ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">
                Fim das Vendas
              </label>
              <div className="relative">
                <Clock size={15} weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
                <input
                  type="datetime-local"
                  value={lot.salesEnd}
                  onChange={set('salesEnd')}
                  className={`${inp} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Min / Max por compra */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">Mín. por Compra</label>
              <input
                type="number"
                min="1"
                value={lot.minPurchase}
                onChange={set('minPurchase')}
                className={inp}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">Máx. por Compra</label>
              <input
                type="number"
                min="1"
                value={lot.maxPurchase}
                onChange={set('maxPurchase')}
                className={inp}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface TicketCategoryModalProps {
  isOpen: boolean
  categoryToEdit?: TicketCategory
  feeSettings?: FeeSettings
  onClose: () => void
  onSave: (category: TicketCategory) => void
}

export function TicketCategoryModal({
  isOpen,
  categoryToEdit,
  feeSettings = DEFAULT_FEE,
  onClose,
  onSave,
}: TicketCategoryModalProps) {
  const [cat, setCat] = useState<TicketCategory>(() => categoryToEdit ?? newCategory())

  if (!isOpen) return null

  const setField = <K extends keyof TicketCategory>(key: K, value: TicketCategory[K]) =>
    setCat((c) => ({ ...c, [key]: value }))

  const updateLot = (id: string, updated: TicketLot) =>
    setCat((c) => ({ ...c, lots: c.lots.map((l) => (l.id === id ? updated : l)) }))

  const removeLot = (id: string) =>
    setCat((c) => ({ ...c, lots: c.lots.filter((l) => l.id !== id) }))

  const addLot = () => {
    const n = cat.lots.length + 1
    setCat((c) => ({ ...c, lots: [...c.lots, newLot({ name: `${n}º Lote` })] }))
  }

  const canSave = cat.name.trim().length > 0 && cat.lots.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-[28px] rounded-t-[28px] max-h-[92vh] flex flex-col shadow-2xl">

        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EB] shrink-0">
          <div>
            <h3 className="font-display font-extrabold text-lg text-[#0A0A0A] tracking-tight">
              {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria de Ingresso'}
            </h3>
            <p className="text-[11px] text-[#9A9A8F] mt-0.5">
              Configure a categoria e os lotes de venda.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F0F0EB] flex items-center justify-center text-[#9A9A8F] hover:bg-[#E0E0D8] hover:text-[#0A0A0A] transition-all"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Seção 1: Informações da Categoria ── */}
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">
              Informações da Categoria
            </span>

            {/* Nome + Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Ex: Pista, Estudante, VIP…"
                  className={inp}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">Tipo</label>
                <div className="flex gap-2">
                  {(['paid', 'free'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setField('type', t)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all
                        ${cat.type === t
                          ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                          : 'border-[#E0E0D8] text-[#5C5C52] bg-white hover:border-[#0A0A0A]/30'}`}
                    >
                      {t === 'paid' ? 'Pago' : 'Grátis'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Disponibilidade */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] block">
                Disponibilidade
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: 'public',    label: 'Público' },
                  { value: 'hidden',    label: 'Oculto (link direto)' },
                 
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setField('availability', value)}
                    className={`px-4 py-2 rounded-[100px] text-xs font-bold border-2 transition-all
                      ${cat.availability === value
                        ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                        : 'border-[#E0E0D8] text-[#5C5C52] bg-white hover:border-[#0A0A0A]/30'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>


            {/* Toggles: Transferível + Reppy Market */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Transferível */}
              <button
                type="button"
                onClick={() => setField('isTransferable', !cat.isTransferable)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all
                  ${cat.isTransferable
                    ? 'border-[#0A0A0A] bg-[#0A0A0A]'
                    : 'border-[#E0E0D8] bg-white hover:border-[#0A0A0A]/30'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                  ${cat.isTransferable ? 'bg-[#1BFF11]' : 'bg-[#F0F0EB]'}`}>
                  <ArrowsLeftRight
                    size={18}
                    weight="bold"
                    className={cat.isTransferable ? 'text-[#0A0A0A]' : 'text-[#9A9A8F]'}
                  />
                </div>
                <div>
                  <p className={`text-sm font-bold leading-none ${cat.isTransferable ? 'text-white' : 'text-[#0A0A0A]'}`}>
                    Transferível
                  </p>
                  <p className={`text-[11px] mt-0.5 leading-tight ${cat.isTransferable ? 'text-[#9A9A8F]' : 'text-[#9A9A8F]'}`}>
                    Comprador pode repassar o ingresso
                  </p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${cat.isTransferable ? 'border-[#1BFF11] bg-[#1BFF11]' : 'border-[#E0E0D8] bg-white'}`}>
                  {cat.isTransferable && <Check size={11} weight="bold" className="text-[#0A0A0A]" />}
                </div>
              </button>

              {/* Reppy Market */}
              <button
                type="button"
                onClick={() => setField('inReppyMarket', !cat.inReppyMarket)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all
                  ${cat.inReppyMarket
                    ? 'border-[#0A0A0A] bg-[#0A0A0A]'
                    : 'border-[#E0E0D8] bg-white hover:border-[#0A0A0A]/30'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                  ${cat.inReppyMarket ? 'bg-[#1BFF11]' : 'bg-[#F0F0EB]'}`}>
                  <Storefront
                    size={18}
                    weight="bold"
                    className={cat.inReppyMarket ? 'text-[#0A0A0A]' : 'text-[#9A9A8F]'}
                  />
                </div>
                <div>
                  <p className={`text-sm font-bold leading-none ${cat.inReppyMarket ? 'text-white' : 'text-[#0A0A0A]'}`}>
                    Reppy Market
                  </p>
                  <p className={`text-[11px] mt-0.5 leading-tight ${cat.inReppyMarket ? 'text-[#9A9A8F]' : 'text-[#9A9A8F]'}`}>
                    Aparece na vitrine de revenda
                  </p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${cat.inReppyMarket ? 'border-[#1BFF11] bg-[#1BFF11]' : 'border-[#E0E0D8] bg-white'}`}>
                  {cat.inReppyMarket && <Check size={11} weight="bold" className="text-[#0A0A0A]" />}
                </div>
              </button>
            </div>
          </div>

          {/* ── Seção 2: Lotes ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F]">
                Lotes · {cat.lots.length}
              </span>
              <button
                type="button"
                onClick={addLot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[100px] bg-[#0A0A0A] text-white
                  text-[11px] font-bold hover:bg-[#1BFF11] hover:text-[#0A0A0A] transition-all active:scale-95"
              >
                <Plus size={13} weight="bold" /> Adicionar Lote
              </button>
            </div>

            <div className="space-y-2">
              {cat.lots.map((lot, i) => (
                <LotRow
                  key={lot.id}
                  lot={lot}
                  index={i}
                  isOnly={cat.lots.length === 1}
                  previousLots={cat.lots.slice(0, i).filter((l) => l.salesTrigger === 'date')}
                  categoryType={cat.type}
                  feeSettings={feeSettings}
                  onChange={(updated) => updateLot(lot.id, updated)}
                  onRemove={() => removeLot(lot.id)}
                />
              ))}
            </div>

            <div className="flex items-start gap-2 text-[#9A9A8F]">
              <Info size={13} className="shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Cada lote pode ter preço, quantidade e período de vendas independentes.
                Use "Quando Lote Anterior Esgotar" para virada automática.
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#F0F0EB] bg-[#F7F7F2] sm:rounded-b-[28px] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-[100px] font-bold text-sm border-2 border-[#E0E0D8]
              text-[#9A9A8F] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave(cat)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-[100px] font-bold text-sm
              bg-[#1BFF11] text-[#0A0A0A] hover:bg-[#0FD40A]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all active:scale-95 shadow-lg shadow-[#1BFF11]/20"
          >
            <Check size={16} weight="bold" />
            {categoryToEdit ? 'Salvar Alterações' : 'Criar Categoria'}
          </button>
        </div>
      </div>
    </div>
  )
}
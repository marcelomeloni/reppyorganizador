'use client'
import { useState } from 'react'
import {
  Plus,
  Ticket,
  PencilSimple,
  Trash,
  ArrowsLeftRight,
  Storefront,
  Lock,
  Eye,
  Users,
  CaretRight,
} from '@phosphor-icons/react'
import { TicketCategoryModal } from '@/components/eventos/TicketCategoryModal'
import type { TicketCategory, TicketsFormData } from '@/types/tickets'

interface StepTicketsProps {
  data: TicketsFormData
  onChange: (d: TicketsFormData) => void
  feeSettings?: { percentage: number; fixed: number }
}

// ── Badge de disponibilidade ──────────────────────────────────────────────────
function AvailabilityBadge({ value }: { value: TicketCategory['availability'] }) {
  const map = {
    public:    { label: 'Público',     icon: Eye,   color: 'text-green-700 bg-green-50 border-green-100' },
    hidden:    { label: 'Oculto',      icon: Lock,  color: 'text-orange-700 bg-orange-50 border-orange-100' },
    guestlist: { label: 'Convidados',  icon: Users, color: 'text-blue-700 bg-blue-50 border-blue-100' },
  }
  const { label, icon: Icon, color } = map[value]
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${color}`}>
      <Icon size={11} weight="fill" />
      {label}
    </span>
  )
}

// ── Card de categoria ─────────────────────────────────────────────────────────
function CategoryCard({
  category,
  onEdit,
  onRemove,
}: {
  category: TicketCategory
  onEdit: () => void
  onRemove: () => void
}) {
  const totalQty = category.lots.reduce((acc, l) => acc + (parseInt(l.quantity) || 0), 0)
  const prices = category.lots
    .filter((l) => l.price && category.type === 'paid')
    .map((l) => parseFloat(l.price.replace(/\./g, '').replace(',', '.')) || 0)
  const minPrice = prices.length ? Math.min(...prices) : null
  const maxPrice = prices.length ? Math.max(...prices) : null

  return (
    <div className="bg-white border border-[#E0E0D8] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${category.type === 'free' ? 'bg-green-100' : 'bg-[#0A0A0A]'}`}>
            <Ticket size={18} weight="fill" className={category.type === 'free' ? 'text-green-700' : 'text-[#1BFF11]'} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm text-[#0A0A0A] truncate">{category.name}</p>
              <AvailabilityBadge value={category.availability} />
            </div>
            <p className="text-[11px] text-[#9A9A8F] mt-0.5">
              {category.lots.length} lote{category.lots.length !== 1 ? 's' : ''} ·{' '}
              {totalQty > 0 ? `${totalQty} unidades` : 'qtd. não definida'} ·{' '}
              {category.type === 'free'
                ? 'Grátis'
                : minPrice !== null
                  ? minPrice === maxPrice
                    ? `R$ ${minPrice.toFixed(2).replace('.', ',')}`
                    : `R$ ${minPrice.toFixed(2).replace('.', ',')} – ${maxPrice!.toFixed(2).replace('.', ',')}`
                  : 'sem preço'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          <button
            type="button"
            onClick={onEdit}
            className="p-2.5 rounded-xl bg-[#F7F7F2] border border-[#E0E0D8] text-[#9A9A8F]
              hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all"
          >
            <PencilSimple size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-2.5 rounded-xl bg-[#F7F7F2] border border-[#E0E0D8] text-[#9A9A8F]
              hover:text-[#FF2D2D] hover:bg-red-50 hover:border-red-100 transition-all"
          >
            <Trash size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Lotes resumidos */}
      <div className="border-t border-[#F0F0EB] divide-y divide-[#F0F0EB]">
        {category.lots.map((lot, i) => (
          <div key={lot.id} className="flex items-center justify-between px-5 py-2.5 bg-[#F7F7F2]/60">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#E0E0D8] text-[#9A9A8F] text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <span className="text-xs font-medium text-[#5C5C52]">{lot.name || `Lote ${i + 1}`}</span>
              {lot.salesTrigger === 'batch' && (
                <span className="text-[10px] font-bold text-[#8B2FFF] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Auto
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-[#9A9A8F]">
              {lot.quantity && <span>{lot.quantity} un</span>}
              {category.type === 'paid' && lot.price && (
                <span className="text-[#0A0A0A]">R$ {lot.price}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Flags: Transferível + Reppy Market */}
      <div className="flex items-center gap-3 px-5 py-3 border-t border-[#F0F0EB]">
        <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all
          ${category.isTransferable
            ? 'text-[#0A0A0A] bg-[#1BFF11]/10 border-[#1BFF11]/30'
            : 'text-[#9A9A8F] bg-[#F0F0EB] border-[#E0E0D8] line-through opacity-50'}`}>
          <ArrowsLeftRight size={11} weight="bold" />
          Transferível
        </span>
        <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all
          ${category.inReppyMarket
            ? 'text-[#0A0A0A] bg-[#1BFF11]/10 border-[#1BFF11]/30'
            : 'text-[#9A9A8F] bg-[#F0F0EB] border-[#E0E0D8] line-through opacity-50'}`}>
          <Storefront size={11} weight="bold" />
          Reppy Market
        </span>
      </div>
    </div>
  )
}

// ── Main Step ─────────────────────────────────────────────────────────────────
export function StepTickets({ data, onChange, feeSettings }: StepTicketsProps) {
  // Guard: normaliza caso o estado inicial venha sem a chave correta
  const categories: TicketCategory[] = data?.categories ?? []

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<TicketCategory | undefined>(undefined)

  const openNew = () => {
    setEditingCategory(undefined)
    setModalOpen(true)
  }

  const openEdit = (cat: TicketCategory) => {
    setEditingCategory(cat)
    setModalOpen(true)
  }

  const handleSave = (cat: TicketCategory) => {
    const exists = categories.find((c) => c.id === cat.id)
    onChange({
      categories: exists
        ? categories.map((c) => (c.id === cat.id ? cat : c))
        : [...categories, cat],
    })
    setModalOpen(false)
  }

  const handleRemove = (id: string) => {
    onChange({ categories: categories.filter((c) => c.id !== id) })
  }

  return (
    <div className="space-y-4">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#0A0A0A]">
            {categories.length === 0
              ? 'Nenhuma categoria criada'
              : `${categories.length} categoria${categories.length !== 1 ? 's' : ''}`}
          </p>
          <p className="text-[11px] text-[#9A9A8F]">
            Cada categoria pode ter múltiplos lotes com preços e datas diferentes.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[100px] bg-[#0A0A0A] text-white
            text-xs font-bold hover:bg-[#1BFF11] hover:text-[#0A0A0A] transition-all
            active:scale-95 shadow-md shadow-black/10 shrink-0"
        >
          <Plus size={14} weight="bold" />
          Nova Categoria
        </button>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div
          onClick={openNew}
          className="flex flex-col items-center justify-center gap-4 py-16 border-2 border-dashed
            border-[#E0E0D8] rounded-2xl cursor-pointer hover:border-[#0A0A0A]/30 hover:bg-[#F7F7F2]
            transition-all group"
        >
          <div className="w-14 h-14 bg-[#F0F0EB] group-hover:bg-[#0A0A0A] rounded-2xl flex items-center justify-center transition-all">
            <Ticket size={24} className="text-[#9A9A8F] group-hover:text-[#1BFF11] transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#0A0A0A]">Crie sua primeira categoria</p>
            <p className="text-[11px] text-[#9A9A8F] mt-1">
              Ex: Pista, Camarote, Estudante, VIP…
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#9A9A8F]">
            Clique para começar <CaretRight size={12} weight="bold" />
          </div>
        </div>
      )}

      {/* Lista de categorias */}
      {categories.length > 0 && (
        <div className="space-y-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={() => openEdit(cat)}
              onRemove={() => handleRemove(cat.id)}
            />
          ))}

          {/* CTA adicionar mais */}
          <button
            type="button"
            onClick={openNew}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
              border-2 border-dashed border-[#E0E0D8] text-[#9A9A8F]
              hover:border-[#0A0A0A]/30 hover:text-[#0A0A0A] hover:bg-[#F7F7F2]
              text-xs font-bold transition-all"
          >
            <Plus size={14} weight="bold" />
            Adicionar mais uma categoria
          </button>
        </div>
      )}

      {/* Modal */}
      <TicketCategoryModal
        isOpen={modalOpen}
        categoryToEdit={editingCategory}
        feeSettings={feeSettings}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
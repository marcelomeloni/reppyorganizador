'use client'
import { useState, useRef } from 'react'
import { Image as ImageIcon, UploadSimple, X, Info, ArrowsClockwise } from '@phosphor-icons/react'

export interface MediaFormData {
  bannerFile: File | null
  bannerPreview: string | null
}

interface StepMediaProps {
  data: MediaFormData
  onChange: (data: MediaFormData) => void
  eventName?: string
}

export function StepMedia({ data, onChange, eventName = 'Nome do Evento' }: StepMediaProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    onChange({ bannerFile: file, bannerPreview: URL.createObjectURL(file) })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    if (data.bannerPreview) URL.revokeObjectURL(data.bannerPreview)
    onChange({ bannerFile: null, bannerPreview: null })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">
          Banner do Evento *
        </label>

        {!data.bannerPreview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3 h-44 rounded-2xl border-2 border-dashed
              cursor-pointer transition-all
              ${dragging
                ? 'border-[#1BFF11] bg-[#1BFF11]/5'
                : 'border-[#E0E0D8] bg-[#F7F7F2] hover:border-[#0A0A0A]/30 hover:bg-[#F0F0EB]'}
            `}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all
              ${dragging ? 'bg-[#1BFF11]' : 'bg-[#E0E0D8]'}`}>
              <UploadSimple size={22} weight="bold" className={dragging ? 'text-[#0A0A0A]' : 'text-[#9A9A8F]'} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[#0A0A0A]">
                {dragging ? 'Solte a imagem aqui' : 'Arraste ou clique para enviar'}
              </p>
              <p className="text-xs text-[#9A9A8F] mt-0.5">PNG, JPG, WEBP — mínimo 1200×675px</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Imagem */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={data.bannerPreview}
                alt="Banner"
                className="w-full h-44 object-cover"
              />
            </div>

            {/* Ações abaixo da imagem — sempre visíveis */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                  bg-[#F7F7F2] border border-[#E0E0D8] text-[#5C5C52]
                  hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A]
                  text-xs font-bold transition-all active:scale-95"
              >
                <ArrowsClockwise size={14} weight="bold" />
                Trocar imagem
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-[#F7F7F2] border border-[#E0E0D8] text-[#9A9A8F]
                  hover:bg-red-50 hover:text-[#FF2D2D] hover:border-red-100
                  text-xs font-bold transition-all active:scale-95"
              >
                <X size={14} weight="bold" />
                Remover
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>
        )}
      </div>

      {/* Previews */}
      {data.bannerPreview && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-[#9A9A8F]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F]">
              Preview de Exibição
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 16:9 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5C5C52]">Feed · 16:9</span>
                <span className="text-[10px] text-[#9A9A8F] bg-[#F0F0EB] px-2 py-0.5 rounded-full font-medium">Destaque</span>
              </div>
              <div className="relative w-full rounded-2xl overflow-hidden bg-[#0A0A0A]" style={{ aspectRatio: '16/9' }}>
                <img src={data.bannerPreview} alt="Preview 16:9" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm leading-tight line-clamp-1">{eventName}</p>
                  <p className="text-[#9A9A8F] text-[11px] mt-0.5">Sáb, 14 Jun · São Paulo</p>
                </div>
                <div className="absolute top-2 right-2 bg-[#1BFF11] text-[#0A0A0A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  A partir de R$20
                </div>
              </div>
            </div>

            {/* 1:1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5C5C52]">Card · 1:1</span>
                <span className="text-[10px] text-[#9A9A8F] bg-[#F0F0EB] px-2 py-0.5 rounded-full font-medium">Listagem</span>
              </div>
              <div className="flex gap-3">
                <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0A] shrink-0" style={{ width: 120, height: 120 }}>
                  <img src={data.bannerPreview} alt="Preview 1:1" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <p className="text-xs text-[#9A9A8F] font-medium">Sáb, 14 Jun</p>
                    <p className="text-sm font-bold text-[#0A0A0A] mt-0.5 leading-tight line-clamp-2">{eventName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9A9A8F]">São Paulo, SP</p>
                    <p className="text-sm font-bold text-[#0A0A0A] mt-0.5">R$ 20</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#9A9A8F] flex items-center gap-1.5">
            <Info size={12} />
            O banner deve ter pelo menos 1200×675px para evitar pixelação.
          </p>
        </div>
      )}
    </div>
  )
}
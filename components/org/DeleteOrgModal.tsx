'use client'
import { useState } from 'react'
import { X, Warning, Trash, ArrowsLeftRight } from '@phosphor-icons/react'

interface DeleteOrgModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  orgName: string
}

export function DeleteOrgModal({ isOpen, onClose, onConfirm, orgName }: DeleteOrgModalProps) {
  const [confirmName, setConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    setIsDeleting(true)
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-red-900/20 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-red-100">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Warning size={32} weight="fill" />
          </div>
          
          <h2 className="font-bricolage font-extrabold text-2xl text-black mb-2">Você tem certeza?</h2>
          <p className="text-gray-500 font-body text-sm leading-relaxed">
            Esta ação é irreversível. Todos os dados da <strong>{orgName}</strong>, incluindo eventos e membros, serão apagados para sempre.
          </p>

          <div className="mt-8 space-y-4">
            <div className="text-left space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                Digite o nome da organização para confirmar
              </label>
              <input 
                type="text" 
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={orgName}
                className="w-full px-5 py-3 bg-red-50/50 border border-red-100 rounded-xl focus:border-red outline-none transition-all font-medium text-center"
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirmName !== orgName || isDeleting}
              className="w-full py-4 bg-red text-white font-bold rounded-2xl hover:bg-red-700 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
            >
              <Trash size={20} weight="bold" />
              {isDeleting ? 'Excluindo...' : 'Sim, excluir organização'}
            </button>

            <button 
              onClick={onClose}
              className="w-full py-2 text-gray-400 font-bold hover:text-black transition-colors text-sm"
            >
              Cancelar e voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
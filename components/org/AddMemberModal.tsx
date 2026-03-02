'use client'
import { useState, useEffect } from 'react'
import { 
  X, 
  ShieldCheck, 
  IdentificationBadge, 
  UserPlus,
  QrCode,
  Megaphone,
  Check
} from '@phosphor-icons/react'

type Role = 'ADMIN' | 'PROMOTER' | 'CHECKIN'

interface Member {
  id: string
  name: string
  email: string
  cpf: string
  role: Role
  status: 'ACTIVE' | 'PENDING'
}

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  memberToEdit?: Member | null // Prop para identificar se é edição
}

export function AddMemberModal({ isOpen, onClose, memberToEdit }: AddMemberModalProps) {
  const [cpf, setCpf] = useState('')
  const [role, setRole] = useState<Role>('CHECKIN')
  const isEditing = !!memberToEdit

  // Sincroniza o estado quando o modal abre para edição
  useEffect(() => {
    if (memberToEdit) {
      setCpf(memberToEdit.cpf)
      setRole(memberToEdit.role)
    } else {
      setCpf('')
      setRole('CHECKIN')
    }
  }, [memberToEdit, isOpen])

  const handleCpfMask = (v: string) => {
    v = v.replace(/\D/g, '')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    setCpf(v.slice(0, 14))
  }

  if (!isOpen) return null

  const roleOptions = [
    { id: 'ADMIN', label: 'Administrador', icon: ShieldCheck, desc: 'Acesso total ao painel e financeiro.' },
    { id: 'PROMOTER', label: 'Promoter', icon: Megaphone, desc: 'Gestão de listas e convidados.' },
    { id: 'CHECKIN', label: 'Check-in', icon: QrCode, desc: 'Apenas leitura de ingressos na portaria.' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="font-bricolage font-extrabold text-3xl text-black">
              {isEditing ? 'Editar Membro' : 'Novo Membro'}
            </h2>
            <p className="text-gray-500 font-body text-sm mt-1">
              {isEditing ? `Alterando acesso de ${memberToEdit.name}` : 'Convide alguém para sua equipe.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
            <X size={24} weight="bold" />
          </button>
        </div>

        <form className="p-8 pt-4 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">CPF do Usuário *</label>
            <input 
              type="text" 
              value={cpf}
              disabled={isEditing} // Não editamos CPF de quem já está na lista
              onChange={(e) => handleCpfMask(e.target.value)}
              placeholder="000.000.000-00" 
              className={`w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-black transition-all outline-none font-mono text-lg ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nível de Acesso *</label>
            <div className="grid grid-cols-1 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRole(option.id as Role)}
                  className={`flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all ${
                    role === option.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${role === option.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <option.icon size={20} weight={role === option.id ? "fill" : "bold"} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-black">{option.label}</p>
                    <p className="text-[11px] text-gray-500 leading-tight">{option.desc}</p>
                  </div>
                  {role === option.id && <Check size={18} weight="bold" className="text-black" />}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="p-8 bg-gray-50/50 flex flex-col gap-3">
          <button className="w-full py-4 bg-black text-white font-display font-bold rounded-2xl hover:bg-primary hover:text-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2">
            {isEditing ? 'Salvar Alterações' : <><UserPlus size={20} weight="bold" /> Enviar Convite</>}
          </button>
        </div>
      </div>
    </div>
  )
}
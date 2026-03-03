'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { teamService, type OrgMember } from '@/services/teamService'
import { 
  X, 
  ShieldCheck, 
  UserPlus,
  QrCode,
  Megaphone,
  Check,
  CircleNotch
} from '@phosphor-icons/react'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  memberToEdit?: OrgMember | null 
  onSuccess?: () => void // Função para recarregar a tabela após salvar
}

export function AddMemberModal({ isOpen, onClose, memberToEdit, onSuccess }: AddMemberModalProps) {
  const { 'org-slug': slug } = useParams()
  const { session } = useAuth()

  const [cpf, setCpf] = useState('')
  const [role, setRole] = useState<OrgMember['role']>('checkin_staff')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!memberToEdit

  // Sincroniza o estado quando o modal abre para edição
  useEffect(() => {
    if (memberToEdit) {
      setCpf(memberToEdit.cpf || '')
      setRole(memberToEdit.role)
    } else {
      setCpf('')
      setRole('checkin_staff')
    }
    setError(null) // Reseta mensagens de erro ao reabrir
  }, [memberToEdit, isOpen])

  const handleCpfMask = (v: string) => {
    v = v.replace(/\D/g, '')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    setCpf(v.slice(0, 14))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.access_token || !slug) return

    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        // Atualiza o cargo
        await teamService.updateRole(session.access_token, slug as string, memberToEdit.id, role)
      } else {
        // Adiciona novo membro - garantindo que enviamos só os números do CPF
        const cleanCpf = cpf.replace(/\D/g, '') 
        if (cleanCpf.length !== 11) {
          throw new Error("CPF inválido. Verifique os números.")
        }
        await teamService.addMember(session.access_token, slug as string, cleanCpf, role)
      }
      
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ocorreu um erro ao salvar. Verifique se o usuário já existe na plataforma.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Usando os roles do banco de dados (excluímos 'owner' pois só pode haver um e não é transferido por aqui)
  const roleOptions: { id: OrgMember['role']; label: string; icon: any; desc: string }[] = [
    { id: 'admin', label: 'Administrador', icon: ShieldCheck, desc: 'Acesso total ao painel e financeiro.' },
    { id: 'promoter', label: 'Promoter', icon: Megaphone, desc: 'Gestão de listas e convidados.' },
    { id: 'checkin_staff', label: 'Check-in', icon: QrCode, desc: 'Apenas leitura de ingressos na portaria.' }
  ]

  const displayName = memberToEdit?.full_name || 'este usuário'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h2 className="font-display font-extrabold text-3xl text-black">
              {isEditing ? 'Editar Membro' : 'Novo Membro'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isEditing ? `Alterando acesso de ${displayName}` : 'Convide alguém para sua equipe.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black shrink-0">
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Formulário com scroll interno se a tela for pequena */}
        <form id="member-form" onSubmit={handleSubmit} className="p-8 pt-4 space-y-6 overflow-y-auto">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">CPF do Usuário *</label>
            <input 
              type="text" 
              value={cpf}
              required
              disabled={isEditing || loading} 
              onChange={(e) => handleCpfMask(e.target.value)}
              placeholder="000.000.000-00" 
              className={`w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-black transition-all outline-none font-mono font-bold text-lg text-black placeholder:text-gray-300 ${
                isEditing || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            {!isEditing && (
              <p className="text-xs text-gray-400 mt-2 ml-1">
                O usuário já precisa ter uma conta criada na plataforma.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nível de Acesso *</label>
            <div className="grid grid-cols-1 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={loading}
                  onClick={() => setRole(option.id)}
                  className={`flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all ${
                    role === option.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    role === option.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <option.icon size={20} weight={role === option.id ? "fill" : "bold"} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-black">{option.label}</p>
                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{option.desc}</p>
                  </div>
                  {role === option.id && <Check size={18} weight="bold" className="text-black shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="p-8 bg-gray-50/50 flex flex-col gap-3 shrink-0 border-t border-gray-100">
          <button 
            type="submit"
            form="member-form"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-bold text-sm rounded-[100px] hover:bg-[#1BFF11] hover:text-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:bg-black disabled:hover:text-white"
          >
            {loading ? (
              <><CircleNotch size={20} weight="bold" className="animate-spin" /> Salvando...</>
            ) : isEditing ? (
              'Salvar Alterações'
            ) : (
              <><UserPlus size={20} weight="bold" /> Enviar Convite</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { teamService, type OrgMember } from '@/services/teamService' // Atualize o path se necessário
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgHeader } from '@/components/org/OrgHeader'
import { AddMemberModal } from '@/components/org/AddMemberModal'
import {
  UserPlus,
  PencilSimple,
  Trash,
  MagnifyingGlass,
  ShieldCheck,
  IdentificationBadge,
  QrCode,
  Crown
} from '@phosphor-icons/react'

function RoleBadge({ role }: { role: OrgMember['role'] }) {
  const configs = {
    owner:         { label: 'Proprietário', icon: Crown,               color: 'text-amber-600 bg-amber-50' },
    admin:         { label: 'Admin',        icon: ShieldCheck,         color: 'text-blue-600 bg-blue-50' },
    promoter:      { label: 'Promoter',     icon: IdentificationBadge, color: 'text-purple-600 bg-purple-50' },
    checkin_staff: { label: 'Check-in',     icon: QrCode,              color: 'text-orange-600 bg-orange-50' },
  }
  const { label, icon: Icon, color } = configs[role] || configs.checkin_staff

  return (
    <span className={`flex items-center gap-1.5 w-fit text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${color}`}>
      <Icon size={13} weight="fill" />
      {label}
    </span>
  )
}

// ── Card mobile por membro ───────────────────────────────────────────────────
function MemberCard({
  member,
  onEdit,
  onRemove,
}: {
  member: OrgMember
  onEdit: (m: OrgMember) => void
  onRemove: (id: string) => void
}) {
  const name = member.full_name || 'Usuário sem nome'
  const isOwner = member.role === 'owner'

  return (
    <div className="bg-white border border-[#E0E0D8] rounded-2xl p-4 space-y-3">
      {/* Topo: avatar + nome + status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#F0F0EB] border border-[#E0E0D8] flex items-center justify-center text-[#5C5C52] font-bold shrink-0 overflow-hidden">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#0A0A0A] truncate">{name}</p>
            <p className="text-[11px] text-[#9A9A8F] truncate">{member.email || 'Sem e-mail'}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 bg-green-50 text-green-600">
          ATIVO
        </span>
      </div>

      {/* CPF + cargo */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#9A9A8F] font-mono">{member.cpf || 'Sem CPF'}</p>
        <RoleBadge role={member.role} />
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#F0F0EB]">
        <button
          onClick={() => onEdit(member)}
          disabled={isOwner}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
            bg-[#F7F7F2] text-[#5C5C52] border border-[#E0E0D8]
            hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] disabled:opacity-50 transition-all"
        >
          <PencilSimple size={14} weight="bold" /> Editar
        </button>
        <button
          onClick={() => onRemove(member.id)}
          disabled={isOwner}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
            bg-[#F7F7F2] text-[#9A9A8F] border border-[#E0E0D8]
            hover:bg-red-50 hover:text-[#FF2D2D] hover:border-red-100 disabled:opacity-50 transition-all"
        >
          <Trash size={14} weight="bold" /> Remover
        </button>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const { 'org-slug': slug } = useParams()
  const { session } = useAuth()

  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<OrgMember | null>(null)
  const [search, setSearch] = useState('')

  const loadMembers = async () => {
    if (!session?.access_token || !slug) return
    try {
      setLoading(true)
      const data = await teamService.getMembers(session.access_token, slug as string)
      setMembers(data || [])
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [session?.access_token, slug])

  const handleOpenAdd = () => {
    setMemberToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (member: OrgMember) => {
    if (member.role === 'owner') return // Bloqueia edição do owner
    setMemberToEdit(member)
    setIsModalOpen(true)
  }

  const handleRemove = async (memberId: string) => {
    if (!session?.access_token || !slug) return
    if (!window.confirm('Tem certeza que deseja remover este membro da equipe?')) return

    try {
      await teamService.removeMember(session.access_token, slug as string, memberId)
      loadMembers() // Recarrega a lista
    } catch (error) {
      console.error('Erro ao remover membro:', error)
      alert('Erro ao remover membro. Verifique suas permissões.')
    }
  }

  const filtered = members.filter((m) => {
    const term = search.toLowerCase()
    return (
      (m.full_name?.toLowerCase().includes(term)) ||
      (m.cpf?.includes(term)) ||
      (m.email?.toLowerCase().includes(term))
    )
  })

  return (
    <div className="flex min-h-screen bg-[#F7F7F2]">
      <OrgSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <OrgHeader onMenuOpen={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-8 max-w-6xl mx-auto">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
            <div>
              <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[#0A0A0A] tracking-tight">
                Equipe
              </h1>
              <p className="text-[#9A9A8F] text-sm mt-1">
                Gerencie permissões e funções da organização.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#0A0A0A] text-white px-5 py-3 rounded-[100px]
                font-bold text-sm hover:bg-[#1BFF11] hover:text-[#0A0A0A] transition-all
                shadow-lg shadow-black/10 active:scale-95 self-start sm:self-auto"
            >
              <UserPlus size={18} weight="bold" /> Adicionar Membro
            </button>
          </div>

          {/* ── Busca ── */}
          <div className="relative mb-4">
            <MagnifyingGlass
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F]"
            />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#E0E0D8] rounded-2xl
                focus:border-[#0A0A0A] transition-all outline-none text-sm font-medium
                text-[#0A0A0A] placeholder:text-[#9A9A8F]"
            />
          </div>

          {/* ── Loading State ── */}
          {loading ? (
            <div className="text-center py-12 text-[#9A9A8F] text-sm font-bold animate-pulse">
              Carregando equipe...
            </div>
          ) : (
            <>
              {/* ── Mobile: cards ── */}
              <div className="flex flex-col gap-3 md:hidden">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-[#9A9A8F] text-sm font-medium">
                    Nenhum membro encontrado.
                  </div>
                ) : (
                  filtered.map((member) => (
                    <MemberCard 
                      key={member.id} 
                      member={member} 
                      onEdit={handleOpenEdit} 
                      onRemove={handleRemove}
                    />
                  ))
                )}
              </div>

              {/* ── Desktop: tabela ── */}
              <div className="hidden md:block bg-white border border-[#E0E0D8] rounded-[24px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F7F7F2] border-b border-[#E0E0D8]">
                      {['Membro', 'Cargo', 'Status', ''].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-[10px] font-bold text-[#9A9A8F] uppercase tracking-widest ${!h ? 'text-right' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0EB]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-[#9A9A8F] text-sm">
                          Nenhum membro encontrado.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((member) => {
                        const name = member.full_name || 'Usuário sem nome'
                        const isOwner = member.role === 'owner'

                        return (
                          <tr key={member.id} className="hover:bg-[#F7F7F2]/60 transition-colors group">
                            {/* Membro */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#F0F0EB] border border-[#E0E0D8] flex items-center justify-center text-[#5C5C52] font-bold shrink-0 overflow-hidden">
                                  {member.avatar_url ? (
                                    <img src={member.avatar_url} alt={name} className="w-full h-full object-cover" />
                                  ) : (
                                    name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-[#0A0A0A]">{name}</p>
                                  <p className="text-[11px] text-[#9A9A8F] font-mono">{member.cpf || member.email || 'Sem CPF/E-mail'}</p>
                                </div>
                              </div>
                            </td>
                            {/* Cargo */}
                            <td className="px-6 py-4">
                              <RoleBadge role={member.role} />
                            </td>
                            {/* Status */}
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-green-50 text-green-600">
                                ATIVO
                              </span>
                            </td>
                            {/* Ações */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEdit(member)}
                                  disabled={isOwner}
                                  className="p-2.5 bg-[#F7F7F2] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#F0F0EB]
                                    rounded-xl transition-all border border-transparent hover:border-[#E0E0D8] disabled:opacity-30 disabled:hover:border-transparent disabled:hover:bg-[#F7F7F2]"
                                  title="Editar permissões"
                                >
                                  <PencilSimple size={17} weight="bold" />
                                </button>
                                <button
                                  onClick={() => handleRemove(member.id)}
                                  disabled={isOwner}
                                  className="p-2.5 bg-[#F7F7F2] text-[#9A9A8F] hover:text-[#FF2D2D] hover:bg-red-50
                                    rounded-xl transition-all border border-transparent hover:border-red-100 disabled:opacity-30 disabled:hover:border-transparent disabled:hover:bg-[#F7F7F2]"
                                  title="Remover da equipe"
                                >
                                  <Trash size={17} weight="bold" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>

                {/* Rodapé da tabela */}
                <div className="px-6 py-3 bg-[#F7F7F2] border-t border-[#E0E0D8] flex items-center justify-between">
                  <p className="text-[11px] text-[#9A9A8F] font-medium">
                    {filtered.length} membro{filtered.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Contador mobile */}
              <p className="md:hidden text-[11px] text-[#9A9A8F] font-medium mt-3 text-center">
                {filtered.length} membro{filtered.length !== 1 ? 's' : ''} na equipe
              </p>
            </>
          )}
        </main>
      </div>

      {/* Importante: Lembre-se de passar a função loadMembers para o modal, 
          para que ele atualize a lista assim que salvar! */}
      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberToEdit={memberToEdit}
        onSuccess={loadMembers} 
      />
    </div>
  )
}
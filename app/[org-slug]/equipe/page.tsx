'use client'
import { useState } from 'react'
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

const MOCK_TEAM: Member[] = [
  { id: '1', name: 'João Silva (Você)', email: 'joao@gmail.com', cpf: '123.456.789-00', role: 'ADMIN', status: 'ACTIVE' },
  { id: '2', name: 'Bia Oliveira', email: 'bia.promoter@gmail.com', cpf: '456.789.012-11', role: 'PROMOTER', status: 'ACTIVE' },
  { id: '3', name: 'Lucas Souza', email: 'lucas.staff@hotmail.com', cpf: '789.012.345-22', role: 'CHECKIN', status: 'PENDING' },
]

function RoleBadge({ role }: { role: Role }) {
  const configs = {
    ADMIN:    { label: 'Admin',    icon: ShieldCheck,        color: 'text-blue-600 bg-blue-50'     },
    PROMOTER: { label: 'Promoter', icon: IdentificationBadge, color: 'text-purple-600 bg-purple-50' },
    CHECKIN:  { label: 'Check-in', icon: QrCode,             color: 'text-orange-600 bg-orange-50' },
  }
  const { label, icon: Icon, color } = configs[role]
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
}: {
  member: Member
  onEdit: (m: Member) => void
}) {
  return (
    <div className="bg-white border border-[#E0E0D8] rounded-2xl p-4 space-y-3">
      {/* Topo: avatar + nome + status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#F0F0EB] border border-[#E0E0D8] flex items-center justify-center text-[#5C5C52] font-bold shrink-0">
            {member.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#0A0A0A] truncate">{member.name}</p>
            <p className="text-[11px] text-[#9A9A8F] truncate">{member.email}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 ${
            member.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
          }`}
        >
          {member.status === 'ACTIVE' ? 'ATIVO' : 'PENDENTE'}
        </span>
      </div>

      {/* CPF + cargo */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#9A9A8F] font-mono">{member.cpf}</p>
        <RoleBadge role={member.role} />
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#F0F0EB]">
        <button
          onClick={() => onEdit(member)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
            bg-[#F7F7F2] text-[#5C5C52] border border-[#E0E0D8]
            hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-all"
        >
          <PencilSimple size={14} weight="bold" /> Editar
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
            bg-[#F7F7F2] text-[#9A9A8F] border border-[#E0E0D8]
            hover:bg-red-50 hover:text-[#FF2D2D] hover:border-red-100 transition-all"
        >
          <Trash size={14} weight="bold" /> Remover
        </button>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null)
  const [search, setSearch] = useState('')

  const handleOpenAdd = () => {
    setMemberToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (member: Member) => {
    setMemberToEdit(member)
    setIsModalOpen(true)
  }

  const filtered = MOCK_TEAM.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.cpf.includes(search)
  )

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
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#E0E0D8] rounded-2xl
                focus:border-[#0A0A0A] transition-all outline-none text-sm font-medium
                text-[#0A0A0A] placeholder:text-[#9A9A8F]"
            />
          </div>

          {/* ── Mobile: cards ── */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-[#9A9A8F] text-sm font-medium">
                Nenhum membro encontrado.
              </div>
            ) : (
              filtered.map((member) => (
                <MemberCard key={member.id} member={member} onEdit={handleOpenEdit} />
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
                  filtered.map((member) => (
                    <tr key={member.id} className="hover:bg-[#F7F7F2]/60 transition-colors group">
                      {/* Membro */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#F0F0EB] border border-[#E0E0D8] flex items-center justify-center text-[#5C5C52] font-bold shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0A0A0A]">{member.name}</p>
                            <p className="text-[11px] text-[#9A9A8F] font-mono">{member.cpf}</p>
                          </div>
                        </div>
                      </td>
                      {/* Cargo */}
                      <td className="px-6 py-4">
                        <RoleBadge role={member.role} />
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                            member.status === 'ACTIVE'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-orange-50 text-orange-600'
                          }`}
                        >
                          {member.status === 'ACTIVE' ? 'ATIVO' : 'PENDENTE'}
                        </span>
                      </td>
                      {/* Ações */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-2.5 bg-[#F7F7F2] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#F0F0EB]
                              rounded-xl transition-all border border-transparent hover:border-[#E0E0D8]"
                            title="Editar permissões"
                          >
                            <PencilSimple size={17} weight="bold" />
                          </button>
                          <button
                            className="p-2.5 bg-[#F7F7F2] text-[#9A9A8F] hover:text-[#FF2D2D] hover:bg-red-50
                              rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Remover da equipe"
                          >
                            <Trash size={17} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
        </main>
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberToEdit={memberToEdit}
      />
    </div>
  )
}
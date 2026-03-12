'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { bankService, type BankAccount } from '@/services/bankService'
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgHeader } from '@/components/org/OrgHeader'
import { BankAccountModal } from '@/components/org/BankAccountModal'
import {
  Plus,
  Star,
  Trash,
  CurrencyDollar,
  Key,
  Buildings,
  MagnifyingGlass,
  CircleNotch,
  Warning,
} from '@phosphor-icons/react'

// ── Helpers ───────────────────────────────────────────────────────────────────
const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  checking: 'Conta Corrente',
  savings:  'Poupança',
}
const PIX_KEY_TYPE_LABEL: Record<string, string> = {
  cpf:    'CPF',
  cnpj:   'CNPJ',
  email:  'E-mail',
  phone:  'Telefone',
  random: 'Chave Aleatória',
}

function maskDocument(doc: string) {
  const d = doc.replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return doc
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message:   string
  onConfirm: () => void
  onCancel:  () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] border border-[#E0E0D8] shadow-xl p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Warning size={20} weight="fill" className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-[#0A0A0A]">{message}</p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#E0E0D8] text-sm font-bold text-[#5C5C52] hover:bg-[#F0F0EB] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Account Card (mobile) ─────────────────────────────────────────────────────
function AccountCard({
  account,
  onSetDefault,
  onDelete,
}: {
  account:      BankAccount
  onSetDefault: (id: string) => void
  onDelete:     (id: string) => void
}) {
  const hasBankData = account.bank_name || account.account_number
  const hasPixData  = account.pix_key

  return (
    <div className={`bg-white border rounded-2xl p-4 space-y-3 ${account.is_default ? 'border-[#0A0A0A]' : 'border-[#E0E0D8]'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#F0F0EB] flex items-center justify-center shrink-0">
            {hasPixData && !hasBankData
              ? <Key size={18} weight="bold" className="text-[#5C5C52]" />
              : <Buildings size={18} weight="bold" className="text-[#5C5C52]" />
            }
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#0A0A0A] truncate">{account.holder_name}</p>
            <p className="text-[11px] text-[#9A9A8F] font-mono">{maskDocument(account.holder_document)}</p>
          </div>
        </div>
        {account.is_default && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#0A0A0A] text-[#F7F7F2] shrink-0">
            PADRÃO
          </span>
        )}
      </div>

      {hasBankData && (
        <div className="bg-[#F7F7F2] rounded-xl p-3 text-[11px] text-[#5C5C52] space-y-1 font-mono">
          {account.bank_name && <p>{account.bank_code} · {account.bank_name}</p>}
          {account.account_number && (
            <p>
              Ag {account.agency}{account.agency_digit ? `-${account.agency_digit}` : ''} ·{' '}
              CC {account.account_number}{account.account_digit ? `-${account.account_digit}` : ''}
            </p>
          )}
          {account.account_type && (
            <p className="font-sans font-semibold text-[#9A9A8F]">{ACCOUNT_TYPE_LABEL[account.account_type]}</p>
          )}
        </div>
      )}

      {hasPixData && (
        <div className="bg-[#F0FFF0] rounded-xl p-3 text-[11px] text-[#1a7a1a] space-y-0.5">
          <p className="font-bold uppercase tracking-wide text-[10px]">
            Pix · {account.pix_key_type ? PIX_KEY_TYPE_LABEL[account.pix_key_type] : ''}
          </p>
          <p className="font-mono break-all">{account.pix_key}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-[#F0F0EB]">
        {!account.is_default && (
          <button
            onClick={() => onSetDefault(account.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
              bg-[#F7F7F2] text-[#5C5C52] border border-[#E0E0D8]
              hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-all"
          >
            <Star size={14} weight="bold" /> Definir padrão
          </button>
        )}
        <button
          onClick={() => onDelete(account.id)}
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FinanceiroPage() {
  const { 'org-slug': slug } = useParams()
  const { session } = useAuth()

  const [accounts, setAccounts]           = useState<BankAccount[]>([])
  const [loading, setLoading]             = useState(true)
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [modalOpen, setModalOpen]         = useState(false)
  const [search, setSearch]               = useState('')
  const [confirmId, setConfirmId]         = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadAccounts = async () => {
    if (!session?.access_token || !slug) return
    try {
      setLoading(true)
      const data = await bankService.getAccounts(session.access_token, slug as string)
      setAccounts(data || [])
    } catch (err) {
      console.error('Erro ao carregar contas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAccounts() }, [session?.access_token, slug])

  const handleSetDefault = async (id: string) => {
    if (!session?.access_token || !slug) return
    setActionLoading(id)
    try {
      await bankService.setDefault(session.access_token, slug as string, id)
      await loadAccounts()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmId || !session?.access_token || !slug) return
    setActionLoading(confirmId)
    try {
      await bankService.deleteAccount(session.access_token, slug as string, confirmId)
      await loadAccounts()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
      setConfirmId(null)
    }
  }

  const filtered = accounts.filter((a) => {
    const term = search.toLowerCase()
    return (
      a.holder_name.toLowerCase().includes(term) ||
      a.holder_document.includes(term) ||
      a.bank_name?.toLowerCase().includes(term) ||
      a.pix_key?.toLowerCase().includes(term)
    )
  })

  const defaultAccount = accounts.find((a) => a.is_default)

  return (
    <div className="flex min-h-screen bg-[#F7F7F2]">
      <OrgSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <OrgHeader onMenuOpen={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-8 max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
            <div>
              <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[#0A0A0A] tracking-tight">
                Financeiro
              </h1>
              <p className="text-[#9A9A8F] text-sm mt-1">
                Gerencie suas contas bancárias e chaves Pix.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#0A0A0A] text-white px-5 py-3 rounded-[100px]
                font-bold text-sm hover:bg-[#1BFF11] hover:text-[#0A0A0A] transition-all
                shadow-lg shadow-black/10 active:scale-95 self-start sm:self-auto"
            >
              <Plus size={18} weight="bold" /> Adicionar Conta
            </button>
          </div>

          {/* Conta padrão */}
          {!loading && defaultAccount && (
            <div className="mb-6 bg-[#0A0A0A] rounded-[20px] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-white/10 flex items-center justify-center shrink-0">
                  <Star size={22} weight="fill" className="text-[#1BFF11]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5">Conta Padrão</p>
                  <p className="font-extrabold text-base tracking-tight">{defaultAccount.holder_name}</p>
                  <p className="text-[11px] text-white/50 font-mono mt-0.5">
                    {maskDocument(defaultAccount.holder_document)}
                    {defaultAccount.bank_name ? ` · ${defaultAccount.bank_name}` : ''}
                    {defaultAccount.pix_key   ? ` · Pix` : ''}
                  </p>
                </div>
              </div>
              <CurrencyDollar size={40} weight="thin" className="text-white/10 hidden sm:block" />
            </div>
          )}

          {/* Busca */}
          <div className="relative mb-4">
            <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F]" />
            <input
              type="text"
              placeholder="Buscar por titular, banco ou chave Pix..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#E0E0D8] rounded-2xl
                focus:border-[#0A0A0A] transition-all outline-none text-sm font-medium
                text-[#0A0A0A] placeholder:text-[#9A9A8F]"
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-12 text-[#9A9A8F] text-sm font-bold animate-pulse">
              Carregando contas...
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="flex flex-col gap-3 md:hidden">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-[#9A9A8F] text-sm font-medium">Nenhuma conta encontrada.</div>
                ) : (
                  filtered.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onSetDefault={handleSetDefault}
                      onDelete={(id) => setConfirmId(id)}
                    />
                  ))
                )}
              </div>

              {/* Desktop */}
              <div className="hidden md:block bg-white border border-[#E0E0D8] rounded-[24px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F7F7F2] border-b border-[#E0E0D8]">
                      {['Titular', 'Banco / Conta', 'Pix', 'Status', ''].map((h) => (
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
                        <td colSpan={5} className="text-center py-12 text-[#9A9A8F] text-sm">
                          Nenhuma conta encontrada.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((account) => (
                        <tr key={account.id} className="hover:bg-[#F7F7F2]/60 transition-colors">
                          {/* Titular */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#F0F0EB] flex items-center justify-center shrink-0">
                                {account.pix_key && !account.bank_name
                                  ? <Key size={16} weight="bold" className="text-[#5C5C52]" />
                                  : <Buildings size={16} weight="bold" className="text-[#5C5C52]" />
                                }
                              </div>
                              <div>
                                <p className="font-bold text-sm text-[#0A0A0A]">{account.holder_name}</p>
                                <p className="text-[11px] text-[#9A9A8F] font-mono">{maskDocument(account.holder_document)}</p>
                              </div>
                            </div>
                          </td>

                          {/* Banco / Conta */}
                          <td className="px-6 py-4">
                            {account.bank_name || account.account_number ? (
                              <div className="text-[11px] text-[#5C5C52] font-mono space-y-0.5">
                                {account.bank_name && (
                                  <p className="font-sans font-semibold text-[#0A0A0A] text-xs">{account.bank_name}</p>
                                )}
                                {account.account_number && (
                                  <p>
                                    Ag {account.agency}{account.agency_digit ? `-${account.agency_digit}` : ''} ·{' '}
                                    CC {account.account_number}{account.account_digit ? `-${account.account_digit}` : ''}
                                  </p>
                                )}
                                {account.account_type && (
                                  <p className="text-[#9A9A8F]">{ACCOUNT_TYPE_LABEL[account.account_type]}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#D0D0C8] text-xs">—</span>
                            )}
                          </td>

                          {/* Pix */}
                          <td className="px-6 py-4">
                            {account.pix_key ? (
                              <div className="text-[11px] space-y-0.5">
                                <p className="font-bold text-[10px] text-[#1a7a1a] uppercase tracking-wide">
                                  {account.pix_key_type ? PIX_KEY_TYPE_LABEL[account.pix_key_type] : 'Pix'}
                                </p>
                                <p className="font-mono text-[#5C5C52] max-w-[160px] truncate">{account.pix_key}</p>
                              </div>
                            ) : (
                              <span className="text-[#D0D0C8] text-xs">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {account.is_default ? (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#0A0A0A] text-white">PADRÃO</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#F0F0EB] text-[#9A9A8F]">ATIVO</span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!account.is_default && (
                                <button
                                  onClick={() => handleSetDefault(account.id)}
                                  disabled={actionLoading === account.id}
                                  className="p-2.5 bg-[#F7F7F2] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#F0F0EB]
                                    rounded-xl transition-all border border-transparent hover:border-[#E0E0D8] disabled:opacity-30"
                                  title="Definir como padrão"
                                >
                                  {actionLoading === account.id
                                    ? <CircleNotch size={17} className="animate-spin" />
                                    : <Star size={17} weight="bold" />
                                  }
                                </button>
                              )}
                              <button
                                onClick={() => setConfirmId(account.id)}
                                disabled={actionLoading === account.id}
                                className="p-2.5 bg-[#F7F7F2] text-[#9A9A8F] hover:text-[#FF2D2D] hover:bg-red-50
                                  rounded-xl transition-all border border-transparent hover:border-red-100 disabled:opacity-30"
                                title="Remover conta"
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
                <div className="px-6 py-3 bg-[#F7F7F2] border-t border-[#E0E0D8]">
                  <p className="text-[11px] text-[#9A9A8F] font-medium">
                    {filtered.length} conta{filtered.length !== 1 ? 's' : ''} cadastrada{filtered.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <p className="md:hidden text-[11px] text-[#9A9A8F] font-medium mt-3 text-center">
                {filtered.length} conta{filtered.length !== 1 ? 's' : ''} cadastrada{filtered.length !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </main>
      </div>

      {modalOpen && (
        <BankAccountModal
          onClose={() => setModalOpen(false)}
          onSuccess={loadAccounts}
          token={session?.access_token ?? ''}
          slug={slug as string}
        />
      )}

      {confirmId && (
        <ConfirmModal
          message="Tem certeza que deseja remover esta conta bancária?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}
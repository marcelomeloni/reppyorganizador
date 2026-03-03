'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus, Buildings, ArrowRight, IdentificationCard,
  Copy, CheckCircle, SignOut, User, CircleNotch
} from '@phosphor-icons/react'
import { useAuth } from '@/context/AuthContext'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { dashboardService, type DashboardResponse } from '@/services/dashboardService'

const ROLE_LABEL: Record<string, string> = {
  owner:         'Proprietário',
  admin:         'Admin',
  promoter:      'Promoter',
  checkin_staff: 'Staff',
}

export default function DashboardPage() {
  const { loading: authLoading } = useRequireAuth()
  const { session, signOut } = useAuth()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Espera auth resolver antes de fazer qualquer coisa
    if (authLoading) return
    if (!session?.access_token) return

    setDataLoading(true)
    dashboardService.get(session.access_token)
      .then(setData)
      .finally(() => setDataLoading(false))
  }, [authLoading, session?.access_token])

  const copyToClipboard = () => {
    if (!data?.user.cpf) return
    navigator.clipboard.writeText(data.user.cpf)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <CircleNotch size={32} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white font-display">
      <main className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-12 flex justify-between items-center">
          <Link href="/">
            <img src="/logo_preto.png" alt="Reppy" className="h-7 w-auto" />
          </Link>
          <button
            onClick={signOut}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-red-300 transition-all text-gray-600 hover:text-red-500 shadow-sm"
          >
            <SignOut size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* ── ORGANIZAÇÕES ── */}
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bricolage font-extrabold text-2xl text-black">Minhas Organizações</h2>
              <Link
                href="/onboarding"
                className="flex items-center gap-2 text-sm font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-primary hover:text-black transition-all"
              >
                <Plus size={18} weight="bold" /> Criar nova
              </Link>
            </div>

            <div className="space-y-3">
              {data?.orgs.length === 0 && (
                <div className="p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-sm">
                  Nenhuma organização ainda.
                </div>
              )}
              {data?.orgs.map((org) => (
                <Link
                  key={org.slug}
                  href={`/${org.slug}`}
                  className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl hover:border-primary transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors overflow-hidden">
                      {org.logo_url
                        ? <img src={org.logo_url} className="w-full h-full object-cover" alt={org.name} />
                        : <Buildings size={24} weight="fill" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-black group-hover:text-primary-dark transition-colors">{org.name}</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {ROLE_LABEL[org.role] ?? org.role} • {org.events_count} evento{org.events_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={20} weight="bold" className="text-gray-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── PERFIL ── */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden">
                  {data?.user.avatar_url
                    ? <img src={data.user.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <User size={24} weight="bold" />}
                </div>
                <div>
                  <h4 className="font-bold text-black leading-tight">{data?.user.full_name ?? 'Usuário'}</h4>
                  <p className="text-xs text-gray-500">membro desde {data?.user.member_since}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                {data?.user.cpf ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Seu CPF para eventos</span>
                    <button
                      onClick={copyToClipboard}
                      className={`mt-2 flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        copied
                          ? 'bg-primary/10 border-primary text-primary-dark'
                          : 'bg-gray-50 border-gray-100 text-black hover:border-gray-300'
                      }`}
                    >
                      <span className="font-mono font-bold">{data.user.cpf}</span>
                      {copied ? <CheckCircle size={18} weight="fill" /> : <Copy size={18} />}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">CPF não cadastrado.</p>
                )}

                <div className="p-4 bg-gray-50 rounded-xl flex gap-3">
                  <IdentificationCard size={20} weight="fill" className="text-gray-400 shrink-0" />
                  <p className="text-[11px] text-gray-500 leading-tight">
                    Forneça este CPF para organizadores te adicionarem como staff.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-2">
              <p className="text-[11px] text-gray-400 font-medium">
                Precisa de ajuda?{' '}
                <Link href="#" className="underline hover:text-black">Acesse o suporte</Link>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
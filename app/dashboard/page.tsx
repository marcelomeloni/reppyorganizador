'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Buildings, 
  ArrowRight, 
  IdentificationCard, 
  Copy, 
  CheckCircle,
  SignOut,
  Gear,
  User
} from '@phosphor-icons/react'

const MOCK_ORGS = [
  {
    name: "República Valhalla",
    slug: "valhalla",
    role: "Proprietário",
    eventsCount: 3,
    image: null,
  },
  {
    name: "Atlética Imperial",
    slug: "imperial",
    role: "Admin",
    eventsCount: 1,
    image: null,
  }
]

export default function DashboardPage() {
  const [userCpf] = useState("123.456.789-00")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userCpf)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-off-white font-display">
      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* ── LOGO APENAS ── */}
        <div className="mb-12 flex justify-between items-center">
          <Link href="/" className="font-bricolage font-extrabold text-3xl text-black tracking-tighter">
            reppy<span className="text-primary">.</span>
          </Link>
          
          {/* Botões de ação rápida fora da navbar */}
          <div className="flex gap-2">
             <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-black transition-all text-gray-600 hover:text-black shadow-sm">
                <Gear size={20} />
             </button>
             <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-red transition-all text-gray-600 hover:text-red shadow-sm">
                <SignOut size={20} />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* ── COLUNA PRINCIPAL: ORGANIZAÇÕES ── */}
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bricolage font-extrabold text-2xl text-black">Minhas Organizações</h2>
              <Link 
                href="/onboarding" 
                className="group flex items-center gap-2 text-sm font-bold bg-black text-white px-5 py-2.5 rounded-pill hover:bg-primary hover:text-black transition-all"
              >
                <Plus size={18} weight="bold" /> Criar nova
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_ORGS.map((org) => (
                <Link 
                  key={org.slug} 
                  href={`/${org.slug}`}
                  className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-card-md hover:border-primary transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors">
                      <Buildings size={24} weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black group-hover:text-primary-dark transition-colors">{org.name}</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{org.role} • {org.eventsCount} eventos</p>
                    </div>
                  </div>
                  <ArrowRight size={20} weight="bold" className="text-gray-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── COLUNA LATERAL: PERFIL & ACESSO ── */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Card de Usuário Minimalista */}
            <div className="bg-white border border-gray-200 rounded-card-lg p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User size={24} weight="bold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black leading-tight">João Silva</h4>
                    <p className="text-xs text-gray-500">membro desde 2024</p>
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Seu CPF para eventos</span>
                    <button 
                      onClick={copyToClipboard}
                      className={`mt-2 flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${copied ? 'bg-primary/10 border-primary text-primary-dark' : 'bg-gray-50 border-gray-100 text-black hover:border-gray-300'}`}
                    >
                      <span className="font-mono font-bold">{userCpf}</span>
                      {copied ? <CheckCircle size={18} weight="fill" /> : <Copy size={18} />}
                    </button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl flex gap-3">
                    <IdentificationCard size={20} weight="fill" className="text-gray-400 shrink-0" />
                    <p className="text-[11px] text-gray-500 leading-tight">
                      Forneça este CPF para organizadores te adicionarem como staff.
                    </p>
                  </div>
               </div>
            </div>

            {/* Link para ajuda ou docs se precisar */}
            <div className="px-2">
               <p className="text-[11px] text-gray-400 font-medium">
                 Precisa de ajuda? <Link href="#" className="underline hover:text-black">Acesse o suporte</Link>
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
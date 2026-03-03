'use client'

import { useAuth } from '@/context/AuthContext'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const { signInWithGoogle, user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && user) router.push('/auth-callback')
  }, [user, loading])

  const handleLogin = async () => {
    await signInWithGoogle()
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative flex flex-col items-center gap-10 px-8 w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <span
            className="text-6xl font-black tracking-tighter text-white select-none"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '-0.02em' }}
          >
            REPPY
          </span>
          <span className="text-xs text-zinc-500 tracking-[0.3em] uppercase">
            Gestão de eventos
          </span>
        </div>

        {/* Card */}
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-xl font-semibold">Entrar na plataforma</h1>
            <p className="text-zinc-500 text-sm">Use sua conta Google para continuar</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full bg-white hover:bg-zinc-100 active:scale-[0.98] transition-all text-zinc-900 font-medium text-sm rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <GoogleIcon />
            Continuar com Google
          </button>

          <p className="text-zinc-600 text-xs text-center leading-relaxed">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors">
              Termos de uso
            </a>
            {' '}e{' '}
            <a href="#" className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors">
              Política de privacidade
            </a>.
          </p>
        </div>

        <p className="text-zinc-700 text-xs text-center">
          © {new Date().getFullYear()} Reppy. Todos os direitos reservados.
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <>
      <title>Entrar — Reppy</title>
      <meta name="description" content="Acesse a plataforma Reppy e gerencie seus eventos, ingressos e equipe em um só lugar." />
      <meta name="robots" content="noindex, nofollow" />

      {/* Open Graph */}
      <meta property="og:title" content="Entrar — Reppy" />
      <meta property="og:description" content="Plataforma de gestão de eventos para repúblicas, atléticas e produtoras universitárias." />
      <meta property="og:type" content="website" />

      <Suspense>
        <LoginContent />
      </Suspense>
    </>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.292C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
'use client'

import { useAuth } from '@/context/AuthContext'
import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// ---------------------------------------------------------------------------
// Theme toggle icon
// ---------------------------------------------------------------------------
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.292C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main login content
// ---------------------------------------------------------------------------
function LoginContent() {
  const { signInWithGoogle, user, loading } = useAuth()
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    if (!loading && user) router.push('/auth-callback')
  }, [user, loading, router])

  const toggleTheme = () => setIsDark((prev) => !prev)

  const theme = {
    bg: isDark ? '#0A0A0A' : '#F7F7F2',
    cardBg: isDark ? '#111111' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
    text: isDark ? '#FFFFFF' : '#0A0A0A',
    textMuted: isDark ? '#5C5C52' : '#9A9A8F',
    textSubtle: isDark ? '#3a3a32' : '#C8C8BF',
    divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    toggleBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    toggleColor: isDark ? '#9A9A8F' : '#5C5C52',
    gridColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
    greenGlow: isDark ? '0 0 80px rgba(27,255,17,0.08)' : 'none',
    cardShadow: isDark
      ? '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
      : '0 24px 64px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
  }

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: ${theme.bg};
          transition: background-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        /* Subtle dot-grid texture */
        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle, ${theme.gridColor} 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.35;
          pointer-events: none;
        }

        /* Green ambient glow — dark mode only */
        .login-root::after {
          content: '';
          position: absolute;
          bottom: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(27,255,17,0.07) 0%, transparent 70%);
          pointer-events: none;
          opacity: ${isDark ? 1 : 0};
          transition: opacity 0.4s ease;
        }

        .login-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          width: 100%;
          max-width: 400px;
          padding: 24px 20px;
        }

        /* ── Theme toggle ── */
        .theme-toggle {
          align-self: flex-end;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 100px;
          background: ${theme.toggleBg};
          border: none;
          cursor: pointer;
          color: ${theme.toggleColor};
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: all 0.2s ease;
        }
        .theme-toggle:hover { opacity: 0.7; }

        /* ── Logo area ── */
        .logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .logo-img {
          height: 40px;
          width: auto;
          object-fit: contain;
          transition: opacity 0.3s ease;
        }

        .logo-tagline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${theme.textMuted};
          transition: color 0.3s ease;
        }

        /* ── Card ── */
        .login-card {
          width: 100%;
          background: ${theme.cardBg};
          border: 1px solid ${theme.cardBorder};
          border-radius: 28px;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          box-shadow: ${theme.cardShadow};
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .card-header { display: flex; flex-direction: column; gap: 6px; }

        .card-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: ${theme.text};
          line-height: 1;
          transition: color 0.3s ease;
        }

        .card-title span {
          color: #1BFF11;
        }

        .card-subtitle {
          font-size: 14px;
          font-weight: 400;
          color: ${theme.textMuted};
          line-height: 1.5;
          transition: color 0.3s ease;
        }

        /* ── Google CTA ── */
        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: #1BFF11;
          color: #0A0A0A;
          border: none;
          border-radius: 100px;
          padding: 14px 24px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 0 0 0 rgba(27,255,17,0);
        }

        .btn-google:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(27,255,17,0.25);
        }

        .btn-google:active:not(:disabled) {
          transform: scale(0.98);
        }

        .btn-google:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* ── Divider ── */
        .card-divider {
          height: 1px;
          background: ${theme.divider};
          transition: background 0.3s ease;
        }

        /* ── Legal copy ── */
        .legal {
          font-size: 12px;
          font-weight: 400;
          color: ${theme.textMuted};
          text-align: center;
          line-height: 1.7;
          transition: color 0.3s ease;
        }

        .legal a {
          color: ${isDark ? '#9A9A8F' : '#5C5C52'};
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s ease;
        }

        .legal a:hover { color: ${theme.text}; }

        /* ── Footer ── */
        .login-footer {
          font-size: 12px;
          color: ${theme.textSubtle};
          text-align: center;
          transition: color 0.3s ease;
        }

        /* ── Green dot accent ── */
        .green-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #1BFF11;
          border-radius: 100px;
          margin-right: 6px;
          vertical-align: middle;
          position: relative;
          top: -1px;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }
        .green-dot { animation: pulse-dot 2.4s ease-in-out infinite; }
      `}</style>

      <main className="login-root">
        <div className="login-wrap">

          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
            {isDark ? 'Modo claro' : 'Modo escuro'}
          </button>

          {/* Logo */}
          <div className="logo-area">
            <Image
              src={isDark ? '/logo_branca.png' : '/logo_preto.png'}
              alt="Reppy"
              width={120}
              height={40}
              className="logo-img"
              priority
            />
            <span className="logo-tagline">Gestão de eventos</span>
          </div>

          {/* Login card */}
          <div className="login-card">
            <div className="card-header">
              <h1 className="card-title">
                Bora <span>entrar</span>.
              </h1>
              <p className="card-subtitle">
                Sua conta Google é tudo que você precisa.
              </p>
            </div>

            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="btn-google"
              aria-label="Continuar com Google"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <div className="card-divider" />

            <p className="legal">
              Ao entrar, você concorda com os{' '}
              <a href="#">Termos de uso</a> e a{' '}
              <a href="#">Política de privacidade</a> da Reppy.
            </p>
          </div>

          {/* Footer */}
          <p className="login-footer">
            <span className="green-dot" aria-hidden="true" />
            © {new Date().getFullYear()} Reppy. Todos os direitos reservados.
          </p>

        </div>
      </main>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page export with metadata
// ---------------------------------------------------------------------------
export default function LoginPage() {
  return (
    <>
      <title>Entrar — Reppy</title>
      <meta
        name="description"
        content="Acesse a plataforma Reppy e gerencie seus eventos, ingressos e equipe em um só lugar."
      />
      <meta name="robots" content="noindex, nofollow" />

      <meta property="og:title" content="Entrar — Reppy" />
      <meta
        property="og:description"
        content="Plataforma de gestão de eventos para repúblicas, atléticas e produtoras universitárias."
      />
      <meta property="og:type" content="website" />

      <Suspense>
        <LoginContent />
      </Suspense>
    </>
  )
}
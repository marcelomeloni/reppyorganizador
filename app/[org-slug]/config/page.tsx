'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { orgService } from '@/services/orgService'
import { ApiError } from '@/services/apiService'
import { OrgSidebar } from '@/components/org/OrgSidebar'
import { OrgHeader } from '@/components/org/OrgHeader'
import { useOrganization } from '@/context/OrganizationContext'
import { DeleteOrgModal } from '@/components/org/DeleteOrgModal'
import {
  Camera, Trash, InstagramLogo, WhatsappLogo, Globe,
  Envelope, FloppyDiskBack, Warning, Image as ImageIcon,
  House, Trophy, Lightning, Martini, MusicNote, Buildings, Check,
  CircleNotch,
} from '@phosphor-icons/react'

const CATEGORIES = [
  { value: 'Republica', label: 'República',  Icon: House     },
  { value: 'Atletica',  label: 'Atlética',   Icon: Trophy    },
  { value: 'Produtora', label: 'Produtora',  Icon: Lightning },
  { value: 'Bar',       label: 'Bar',        Icon: Martini   },
  { value: 'Balada',    label: 'Balada',     Icon: MusicNote },
  { value: 'Empresa',   label: 'Empresa',    Icon: Buildings },
]

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
        {icon}{label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white transition-all outline-none font-medium text-sm text-black placeholder:text-gray-300'

type ImageUploadState = {
  previewUrl: string | null
  isUploading: boolean
  error: string | null
}

const initialImageState: ImageUploadState = {
  previewUrl: null,
  isUploading: false,
  error: null,
}

export default function ConfigPage() {
  const { 'org-slug': slug } = useParams()
  const router = useRouter()
  const { session } = useAuth()

  const [isLoading, setIsLoading]               = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [saved, setSaved]                        = useState(false)
  const [sidebarOpen, setSidebarOpen]            = useState(false)
  const [error, setError]                        = useState<string | null>(null)

  const [logo, setLogo]     = useState<ImageUploadState>(initialImageState)
  const [banner, setBanner] = useState<ImageUploadState>(initialImageState)

  const [formData, setFormData] = useState({
    name:        '',
    slug:        '',
    description: '',
    email:       '',
    phone:       '',
    instagram:   '',
    website:     '',
    category:    'Republica',
  })

  const { currentOrg, loading: orgLoading } = useOrganization()

  useEffect(() => {
    if (!session?.access_token || !currentOrg?.slug) return

    orgService.get(session.access_token, currentOrg.slug).then((org) => {
      setFormData({
        name:        org.name        ?? '',
        slug:        org.slug        ?? '',
        description: org.description ?? '',
        email:       org.email       ?? '',
        phone:       org.phone       ?? '',
        instagram:   org.instagram   ?? '',
        website:     org.website     ?? '',
        category:    'Republica',
      })
      if (org.logo_url)   setLogo(prev   => ({ ...prev, previewUrl: org.logo_url }))
      if (org.banner_url) setBanner(prev => ({ ...prev, previewUrl: org.banner_url }))
    })
  }, [session?.access_token, currentOrg?.slug])

  const handlePhoneMask = (v: string) => {
    v = v.replace(/\D/g, '')
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d{5})(\d)/, '$1-$2')
    return v.slice(0, 15)
  }

  async function handleImageUpload(
    file: File,
    type: 'logo' | 'banner',
  ) {
    if (!session?.access_token) return

    const setState = type === 'logo' ? setLogo : setBanner
    const previewUrl = URL.createObjectURL(file)

    setState({ previewUrl, isUploading: true, error: null })

    try {
      const uploadFn = type === 'logo' ? orgService.uploadLogo : orgService.uploadBanner
      const url = await uploadFn(session.access_token, slug as string, file)
      setState({ previewUrl: url, isUploading: false, error: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : `Erro ao fazer upload do ${type}`
      setState({ previewUrl, isUploading: false, error: message })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.access_token) return

    setIsLoading(true)
    setError(null)

    try {
      await orgService.update(session.access_token, slug as string, {
        name:        formData.name,
        description: formData.description,
        email:       formData.email,
        phone:       formData.phone,
        instagram:   formData.instagram,
        website:     formData.website,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async (confirmName: string): Promise<void> => {
    if (!session?.access_token) return
    await orgService.deleteOrg(session.access_token, slug as string, confirmName)
    router.push('/dashboard')
  }

  const isImageUploading = logo.isUploading || banner.isUploading

  return (
    <div className="flex min-h-screen bg-[#F7F7F2] font-body">
      <OrgSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <OrgHeader onMenuOpen={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 md:p-10 max-w-3xl mx-auto">

          <div className="mb-8 md:mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display font-extrabold text-2xl md:text-[28px] tracking-tight text-[#0A0A0A] leading-none">
                Configurações
              </h1>
              <p className="text-[#9A9A8F] text-sm mt-1.5">
                Gerencie a identidade da sua organização.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading || isImageUploading}
              className={`
                self-start sm:self-auto flex items-center gap-2 px-5 md:px-6 py-3
                rounded-[100px] font-bold text-sm transition-all shadow-lg shadow-black/10
                active:scale-95 disabled:opacity-60 whitespace-nowrap
                ${saved
                  ? 'bg-[#1BFF11] text-[#0A0A0A]'
                  : 'bg-[#0A0A0A] text-white hover:bg-[#1BFF11] hover:text-[#0A0A0A]'}
              `}
            >
              {isLoading
                ? <span className="animate-pulse">Salvando…</span>
                : saved
                ? <><Check size={18} weight="bold" /> Salvo!</>
                : <><FloppyDiskBack size={18} weight="bold" /> Salvar alterações</>}
            </button>
          </div>

          {error && (
            <div className="mb-6 px-5 py-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5 md:space-y-6 pb-20">

            {/* Aparência */}
            <section className="bg-white border border-[#E0E0D8] rounded-[20px] md:rounded-[24px] overflow-hidden shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-[#F0F0EB] flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                  Aparência Visual
                </span>
                <span className="text-[10px] font-bold text-[#9A9A8F] bg-[#F0F0EB] px-2.5 py-1 rounded-full">
                  OPCIONAL
                </span>
              </div>

              <div className="relative">
                {/* Banner */}
                <div className="h-32 md:h-40 bg-[#F0F0EB] relative group overflow-hidden">
                  {banner.previewUrl
                    ? <img src={banner.previewUrl} className="w-full h-full object-cover" alt="Capa" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={28} className="text-[#E0E0D8]" />
                      </div>}

                  {banner.isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
                      <CircleNotch size={24} className="animate-spin" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Enviando…</span>
                    </div>
                  )}

                  {!banner.isUploading && (
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-2 backdrop-blur-[2px]">
                      <Camera size={24} weight="fill" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Alterar Capa</span>
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'banner')
                        }}
                      />
                    </label>
                  )}

                  {banner.error && (
                    <p className="absolute bottom-2 left-2 right-2 text-center text-[11px] bg-red-500 text-white px-2 py-1 rounded-lg">
                      {banner.error}
                    </p>
                  )}
                </div>

                {/* Logo */}
                <div className="absolute left-4 md:left-6 -bottom-9 md:-bottom-10">
                  <div className="relative group w-20 h-20 md:w-24 md:h-24 rounded-[16px] md:rounded-[20px] border-[4px] md:border-[5px] border-white bg-[#F0F0EB] shadow-xl overflow-hidden">
                    {logo.previewUrl
                      ? <img src={logo.previewUrl} className="w-full h-full object-cover" alt="Perfil" />
                      : <div className="w-full h-full flex items-center justify-center text-[#9A9A8F] font-display font-extrabold text-2xl">
                          {formData.name.charAt(0)}
                        </div>}

                    {logo.isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <CircleNotch size={20} className="animate-spin text-white" />
                      </div>
                    )}

                    {!logo.isUploading && (
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white backdrop-blur-sm">
                        <Camera size={20} weight="fill" />
                        <input
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'logo')
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {logo.error && (
                    <p className="mt-1 text-[10px] text-red-500 font-medium max-w-[96px]">
                      {logo.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="h-12 md:h-14" />
            </section>

            {/* Informações Gerais */}
            <section className="bg-white border border-[#E0E0D8] rounded-[20px] md:rounded-[24px] p-4 md:p-6 shadow-sm space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] block border-b border-[#F0F0EB] pb-4">
                Informações Gerais
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <Field label="Nome da organização *">
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Slug (URL)">
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-[#9A9A8F] text-sm font-medium pointer-events-none">
                      reppy.app/
                    </span>
                    <input
                      required
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className={`${inputClass} pl-[90px] font-mono font-bold`}
                    />
                  </div>
                </Field>
              </div>
              <Field label="Descrição / Bio">
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: República focada em integrar bixos e veteranos…"
                  className={`${inputClass} resize-none leading-relaxed`}
                />
              </Field>
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9A8F] ml-1 block">
                  Categoria
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-2.5">
                  {CATEGORIES.map(({ value, label, Icon }) => {
                    const isActive = formData.category === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: value })}
                        className={`
                          flex items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2.5 md:py-3
                          rounded-xl border-2 transition-all text-sm font-semibold text-left
                          ${isActive
                            ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
                            : 'border-[#E0E0D8] bg-white text-[#5C5C52] hover:border-[#0A0A0A]/30 hover:bg-[#F0F0EB]'}
                        `}
                      >
                        <span className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-[#1BFF11]' : 'bg-[#F0F0EB]'}`}>
                          <Icon size={15} weight="bold" className={isActive ? 'text-[#0A0A0A]' : 'text-[#9A9A8F]'} />
                        </span>
                        <span className="truncate">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Contato */}
            <section className="bg-white border border-[#E0E0D8] rounded-[20px] md:rounded-[24px] p-4 md:p-6 shadow-sm space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] block border-b border-[#F0F0EB] pb-4">
                Canais de Contato
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <Field label="E-mail público *" icon={<Envelope size={12} weight="fill" />}>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="WhatsApp *" icon={<WhatsappLogo size={12} weight="fill" />}>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: handlePhoneMask(e.target.value) })}
                    className={`${inputClass} font-mono font-bold`}
                  />
                </Field>
                <Field label="Instagram" icon={<InstagramLogo size={12} weight="fill" />}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A8F] font-bold text-sm pointer-events-none">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </Field>
                <Field label="Site oficial" icon={<Globe size={12} weight="fill" />}>
                  <input
                    type="text"
                    value={formData.website}
                    placeholder="https://"
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Zona de Perigo */}
            <section className="bg-red-50/40 border border-red-100 rounded-[20px] md:rounded-[24px] p-4 md:p-6 mt-4 group transition-all hover:bg-red-50/70">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-red-100 rounded-xl md:rounded-2xl flex items-center justify-center text-[#FF2D2D] shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Warning size={22} weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-extrabold text-base md:text-lg text-[#0A0A0A] tracking-tight">
                    Zona de Perigo
                  </h3>
                  <p className="text-sm text-[#9A9A8F] mt-1.5 leading-relaxed">
                    Ao excluir sua organização, todos os eventos, ingressos e dados financeiros serão{' '}
                    <strong className="text-[#5C5C52]">permanentemente apagados</strong>. Essa ação não pode ser desfeita.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="mt-4 md:mt-5 flex items-center gap-2 text-[#FF2D2D] font-bold text-sm bg-white border border-red-100 hover:bg-[#FF2D2D] hover:text-white px-4 md:px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    <Trash size={16} weight="bold" />
                    Excluir organização permanentemente
                  </button>
                </div>
              </div>
            </section>

          </form>
        </main>
      </div>

      <DeleteOrgModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        orgName={formData.name}
      />
    </div>
  )
}
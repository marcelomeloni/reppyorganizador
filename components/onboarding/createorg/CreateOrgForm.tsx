'use client'
import { useState, useRef } from 'react'
import {
  ArrowLeft, ArrowRight, Camera, Image as ImageIcon,
  InstagramLogo, Phone, Envelope, Plus, User, IdentificationCard,
} from '@phosphor-icons/react'

interface CreateOrgFormProps {
  onBack: () => void
  onSubmit: (data: {
    name: string
    email: string
    phone: string
    description: string
    instagram: string
    fullName: string
    cpf: string
  }) => void
  isLoading: boolean
  defaultFullName?: string
  defaultEmail?: string
  defaultCpf?: string
}

export function CreateOrgForm({
  onBack,
  onSubmit,
  isLoading,
  defaultFullName = '',
  defaultEmail = '',
  defaultCpf = '',
}: CreateOrgFormProps) {
  const [formData, setFormData] = useState({
    fullName: defaultFullName,
    cpf:      defaultCpf,
    name:     '',
    email:    defaultEmail,
    phone:    '',
    description: '',
    instagram:   '',
  })

  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [headerPreview,  setHeaderPreview]  = useState<string | null>(null)
  const fileInputProfile = useRef<HTMLInputElement>(null)
  const fileInputHeader  = useRef<HTMLInputElement>(null)

  const hasCpf = !!defaultCpf

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d{5})(\d)/, '$1-$2')
    setFormData({ ...formData, phone: v.slice(0, 15) })
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasCpf) return
    let v = e.target.value.replace(/\D/g, '')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    setFormData({ ...formData, cpf: v.slice(0, 14) })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'header') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'profile') setProfilePreview(reader.result as string)
        else setHeaderPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-right-6 duration-300 max-w-2xl mx-auto overflow-hidden">

      {/* Cover */}
      <div
        className="h-32 w-full bg-gray-100 relative group cursor-pointer"
        onClick={() => fileInputHeader.current?.click()}
      >
        {headerPreview
          ? <img src={headerPreview} className="w-full h-full object-cover" alt="Header" />
          : <div className="flex items-center justify-center h-full text-gray-400 gap-2 font-body text-sm font-medium"><ImageIcon size={20} /> Adicionar Capa</div>
        }
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Camera size={24} weight="fill" />
        </div>
        <input type="file" ref={fileInputHeader} hidden accept="image/*" onChange={(e) => handleImageChange(e, 'header')} />
      </div>

      <div className="p-8 pt-0">

        {/* Profile photo */}
        <div className="relative -mt-12 mb-6 flex justify-between items-end">
          <div
            className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-sm relative group cursor-pointer overflow-hidden"
            onClick={() => fileInputProfile.current?.click()}
          >
            {profilePreview
              ? <img src={profilePreview} className="w-full h-full object-cover" alt="Profile" />
              : <div className="flex items-center justify-center h-full text-gray-400"><Camera size={28} weight="fill" /></div>
            }
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Plus size={20} weight="bold" />
            </div>
            <input type="file" ref={fileInputProfile} hidden accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
          </div>

          <button type="button" onClick={onBack} className="mb-2 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-body text-sm font-bold">
            <ArrowLeft size={16} weight="bold" /> Voltar
          </button>
        </div>

        <h2 className="font-bricolage font-extrabold text-3xl text-black mb-6">Configurar Organização</h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Dados pessoais */}
          <div className="p-4 bg-gray-50 rounded-[18px] border border-gray-100 space-y-4">
            <p className="font-display text-xs font-bold text-gray-400 uppercase tracking-widest">Seus dados</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-display text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <User size={13} /> Nome completo *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-black transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="font-display text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <IdentificationCard size={13} /> CPF *
                  {hasCpf && (
                    <span className="ml-1 text-green-600 text-[10px] normal-case font-normal">✓ já cadastrado</span>
                  )}
                </label>
                <input
                  required
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleCpfChange}
                  readOnly={hasCpf}
                  className={`w-full px-5 py-4 border rounded-[14px] focus:outline-none transition-all font-mono ${
                    hasCpf
                      ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed select-none'
                      : 'bg-white border-gray-200 focus:border-black'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Nome da org */}
          <div className="space-y-1">
            <label className="font-display text-sm font-bold text-black ml-1">Nome da Organização *</label>
            <input
              required
              type="text"
              placeholder="Ex: República Orgulho"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[18px] focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-display text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                <Envelope size={14} /> Email de Contato *
              </label>
              <input
                required
                type="email"
                placeholder="contato@org.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[18px] focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="font-display text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                <Phone size={14} /> WhatsApp *
              </label>
              <input
                required
                type="text"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[18px] focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="font-display text-sm font-bold text-black ml-1">Descrição</label>
            <textarea
              rows={3}
              placeholder="Conte um pouco sobre a sua organização..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-[18px] focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-1">
            <label className="font-display text-sm font-bold text-black ml-1 flex items-center gap-1">
              <InstagramLogo size={18} /> Instagram
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-body">@</span>
              <input
                type="text"
                placeholder="usuario"
                value={formData.instagram}
                onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-[18px] focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-black text-white font-display font-bold rounded-[18px] flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Criando...' : 'Finalizar Organização'}
            <ArrowRight size={18} weight="bold" />
          </button>
        </form>
      </div>
    </div>
  )
}
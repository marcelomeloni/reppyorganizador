"use client";

import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  CalendarBlank, 
  Hash, 
  CurrencyDollar, 
  Percent, 
  Ticket,
  CaretDown 
} from '@phosphor-icons/react';

const AddCouponModal = ({ onClose, onSave, tickets = [] }) => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    value: '',
    limit: '',
    validUntil: '',
    applicableTo: 'all', // 'all' | 'specific'
    selectedTicketTypes: []
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Usamos os tickets passados via props, ou array vazio se não houver
  const availableTickets = tickets || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTicketTypeToggle = (id) => {
    setFormData(prev => {
      const isSelected = prev.selectedTicketTypes.includes(id);
      if (isSelected) {
        return { ...prev, selectedTicketTypes: prev.selectedTicketTypes.filter(tid => tid !== id) };
      } else {
        return { ...prev, selectedTicketTypes: [...prev.selectedTicketTypes, id] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Transformação para o formato da API (Snake Case)
    const payload = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discountType,
        discount_value: Number(formData.value),
        max_uses: formData.limit ? Number(formData.limit) : null,
        expires_at: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        // Se for específico, manda os IDs. Se for all, manda array vazio ou null (dependendo do backend, assumindo [] aqui)
        batch_ids: formData.applicableTo === 'specific' ? formData.selectedTicketTypes : []
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[var(--radius-card-md,20px)] border border-[#E0E0D8] shadow-xl w-full max-w-lg overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0F0EB] flex items-center justify-between bg-[#F7F7F2]/50 shrink-0">
           <h3 
             className="font-extrabold text-[#0A0A0A] flex items-center gap-2 text-base"
             style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
           >
             <div className="w-8 h-8 rounded-[8px] bg-[#0A0A0A] flex items-center justify-center text-white">
               <Tag size={16} weight="bold" />
             </div>
             Criar Novo Cupom
           </h3>
           <button 
             onClick={onClose} 
             className="p-1.5 rounded-full text-[#9A9A8F] hover:bg-[#F0F0EB] hover:text-[#0A0A0A] transition-colors"
           >
             <X size={20} weight="bold" />
           </button>
        </div>

        {/* Body Scrollável */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-white">
           
           {/* Código do Cupom */}
           <div>
              <label 
                className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
              >
                Código do Cupom
              </label>
              <div className="relative">
                 <Hash size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]" />
                 <input 
                   type="text" 
                   name="code"
                   value={formData.code}
                   onChange={handleChange}
                   placeholder="EX: VERÃO2026"
                   className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white border border-[#E0E0D8] text-sm outline-none focus:border-[#0A0A0A]/30 uppercase font-bold text-[#0A0A0A] placeholder-[#9A9A8F] transition-colors shadow-sm"
                   style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                   autoFocus
                   required
                 />
              </div>
              <p 
                className="text-[10px] text-[#5C5C52] mt-1.5"
                style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
              >
                O código que será digitado pelos participantes.
              </p>
           </div>

           {/* Tipo e Valor do Desconto */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label 
                   className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                   style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                 >
                   Tipo de Desconto
                 </label>
                 <select 
                   name="discountType"
                   value={formData.discountType}
                   onChange={handleChange}
                   className="w-full px-3 py-2.5 rounded-[12px] bg-white border border-[#E0E0D8] text-sm text-[#0A0A0A] outline-none focus:border-[#0A0A0A]/30 transition-colors shadow-sm"
                   style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                 >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                 </select>
              </div>
              <div>
                 <label 
                   className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                   style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                 >
                   Valor
                 </label>
                 <div className="relative">
                    {formData.discountType === 'percentage' ? (
                       <Percent size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]" />
                    ) : (
                       <CurrencyDollar size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F]" />
                    )}
                    <input 
                      type="number" 
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder={formData.discountType === 'percentage' ? "10" : "15,00"}
                      className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] outline-none focus:border-[#0A0A0A]/30 transition-colors shadow-sm"
                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                      required
                    />
                 </div>
              </div>
           </div>

           {/* Aplicável a... */}
           <div>
              <label 
                className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
              >
                Aplicar Desconto Em
              </label>
              
              <div className="flex gap-4 mb-3">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="applicableTo" 
                      value="all" 
                      checked={formData.applicableTo === 'all'}
                      onChange={handleChange}
                      className="w-4 h-4 border-[#E0E0D8] text-[#0A0A0A] focus:ring-[#0A0A0A]"
                    />
                    <span 
                      className="text-sm font-medium text-[#0A0A0A] group-hover:text-[#5C5C52] transition-colors"
                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                      Todos os ingressos
                    </span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="applicableTo" 
                      value="specific" 
                      checked={formData.applicableTo === 'specific'}
                      onChange={handleChange}
                      className="w-4 h-4 border-[#E0E0D8] text-[#0A0A0A] focus:ring-[#0A0A0A]"
                    />
                    <span 
                      className="text-sm font-medium text-[#0A0A0A] group-hover:text-[#5C5C52] transition-colors"
                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                      Ingressos específicos
                    </span>
                 </label>
              </div>

              {/* Dropdown de Seleção Múltipla */}
              {formData.applicableTo === 'specific' && (
                 <div className="relative animate-fade-in">
                    <button 
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F7F7F2] border border-[#E0E0D8] rounded-[12px] text-sm text-[#0A0A0A] hover:border-[#0A0A0A]/30 transition-colors"
                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                       <span className="flex items-center gap-2">
                          <Ticket size={16} weight="bold" className="text-[#9A9A8F]" />
                          {formData.selectedTicketTypes.length === 0 
                             ? <span className="text-[#9A9A8F]">Selecione os ingressos...</span> 
                             : <span className="font-bold">{formData.selectedTicketTypes.length} ingresso(s) selecionado(s)</span>}
                       </span>
                       <CaretDown size={16} weight="bold" className={`text-[#5C5C52] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                       <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E0E0D8] rounded-[12px] shadow-lg z-10 max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                          {availableTickets.length > 0 ? (
                              availableTickets.map(ticket => (
                                 <label 
                                   key={ticket.id} 
                                   className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F7F7F2] rounded-[8px] cursor-pointer transition-colors"
                                 >
                                    <input 
                                      type="checkbox" 
                                      checked={formData.selectedTicketTypes.includes(ticket.id)}
                                      onChange={() => handleTicketTypeToggle(ticket.id)}
                                      className="w-4 h-4 rounded-[4px] border-[#E0E0D8] text-[#0A0A0A] focus:ring-[#0A0A0A]"
                                    />
                                    <span 
                                      className="text-sm font-medium text-[#0A0A0A]"
                                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                                    >
                                      {ticket.name}
                                    </span>
                                 </label>
                              ))
                          ) : (
                              <div 
                                className="p-4 text-center text-xs text-[#9A9A8F]"
                                style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                              >
                                  Nenhum ingresso cadastrado neste evento.
                              </div>
                          )}
                       </div>
                    )}
                 </div>
              )}
           </div>

           {/* Limite e Validade */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label 
                   className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                   style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                 >
                   Limite de Uso
                 </label>
                 <input 
                   type="number" 
                   name="limit"
                   value={formData.limit}
                   onChange={handleChange}
                   placeholder="Ilimitado se vazio"
                   className="w-full px-3 py-2.5 rounded-[12px] bg-white border border-[#E0E0D8] text-sm text-[#0A0A0A] placeholder-[#9A9A8F] outline-none focus:border-[#0A0A0A]/30 transition-colors shadow-sm"
                   style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                 />
              </div>
              <div>
                 <label 
                   className="block text-[11px] font-bold text-[#9A9A8F] uppercase tracking-widest mb-1.5"
                   style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
                 >
                   Válido Até
                 </label>
                 <div className="relative">
                    <CalendarBlank size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A8F] pointer-events-none" />
                    <input 
                      type="date" 
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white border border-[#E0E0D8] text-sm text-[#0A0A0A] outline-none focus:border-[#0A0A0A]/30 transition-colors shadow-sm"
                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                    />
                 </div>
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#F0F0EB] flex justify-end gap-3 shrink-0">
           <button 
             onClick={onClose} 
             className="px-4 py-2 text-xs font-bold text-[#5C5C52] hover:bg-[#F0F0EB] rounded-[100px] transition-colors"
             style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
           >
             Cancelar
           </button>
           <button 
             onClick={handleSubmit} 
             className="px-6 py-2 bg-[#0A0A0A] text-[#F7F7F2] text-xs font-bold rounded-[100px] hover:bg-[#222] transition-colors shadow-sm"
             style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
           >
             Salvar Cupom
           </button>
        </div>

      </div>
    </div>
  );
};

export default AddCouponModal;
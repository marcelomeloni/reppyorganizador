import Link from "next/link";
import {
  ArrowRight,
  Crosshair,
  Storefront,
  QrCode,
  ChartLineUp,
  Money,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";

export default function CreatorLandingPage() {
  return (
    <div className="bg-off-white overflow-x-hidden">
      
      {/* ── HERO SECTION (Diferente da B2C, centralizado e focado em conversão) ── */}
      <section className="relative bg-black min-h-[100vh] flex items-center justify-center overflow-hidden py-20">
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "180px" }} />

        {/* Green glow centralizado */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(27,255,17,0.15) 0%, transparent 70%)" }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center gap-8">
       
          
          <h1 
            className="font-bricolage font-extrabold text-white leading-[0.9]"
            style={{ fontSize: "clamp(56px, 10vw, 120px)", letterSpacing: "-3px" }}
          >
            Sua festa lotada.<br />
            <span className="text-primary">Seu caixa no verde.</span>
          </h1>
          
          <p className="font-body text-lg text-gray-400 max-w-2xl leading-relaxed mt-2">
            A única plataforma de ingressos universitários com ecossistema social nativo. 
            Venda mais rápido com o FOMO do Radar, pague menos taxas e tenha controle total da portaria.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <Link
              href="/cadastro"
              className="flex items-center justify-center gap-2 font-display font-extrabold text-black bg-primary hover:bg-primary-dark px-8 py-4 rounded-pill transition-all hover:scale-[1.02] active:scale-[0.98] tracking-tight text-[16px] w-full sm:w-auto"
            >
              Criar minha conta
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="#taxas"
              className="flex items-center justify-center gap-2 font-display font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-pill transition-all tracking-tight text-[16px] w-full sm:w-auto"
            >
              Conhecer as vantagens
            </Link>
          </div>
        </div>
      </section>

      {/* ── O SEGREDO DA REPPY (Ecosistema Social - Diferencial B2B) ── */}
      <section className="py-28 max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <h2 
              className="font-bricolage font-extrabold text-black leading-tight mb-6"
              style={{ fontSize: "clamp(40px, 5vw, 64px)", letterSpacing: "-2px" }}
            >
              A gente não vende só o ingresso. <br/>
              <span className="text-gray-400">A gente vende a vontade de ir.</span>
            </h2>
            <p className="font-body text-base text-gray-600 leading-relaxed mb-8">
              Enquanto as outras plataformas são apenas "carrinhos de compra", a Reppy cria um ecossistema ao redor da sua festa. O engajamento começa muito antes da porta abrir.
            </p>
            
            <div className="flex flex-col gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Crosshair size={24} weight="bold" className="text-primary-dark" />
                </div>
                <div>
                  <h3 className="font-bricolage font-bold text-xl text-black mb-1">O FOMO do Reppy Radar</h3>
                  <p className="font-body text-sm text-gray-500">
                    Quem compra desbloqueia o Radar. A galera entra pra ver quem vai, dá "taps" e movimenta a rede. Isso gera urgência e faz os ingressos rodarem sozinhos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Storefront size={24} weight="bold" className="text-black" />
                </div>
                <div>
                  <h3 className="font-bricolage font-bold text-xl text-black mb-1">Mercado Secundário Seguro</h3>
                  <p className="font-body text-sm text-gray-500">
                    Acabou a dor de cabeça com golpe no WhatsApp. Se alguém desistir, revende pelo app num preço tabelado. O ingresso muda de nome e o QR Code antigo é invalidado na hora.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ilustração Abstrata/Dashboard Concept */}
          <div className="flex-1 w-full aspect-square bg-gray-100 rounded-card-lg border border-gray-200 relative overflow-hidden flex items-center justify-center">
            {/* Aqui você pode colocar uma imagem real do dashboard depois */}
            <div className="text-center p-8">
              <div className="inline-flex gap-2 p-2 bg-white rounded-full shadow-sm mb-4">
                <div className="w-10 h-10 rounded-full bg-black"></div>
                <div className="w-10 h-10 rounded-full bg-gray-200 -ml-4 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-primary -ml-4 border-2 border-white"></div>
              </div>
              <p className="font-bricolage font-bold text-2xl text-black">Motor de Vendas Reppy</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TAXAS (Transparência Direta) ── */}
      <section id="taxas" className="bg-black py-28 relative overflow-hidden">
        {/* Subtitle glowing effect */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 
              className="font-bricolage font-extrabold text-white leading-none mb-6"
              style={{ fontSize: "clamp(48px, 6vw, 80px)", letterSpacing: "-3px" }}
            >
              Taxas que respeitam<br/> o seu <span className="text-primary">trampo.</span>
            </h2>
            <p className="font-body text-gray-400 max-w-xl mx-auto text-lg">
              A gente sabe que cada real importa pro caixa da rep. Nossa estrutura é desenhada para você lucrar mais a cada lote virado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Box Concorrência */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-card-lg flex flex-col items-center text-center opacity-70">
              <span className="font-body text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">O Padrão do Mercado</span>
              <span className="font-bricolage font-extrabold text-white text-6xl mb-2 line-through decoration-red-500">10%</span>
              <p className="font-body text-sm text-gray-400 mt-4">
                Fica pesado rápido. Num evento de R$ 50, a plataforma leva R$ 5 por cada ingresso vendido.
              </p>
            </div>

            {/* Box Reppy */}
            <div className="bg-primary p-8 rounded-card-lg flex flex-col items-center text-center shadow-[0_0_60px_rgba(27,255,17,0.15)] transform md:-translate-y-4">
              <span className="font-body text-xs font-bold uppercase tracking-widest text-black mb-4">Taxa Reppy Permanente</span>
              <span className="font-bricolage font-extrabold text-black text-7xl tracking-tighter mb-2">7%</span>
              <p className="font-body text-sm font-medium text-black/80 mt-4">
                Simples e fixo. Em um ingresso de R$ 50, a taxa é R$ 3,50. <br/><strong>A diferença fica toda no seu caixa.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECNOLOGIA / OPERAÇÃO ── */}
      <section className="py-28 max-w-6xl mx-auto px-6">
        <h2 
          className="font-bricolage font-extrabold text-black mb-16"
          style={{ fontSize: "clamp(32px, 4vw, 56px)", letterSpacing: "-2px" }}
        >
          Tudo pra você focar <br/>só na festa.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-card-md border border-gray-200">
            <ChartLineUp size={28} weight="bold" className="text-primary-dark mb-6" />
            <h3 className="font-bricolage font-bold text-2xl text-black mb-3">Dashboard Real-Time</h3>
            <p className="font-body text-gray-600 text-sm leading-relaxed">
              Acompanhe vendas, acessos e faturamento segundo a segundo. Virada de lote automatizada ou com um clique.
            </p>
          </div>

          <div className="bg-white p-8 rounded-card-md border border-gray-200">
            <QrCode size={28} weight="bold" className="text-primary-dark mb-6" />
            <h3 className="font-bricolage font-bold text-2xl text-black mb-3">Portaria Blindada</h3>
            <p className="font-body text-gray-600 text-sm leading-relaxed">
              Nosso app de leitura é rápido. Se o ingresso for revendido ou transferido, o QR antigo para de funcionar imediatamente. Fila andando rápido, sem fraude.
            </p>
          </div>

          <div className="bg-white p-8 rounded-card-md border border-gray-200">
            <Money size={28} weight="bold" className="text-primary-dark mb-6" />
            <h3 className="font-bricolage font-bold text-2xl text-black mb-3">Repasse Inteligente</h3>
            <p className="font-body text-gray-600 text-sm leading-relaxed">
              Sem burocracia pra botar a mão no dinheiro da sua república. Transparência total sobre o que foi vendido e o que é seu.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-gray-100 py-32 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 
            className="font-bricolage font-extrabold text-black leading-none mb-6"
            style={{ fontSize: "clamp(48px, 6vw, 96px)", letterSpacing: "-3px" }}
          >
            Seu próximo evento começa aqui.
          </h2>
          <p className="font-body text-lg text-gray-600 mb-10">
            Crie sua conta de organizador, aproveite as melhores taxas do mercado universitário e publique seu primeiro evento hoje.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 font-display font-extrabold text-black bg-primary hover:bg-primary-dark px-10 py-5 rounded-pill transition-all hover:scale-[1.02] active:scale-[0.98] tracking-tight text-[18px]"
          >
            Criar conta de organizador
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </section>

    </div>
  );
}
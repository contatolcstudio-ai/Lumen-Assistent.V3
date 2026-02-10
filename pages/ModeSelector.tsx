
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ImageIcon, 
  Megaphone, 
  Briefcase, 
  FolderOpen, 
  ArrowRight,
  Lightbulb,
  Zap,
  Coffee,
  Star,
  MessageSquare,
  Palette,
  Hexagon,
  Type as TypeIcon,
  Quote,
  Eraser,
  Users,
  FileText,
  History,
  BrainCircuit,
  Instagram,
  MessageCircle,
  Package
} from 'lucide-react';

const INSIGHTS = [
  {
    topic: "EMPREENDEDORISMO",
    text: "O lucro é o resultado de resolver um problema melhor do que qualquer outra pessoa.",
    author: "LÚMEN Insight",
    color: "text-amber-500",
    bg: "bg-amber-50",
    gradient: "from-amber-500/10 to-transparent"
  },
  {
    topic: "DESIGN & ESTÉTICA",
    text: "A simplicidade é o último grau da sofisticação. Menos é, invariavelmente, mais.",
    author: "LÚMEN Insight",
    color: "text-violet-500",
    bg: "bg-violet-50",
    gradient: "from-violet-500/10 to-transparent"
  },
  {
    topic: "NEGÓCIOS",
    text: "Não venda o produto. Venda a transformação que o seu cliente terá ao usá-lo.",
    author: "LÚMEN Insight",
    color: "text-rose-500",
    bg: "bg-rose-50",
    gradient: "from-rose-500/10 to-transparent"
  }
];

const creationTools = [
  { title: 'Gerar Imagem', path: '/images', icon: ImageIcon, color: 'bg-emerald-600' },
  { title: 'Gerar Logos', path: '/logos', icon: Hexagon, color: 'bg-pink-600' },
  { title: 'Gerar Lettering', path: '/names', icon: TypeIcon, color: 'bg-indigo-600' },
  { title: 'Gerar Paletas', path: '/palettes', icon: Palette, color: 'bg-orange-600' },
  { title: 'Gerar Slogan', path: '/slogans', icon: Quote, color: 'bg-amber-600' },
  { title: 'Gerar Mockup', path: '/mockups', icon: ImageIcon, color: 'bg-sky-600' },
  { title: 'Remover Fundo', path: '/bg-removal', icon: Eraser, color: 'bg-slate-600' },
];

const managementTools = [
  { title: 'Clientes', path: '/clients', icon: Users, color: 'bg-blue-600' },
  { title: 'Projetos', path: '/projects', icon: FolderOpen, color: 'bg-violet-600' },
  { title: 'Produtos', path: '/products', icon: Package, color: 'bg-amber-500' },
  { title: 'Gestão Estúdio', path: '/management', icon: Briefcase, color: 'bg-black' },
  { title: 'Orçamentos', path: '/budgets', icon: FileText, color: 'bg-gray-600' },
];

const supportTools = [
  { title: 'Chat LÚMEN', path: '/chat', icon: MessageSquare, color: 'bg-violet-600' },
  { title: 'Anotações', path: '/notes', icon: FileText, color: 'bg-emerald-600' },
  { title: 'Histórico', path: '/history', icon: History, color: 'bg-gray-400' },
];

const ToolCard: React.FC<{ tool: any }> = ({ tool }) => (
  <Link 
    to={tool.path}
    className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-5 ring-1 ring-black/5"
  >
    <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0`}>
      <tool.icon className="w-7 h-7" />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-[#111111] uppercase italic tracking-tight leading-none">{tool.title}</span>
    </div>
  </Link>
);

export default function ModeSelector() {
  const [greeting, setGreeting] = useState('');
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const interval = setInterval(() => {
      setCurrentInsight(prev => (prev + 1) % INSIGHTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      
      {/* 1. HERO SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 px-4">
        <div className="space-y-4 max-w-2xl">
          <div>
            <p className="text-xs font-black text-violet-600 tracking-[0.4em] uppercase mb-2">Hub Criativo Ativo • {currentTime}</p>
            <h2 className="text-7xl font-black text-[#111111] uppercase tracking-tighter italic leading-none">
              {greeting}.
            </h2>
          </div>
          <p className="text-xl text-gray-400 font-medium italic leading-tight">
            Seu espaço para criar, organizar e elevar o nível de cada projeto.
          </p>
        </div>

        <Link to="/chat" className="group flex items-center gap-6 bg-white border border-gray-200 p-3 pl-8 rounded-full shadow-lg hover:shadow-2xl transition-all hover:border-violet-200">
           <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultoria IA</p>
              <p className="text-sm font-black text-[#111111] uppercase italic">Conversar com LÚMEN</p>
           </div>
           <div className="w-11 h-11 bg-violet-600 rounded-full flex items-center justify-center text-white group-hover:rotate-45 transition-transform shadow-lg">
              <ArrowRight className="w-5 h-5" />
           </div>
        </Link>
      </header>

      {/* 2. INSIGHT DE ALTO IMPACTO */}
      <section className="px-4">
        <div className={`relative min-h-[280px] md:min-h-[320px] rounded-[4rem] overflow-hidden flex flex-col items-center justify-center text-center p-8 md:p-12 transition-all duration-1000 ${INSIGHTS[currentInsight].bg} border border-white shadow-inner group cursor-default`}>
           <div className={`absolute inset-0 bg-gradient-to-br ${INSIGHTS[currentInsight].gradient} opacity-50`}></div>
           
           <div className="flex items-center gap-3 relative z-10 mb-8">
              <Lightbulb className={`w-5 h-5 ${INSIGHTS[currentInsight].color} animate-pulse`} />
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${INSIGHTS[currentInsight].color}`}>Insight do Momento</span>
           </div>
           
           <div className="max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-700 relative z-10">
              <blockquote className="text-2xl md:text-5xl font-black text-[#111111] italic tracking-tighter uppercase leading-none px-4">
                "{INSIGHTS[currentInsight].text}"
              </blockquote>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">— {INSIGHTS[currentInsight].topic}</p>
           </div>

           {/* Progress Dots */}
           <div className="flex gap-3 mt-10 relative z-10">
              {INSIGHTS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${currentInsight === i ? 'w-10 bg-black' : 'w-2 bg-gray-200'}`} />
              ))}
           </div>
        </div>
      </section>

      {/* 3. TOOL HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4">
        
        {/* COLUNA ESQUERDA: CRIAR */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6" />
               </div>
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">CRIAR (DESIGN & CONCEITO)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creationTools.map(tool => <ToolCard key={tool.path} tool={tool} />)}
            </div>
          </section>

          {/* GRUPO: MARKETING */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <Megaphone className="w-6 h-6" />
               </div>
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">MARKETING (ESTRATÉGIA)</h3>
            </div>
            <Link 
              to="/marketing"
              className="group relative h-48 bg-rose-500 rounded-[3rem] overflow-hidden flex items-center p-10 shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="space-y-2">
                   <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Marketing Central</h4>
                   <p className="text-rose-100 text-sm font-medium italic">Sua diretoria criativa para conteúdo e artes.</p>
                </div>
                <div className="w-16 h-16 bg-white text-rose-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                   <Megaphone className="w-8 h-8" />
                </div>
              </div>
            </Link>
          </section>
        </div>

        {/* COLUNA DIREITA: GESTÃO & APOIO */}
        <div className="lg:col-span-4 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
               </div>
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">GESTÃO (ESTÚDIO & CLIENTES)</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {managementTools.map(tool => <ToolCard key={tool.path} tool={tool} />)}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                  <Coffee className="w-6 h-6" />
               </div>
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">APOIO & UTILIDADES</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {supportTools.map(tool => <ToolCard key={tool.path} tool={tool} />)}
            </div>
          </section>
        </div>
      </div>

      {/* 4. RODAPÉ DE DIVULGAÇÃO */}
      <footer className="mt-20 px-4">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto shadow-sm">
          <div className="text-center md:text-left">
            <p className="text-lg font-bold text-[#111111] italic uppercase tracking-tight">Quer criar um app também?</p>
            <p className="text-sm font-medium text-gray-400 italic">Fale comigo e transforme sua visão em realidade tecnológica.</p>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://wa.me/5511978136769" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a 
              href="https://instagram.com/lcstudio.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#E1306C] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          </div>
        </div>
        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] mt-10">LÚMEN BY LC STUDIO BR</p>
      </footer>
    </div>
  );
}

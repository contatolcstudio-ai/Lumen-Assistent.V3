
import React, { useState, useRef, useEffect } from 'react';
import { 
  Megaphone, Sparkles, Loader2, Copy, Check, ChevronDown, Package, 
  MessageSquareText, Hash, ArrowUpRight, Camera, Image as ImageIcon,
  Smartphone, Square, Type as TypeIcon, RefreshCw, Download, Layout,
  Lightbulb, Rocket
} from 'lucide-react';
import { generateJson, generateImage, generateText } from '../geminiService';
import { Type } from '@google/genai';
import { CreativeItem } from '../types';

interface MarketingResult {
  captionShort: string;
  captionMedium: string;
  hashtags: string[];
  cta: string;
  visualIdea: string;
  storyAdaptation: string;
}

const TONES = [
  { id: 'amigavel', label: 'Amigável', icon: '😊' },
  { id: 'profissional', label: 'Profissional', icon: '💼' },
  { id: 'engracado', label: 'Engraçado', icon: '😂' },
  { id: 'inspirador', label: 'Inspirador', icon: '✨' },
  { id: 'urgente', label: 'Urgente/Vendas', icon: '🚨' },
];

const PLATFORMS = [
  { id: 'instagram_feed', label: 'Instagram (Feed)' },
  { id: 'instagram_stories', label: 'Instagram (Stories)' },
  { id: 'whatsapp', label: 'WhatsApp Status' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok/Reels (Roteiro)' },
];

// Configs for Visual Art generator
const ART_CATEGORIES = [
  { id: 'saudacao', label: 'Bom dia / Tarde / Noite', icon: '☀️' },
  { id: 'motivacional', label: 'Frases Motivacionais', icon: '🔥' },
  { id: 'impacto', label: 'Frases de Impacto', icon: '💥' },
  { id: 'curiosidade', label: 'Curiosidades', icon: '💡' },
];

const ART_STYLES = [
  { id: 'clean', label: 'Clean', desc: 'Leveza e tons pastéis' },
  { id: 'moderno', label: 'Moderno', desc: 'Geometria e tipografia bold' },
  { id: 'vibrante', label: 'Vibrante', desc: 'Cores fortes e alto contraste' },
  { id: 'minimal', label: 'Minimal', desc: 'O essencial com muito respiro' },
];

const ART_FORMATS = [
  { id: 'feed', label: 'Feed (1:1)', icon: Square, ratio: "1:1" as const, width: 1080, height: 1080 },
  { id: 'story', label: 'Story (9:16)', icon: Smartphone, ratio: "9:16" as const, width: 1080, height: 1920 },
];

export default function Marketing({ onSave }: { onSave: (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => void }) {
  const [activeTab, setActiveTab] = useState<'conteudo' | 'artes'>('conteudo');

  // --- MARKETING DE CONTEÚDO STATES ---
  const [businessType, setBusinessType] = useState('');
  const [objective, setObjective] = useState('');
  const [selectedTone, setSelectedTone] = useState('amigavel');
  const [platform, setPlatform] = useState('instagram_feed');
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentResult, setContentResult] = useState<MarketingResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- ARTES UNIVERSAIS STATES ---
  const [artFormat, setArtFormat] = useState('feed');
  const [artStyle, setArtStyle] = useState('moderno');
  const [loadingBG, setLoadingBG] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [artCategory, setArtCategory] = useState('motivacional');
  const [loadingArtText, setLoadingArtText] = useState(false);
  const [generatedArtText, setGeneratedArtText] = useState('');
  const [finalArtImage, setFinalArtImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- CONTENT MARKETING LOGIC ---
  const handleGenerateContent = async () => {
    if (!businessType.trim() || !objective.trim()) {
      alert("Por favor, descreva o negócio e o objetivo para que a LÚMEN possa criar sua estratégia.");
      return;
    }
    setLoadingContent(true);
    setContentResult(null);

    const schema = {
      type: Type.OBJECT,
      properties: {
        captionShort: { type: Type.STRING, description: "Legenda curta e direta para o post" },
        captionMedium: { type: Type.STRING, description: "Legenda mais detalhada e persuasiva" },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de 5-10 hashtags relevantes" },
        cta: { type: Type.STRING, description: "Chamada para ação matadora" },
        visualIdea: { type: Type.STRING, description: "Ideia criativa para a imagem/vídeo do post" },
        storyAdaptation: { type: Type.STRING, description: "Como adaptar esse conteúdo para os Stories" }
      },
      required: ["captionShort", "captionMedium", "hashtags", "cta", "visualIdea", "storyAdaptation"]
    };

    const toneLabel = TONES.find(t => t.id === selectedTone)?.label;
    const platLabel = PLATFORMS.find(p => p.id === platform)?.label;

    const prompt = `Atue como um Diretor de Marketing. Crie um pacote de conteúdo para: ${businessType}. 
    Objetivo: ${objective}. Tom de voz: ${toneLabel}. Foco na plataforma: ${platLabel}. 
    A saída deve ser em Português Brasileiro (PT-BR), criativa e pronta para uso imediato.`;

    try {
      const data = await generateJson<MarketingResult>(prompt, schema);
      setContentResult(data);
      onSave({
        id: `mkt-${Date.now()}`,
        type: 'marketing',
        content: data,
        timestamp: Date.now(),
        title: `Estratégia: ${businessType}`
      });
    } catch (err) {
      alert("Ocorreu um erro ao estruturar seu marketing. Verifique sua conexão e tente novamente.");
    } finally {
      setLoadingContent(false);
    }
  };

  const copyContent = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // --- VISUAL ART LOGIC ---
  const handleGenerateBG = async () => {
    setLoadingBG(true);
    setBgImage(null);
    setFinalArtImage(null);
    setGeneratedArtText('');

    const selStyle = ART_STYLES.find(s => s.id === artStyle);
    const selFormat = ART_FORMATS.find(f => f.id === artFormat);

    const prompt = `Professional aesthetic background for social media. 
    STYLE: ${selStyle?.label} - ${selStyle?.desc}. 
    FORMAT: ${selFormat?.label}. 
    STRICT RULE: NO TEXT, NO LETTERS, NO NUMBERS. 
    Must be a clean, artistic, high-resolution composition optimized for text overlay later.`;

    try {
      const imageUrl = await generateImage(prompt, selFormat?.ratio || "1:1");
      setBgImage(imageUrl);
    } catch (err) {
      alert("Erro ao gerar a base visual da arte.");
    } finally {
      setLoadingBG(false);
    }
  };

  const handleApplyArtText = async () => {
    if (!bgImage) return;
    setLoadingArtText(true);

    const catLabel = ART_CATEGORIES.find(c => c.id === artCategory)?.label;
    const prompt = `Gere uma frase curta e impactante de ${catLabel} em Português (PT-BR). 
    Apenas a frase, sem aspas, sem hashtags. Máximo de 12 palavras para garantir legibilidade no post.`;

    try {
      const text = await generateText(prompt);
      setGeneratedArtText(text.replace(/"/g, ''));
    } catch (err) {
      alert("Erro ao gerar a mensagem da arte.");
    } finally {
      setLoadingArtText(false);
    }
  };

  // Canvas Compositing
  useEffect(() => {
    if (bgImage && canvasRef.current && activeTab === 'artes') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const selFormat = ART_FORMATS.find(f => f.id === artFormat)!;
      canvas.width = selFormat.width;
      canvas.height = selFormat.height;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        if (generatedArtText) {
          // Overlay for contrast
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          const padding = canvas.width * 0.1;
          const maxWidth = canvas.width - (padding * 2);
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 30;
          ctx.shadowOffsetY = 15;

          const fontSize = artFormat === 'story' ? 85 : 75;
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;

          const words = generatedArtText.split(' ');
          let line = '';
          const lines = [];
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
              lines.push(line);
              line = words[n] + ' ';
            } else { line = testLine; }
          }
          lines.push(line);

          const lineHeight = fontSize * 1.25;
          let startY = (canvas.height / 2) - ((lines.length * lineHeight) / 2) + (lineHeight / 2);
          
          lines.forEach((l) => {
            ctx.fillText(l.trim().toUpperCase(), canvas.width / 2, startY);
            startY += lineHeight;
          });

          // Branding Watermark
          ctx.shadowBlur = 0;
          ctx.font = '900 32px Inter, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          ctx.fillText('LÚMEN CREATIVE AI', canvas.width / 2, canvas.height - 120);
        }
        setFinalArtImage(canvas.toDataURL('image/png', 0.95));
      };
    }
  }, [bgImage, generatedArtText, artFormat, activeTab]);

  const handleSaveArt = () => {
    if (!finalArtImage) return;
    onSave({
      id: `sa-${Date.now()}`,
      type: 'social_art',
      content: finalArtImage,
      timestamp: Date.now(),
      title: `Arte: ${artCategory}`
    });
    alert("Arte integrada ao seu histórico de projetos.");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header Centralizado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-[#111111] uppercase tracking-tighter italic flex items-center gap-4">
            <Megaphone className="w-12 h-12 text-rose-500" /> Marketing Central
          </h2>
          <p className="text-xl text-gray-500 font-medium italic mt-2">O cérebro estratégico e visual para sua presença digital</p>
        </div>

        {/* Switch de Abas Internas */}
        <div className="flex bg-white p-2 rounded-[2.5rem] border border-gray-200 shadow-xl self-start lg:self-center">
          <button 
            onClick={() => setActiveTab('conteudo')}
            className={`px-10 py-5 rounded-full text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'conteudo' ? 'bg-rose-500 text-white shadow-2xl' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <MessageSquareText className="w-5 h-5" /> Marketing de Conteúdo
          </button>
          <button 
            onClick={() => setActiveTab('artes')}
            className={`px-10 py-5 rounded-full text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'artes' ? 'bg-emerald-500 text-white shadow-2xl' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <ImageIcon className="w-5 h-5" /> Artes Universais
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- COLUNA DE INPUTS --- */}
        <div className="lg:col-span-5 space-y-10">
          
          {activeTab === 'conteudo' ? (
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-200 shadow-sm space-y-10 animate-in slide-in-from-left-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-black">
                    <Rocket className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-black uppercase italic tracking-tight">Setup Estratégico</h3>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">O QUE VOCÊ FAZ? *</label>
                <input 
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  placeholder="Ex: Consultório Odontológico, Freelancer Criativo..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-8 py-6 text-lg font-bold text-[#111111] focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">QUAL O SEU OBJETIVO HOJE? *</label>
                <textarea 
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="Ex: Divulgar novo serviço, captar leads, atrair seguidores..."
                  className="w-full h-36 bg-gray-50 border border-gray-200 rounded-[1.5rem] px-8 py-6 text-lg font-medium resize-none italic outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">TOM DE VOZ</label>
                  <div className="relative">
                    <select value={selectedTone} onChange={e => setSelectedTone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-base font-bold appearance-none outline-none focus:ring-2 focus:ring-rose-200">
                      {TONES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">PLATAFORMA</label>
                  <div className="relative">
                    <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-base font-bold appearance-none outline-none focus:ring-2 focus:ring-rose-200">
                      {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <button 
                onClick={handleGenerateContent}
                disabled={loadingContent}
                className="w-full py-7 bg-rose-500 text-white rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 hover:bg-rose-600 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loadingContent ? <Loader2 className="w-7 h-7 animate-spin" /> : <Sparkles className="w-7 h-7" />}
                GERAR PACOTE DE MARKETING
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-left-6">
              {/* Passo 1: Arte Base */}
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-200 shadow-sm space-y-10 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-sm">1</div>
                   <h3 className="text-xl font-black uppercase italic tracking-tight">Estética Visual</h3>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">FORMATO DA ARTE</label>
                  <div className="grid grid-cols-2 gap-4">
                    {ART_FORMATS.map(f => (
                      <button 
                        key={f.id} 
                        onClick={() => setArtFormat(f.id)} 
                        className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${artFormat === f.id ? 'bg-[#111111] text-white border-transparent shadow-2xl' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-emerald-200'}`}
                      >
                        <f.icon className="w-7 h-7" />
                        <span className="text-xs font-black uppercase">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">ESTILO VISUAL</label>
                  <div className="grid grid-cols-2 gap-4">
                    {ART_STYLES.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => setArtStyle(s.id)} 
                        className={`p-5 rounded-2xl border text-left transition-all ${artStyle === s.id ? 'bg-emerald-500 text-white border-transparent shadow-xl' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-emerald-200'}`}
                      >
                        <span className="text-xs font-black uppercase">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleGenerateBG} 
                  disabled={loadingBG} 
                  className="w-full py-6 bg-[#111111] text-white rounded-[2rem] text-lg font-black flex items-center justify-center gap-3 hover:bg-black shadow-xl transition-all disabled:opacity-50"
                >
                  {loadingBG ? <Loader2 className="animate-spin w-6 h-6" /> : <RefreshCw className="w-6 h-6" />}
                  {bgImage ? 'Substituir Arte Base' : 'Gerar Arte Sem Texto'}
                </button>
              </div>

              {/* Passo 2: Texto IA */}
              <div className={`bg-white p-10 rounded-[3.5rem] border border-gray-200 shadow-sm space-y-10 transition-all ${!bgImage ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center font-black text-sm">2</div>
                   <h3 className="text-xl font-black uppercase italic tracking-tight">Mensagem Automática</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {ART_CATEGORIES.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setArtCategory(c.id)} 
                      className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${artCategory === c.id ? 'bg-violet-600 text-white border-transparent shadow-xl' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-violet-200'}`}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <span className="text-[10px] font-black uppercase leading-tight">{c.label}</span>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleApplyArtText} 
                  disabled={loadingArtText || !bgImage} 
                  className="w-full py-6 bg-violet-600 text-white rounded-[2rem] text-lg font-black flex items-center justify-center gap-3 hover:bg-violet-700 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingArtText ? <Loader2 className="animate-spin w-6 h-6" /> : <TypeIcon className="w-6 h-6" />}
                  {generatedArtText ? 'Refazer Mensagem' : 'Gerar Texto na Arte'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- COLUNA DE RESULTADOS --- */}
        <div className="lg:col-span-7">
          
          {activeTab === 'conteudo' ? (
            <div className="space-y-10">
              {!contentResult && !loadingContent ? (
                <div className="h-full min-h-[600px] bg-white rounded-[4rem] border border-gray-200 p-16 flex flex-col items-center justify-center text-center opacity-30 italic">
                  <Sparkles className="w-24 h-24 mb-8 text-rose-500" />
                  <p className="text-3xl font-black uppercase tracking-widest">Plano de Conteúdo</p>
                  <p className="text-lg font-medium max-w-sm mt-4">Preencha o setup estratégico para receber seu pacote de marketing.</p>
                </div>
              ) : loadingContent ? (
                <div className="h-full min-h-[600px] bg-white rounded-[4rem] border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
                  <div className="relative">
                    <Loader2 className="w-24 h-24 text-rose-500 animate-spin mb-8" />
                    <Sparkles className="absolute top-0 right-0 w-8 h-8 text-rose-400 animate-pulse" />
                  </div>
                  <p className="text-3xl font-black text-[#111111] uppercase italic">A LÚMEN está arquitetando sua estratégia...</p>
                </div>
              ) : contentResult && (
                <div className="space-y-10 animate-in zoom-in-95 duration-500">
                  <div className="bg-white rounded-[4rem] border border-gray-200 p-12 shadow-2xl space-y-12">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-10">
                       <h3 className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter">Diretrizes de Conteúdo</h3>
                       <div className="px-6 py-2 bg-rose-50 text-rose-500 rounded-full text-xs font-black uppercase border border-rose-100 italic tracking-widest">PRO DELIVERY</div>
                    </div>
                    
                    <div className="bg-rose-50/40 p-10 rounded-[2.5rem] border border-rose-100 flex gap-8 items-start relative group overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                       <Camera className="w-14 h-14 text-rose-500 shrink-0 mt-1" />
                       <div className="space-y-2 relative z-10">
                          <p className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Ideia para o Post (Visual)</p>
                          <p className="text-2xl font-bold text-gray-800 italic leading-tight">"{contentResult.visualIdea}"</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legenda para Feed</p>
                            <button onClick={() => copyContent(contentResult.captionMedium, 'm')} className="text-rose-500 hover:scale-110 transition-transform">
                                {copiedKey === 'm' ? <Check className="w-5 h-5"/> : <Copy className="w-5 h-5"/>}
                            </button>
                          </div>
                          <div className="bg-gray-50 p-8 rounded-3xl text-base italic font-medium leading-relaxed border border-gray-100">{contentResult.captionMedium}</div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CTA (Chamada para Ação)</p>
                            <button onClick={() => copyContent(contentResult.cta, 'cta')} className="text-rose-500 hover:scale-110 transition-transform">
                                {copiedKey === 'cta' ? <Check className="w-5 h-5"/> : <Copy className="w-5 h-5"/>}
                            </button>
                          </div>
                          <div className="bg-black text-white p-8 rounded-3xl font-black italic uppercase text-center tracking-tight text-xl leading-none flex items-center justify-center min-h-[120px] shadow-xl">{contentResult.cta}</div>
                       </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-100">
                       <div className="flex items-center gap-3">
                          <Hash className="w-5 h-5 text-gray-400" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tags Estratégicas</p>
                       </div>
                       <div className="flex flex-wrap gap-3">
                          {contentResult.hashtags.map((h, i) => (
                            <span key={i} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-default">
                               #{h.replace('#','')}
                            </span>
                          ))}
                       </div>
                    </div>

                    <div className="p-8 bg-violet-50 rounded-[2.5rem] border border-violet-100 flex items-start gap-5 italic text-violet-800 font-medium">
                        <Lightbulb className="w-7 h-7 shrink-0 text-violet-500 mt-1" />
                        <div>
                           <p className="text-xs font-black text-violet-600 uppercase mb-1">Adaptação para Stories</p>
                           <p className="text-lg leading-snug">"{contentResult.storyAdaptation}"</p>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-10 animate-in zoom-in-95">
              <div className="min-h-[750px] bg-white rounded-[4.5rem] border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl p-6 ring-1 ring-black/5">
                <canvas ref={canvasRef} className="hidden" />
                
                {loadingBG ? (
                  <div className="text-center space-y-8">
                    <div className="relative inline-block">
                        <Loader2 className="w-20 h-20 text-emerald-500 animate-spin mx-auto" />
                        <ImageIcon className="absolute inset-0 m-auto w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter">Compondo Arte Base...</p>
                        <p className="text-gray-400 font-medium mt-2">Criando o visual perfeito sem poluição.</p>
                    </div>
                  </div>
                ) : finalArtImage ? (
                  <div className={`w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-500 ${artFormat === 'story' ? 'max-w-[420px]' : 'max-w-[650px]'}`}>
                    <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl border-8 border-white">
                      <img src={finalArtImage} alt="Final Universal Art" className="w-full h-auto object-contain" />
                      
                      {loadingArtText && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xl flex flex-col items-center justify-center text-white gap-6">
                           <Loader2 className="animate-spin w-12 h-12" />
                           <p className="font-black uppercase italic tracking-[0.2em] text-sm">Redigindo Mensagem...</p>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <a href={finalArtImage} download={`lumen-arte-${artCategory}.png`} className="p-10 bg-white rounded-[2.5rem] text-[#111111] shadow-2xl hover:scale-110 transition-transform font-black text-2xl flex items-center gap-4">
                          <Download className="w-10 h-10 text-emerald-500" /> DOWNLOAD HQ
                        </a>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
                      <button onClick={handleSaveArt} className="py-6 bg-[#111111] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black shadow-xl active:scale-95 transition-all">
                        <Package className="w-6 h-6 text-emerald-400" /> Guardar no Dossiê
                      </button>
                      <a href={finalArtImage} download="lumen-arte-visual.png" className="py-6 bg-white text-[#111111] rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 shadow-sm active:scale-95 transition-all">
                        <Download className="w-6 h-6 text-violet-500" /> Exportar PNG
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-8 opacity-20 italic">
                    <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-3xl font-black uppercase tracking-[0.3em]">Artes Universais</p>
                        <p className="text-lg font-medium mt-2">Seu visual final será renderizado aqui.</p>
                    </div>
                  </div>
                )}
              </div>

              {finalArtImage && (
                <div className="bg-emerald-50 p-10 rounded-[3.5rem] border border-emerald-100 flex items-start gap-6 italic text-emerald-800 font-medium leading-relaxed animate-in slide-in-from-bottom-6">
                  <Sparkles className="w-8 h-8 shrink-0 mt-1 text-emerald-500" />
                  <p className="text-lg">O sistema de **Artes Universais** garante legibilidade total ao renderizar o texto via código sobre o fundo visual. Isso evita os erros tipográficos comuns em IAs de imagem e entrega um design pronto para publicação.</p>
                </div>
              )}
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}

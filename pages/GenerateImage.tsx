import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Sparkles, Download, Loader2, Hexagon, ChevronDown, Palette, FileText, AlertCircle, Camera } from 'lucide-react';
import { generateImage, generateJson } from '../geminiService';
import { CreativeItem } from '../types';
import { Type } from '@google/genai';

interface Props {
  type: 'image' | 'logo';
  onSave: (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => void;
}

const LOGO_TYPES = [
  { id: 'wordmark', title: 'Wordmark', desc: 'Apenas tipografia' },
  { id: 'simbolo', title: 'Símbolo', desc: 'Ícone representativo' },
  { id: 'combinacao', title: 'Combinação', desc: 'Símbolo + texto' },
  { id: 'emblema', title: 'Emblema', desc: 'Texto dentro de forma' },
  { id: 'abstrato', title: 'Abstrato', desc: 'Formas geométricas' },
];

const STYLES = [
  'Moderno', 'Minimalista', 'Ousado', 'Elegante', 'Divertido', 'Corporativo', 'Jovem', 'Natural', 'Premium', 'Retrô'
];

export default function GenerateImage({ type, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [logoInfo, setLogoInfo] = useState<{ description: string, palette: any[] } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('Nenhum');
  const [objective, setObjective] = useState('Conceito visual');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('');
  const [segment, setSegment] = useState('');
  const [selectedType, setSelectedType] = useState('combinacao');
  const [additionalDesc, setAdditionalDesc] = useState('');

  useEffect(() => {
    setResult(null);
    setLogoInfo(null);
  }, [type]);

  const toggleStyle = (s: string) => {
    if (selectedStyles.includes(s)) {
      setSelectedStyles(selectedStyles.filter(item => item !== s));
    } else {
      setSelectedStyles([...selectedStyles, s]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setLogoInfo(null);

    let finalPrompt = "";
    if (type === 'logo') {
      const typeObj = LOGO_TYPES.find(t => t.id === selectedType);
      finalPrompt = `CRITICAL: Professional ${typeObj?.title} style logo for "${brandName}". Segment: ${segment}. Styles: ${selectedStyles.join(', ')}. Details: ${additionalDesc}. FLAT DESIGN, NO SHADOWS, minimalist, white background. High contrast for branding.`;
    } else {
      finalPrompt = `Image: ${prompt}. Context: ${context}. Objective: ${objective}. Styles: ${selectedStyles.join(', ')}. Professional high-res asset.`;
    }

    try {
      const imageUrl = await generateImage(finalPrompt, aspectRatio, referenceImage || undefined);
      setResult(imageUrl);

      if (type === 'logo') {
        const schema = {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Technical concept description of the logo design (ALWAYS PT-BR)" },
            palette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  rgb: { type: Type.STRING },
                  cmyk: { type: Type.STRING },
                  pantone: { type: Type.STRING }
                },
                required: ["name", "hex", "rgb", "cmyk", "pantone"]
              }
            }
          },
          required: ["description", "palette"]
        };
        const info = await generateJson<any>(`Analise o contexto do logo para "${brandName}" (${segment}). Forneça uma descrição de conceito técnico EM PORTUGUÊS e uma paleta de 3 cores com HEX, RGB, CMYK e PANTONE.`, schema);
        setLogoInfo(info);
      }

      onSave({
        id: `img-${Date.now()}`,
        type,
        content: imageUrl,
        timestamp: Date.now(),
        title: type === 'logo' ? brandName : (prompt.substring(0, 30) + '...')
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLogoInfo = () => {
    if (!logoInfo) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1000;
    const padding = 60;
    
    // Configurações de texto para cálculo de altura
    const textFontSize = 24;
    const lineHeight = 36;
    ctx.font = `italic ${textFontSize}px Inter, sans-serif`;
    
    const words = logoInfo.description.split(' ');
    let lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
        const metrics = ctx.measureText(currentLine + word + ' ');
        if (metrics.width > width - (padding * 2)) {
            lines.push(currentLine);
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    lines.push(currentLine);

    const headerHeight = 180;
    const conceptTextHeight = lines.length * lineHeight;
    const paletteSectionHeight = 450;
    const totalHeight = headerHeight + conceptTextHeight + paletteSectionHeight + 150;

    canvas.width = width;
    canvas.height = totalHeight;

    // Fundo Branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, totalHeight);

    // Cabeçalho Roxo
    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(0, 0, width, 140);

    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 italic 38px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('DOSSIÊ TÉCNICO: ' + brandName.toUpperCase(), padding, 70);

    // Seção Conceito
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#7C3AED';
    ctx.font = '900 uppercase 14px Inter, sans-serif';
    ctx.fillText('CONCEITO TÉCNICO ESTRUTURAL', padding, 180);

    ctx.fillStyle = '#111111';
    ctx.font = `italic ${textFontSize}px Inter, sans-serif`;
    let y = 220;
    lines.forEach(line => {
        ctx.fillText(line, padding, y);
        y += lineHeight;
    });

    // Seção Paleta
    y += 80;
    ctx.fillStyle = '#7C3AED';
    ctx.font = '900 uppercase 14px Inter, sans-serif';
    ctx.fillText('SUGESTÃO CROMÁTICA E ESPECIFICAÇÕES', padding, y);
    
    y += 50;
    const itemWidth = (width - (padding * 2) - 60) / 3;
    logoInfo.palette.forEach((c: any, i: number) => {
        const startX = padding + (i * (itemWidth + 30));
        
        // Bloco de Cor
        ctx.fillStyle = c.hex;
        ctx.beginPath();
        ctx.roundRect(startX, y, itemWidth, 140, 30);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Informações Técnicas
        ctx.fillStyle = '#111111';
        ctx.font = '900 22px Inter, sans-serif';
        ctx.fillText(c.name.toUpperCase(), startX, y + 170);
        
        ctx.font = '900 20px Inter, sans-serif';
        ctx.fillStyle = '#7C3AED';
        ctx.fillText(c.hex.toUpperCase(), startX, y + 205);
        
        ctx.fillStyle = '#6B7280';
        ctx.font = '700 14px Inter, sans-serif';
        ctx.fillText(`RGB: ${c.rgb}`, startX, y + 245);
        ctx.fillText(`CMYK: ${c.cmyk}`, startX, y + 270);
        ctx.fillText(`PANTONE: ${c.pantone}`, startX, y + 295);
    });

    // Rodapé
    ctx.fillStyle = 'rgba(124, 58, 237, 0.2)';
    ctx.font = '900 uppercase 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LÚMEN CREATIVE STUDIO AI — SISTEMA DE DESIGN INTELIGENTE', width / 2, totalHeight - 50);

    const link = document.createElement('a');
    link.download = `dossie-tecnico-${brandName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-[#111111]">{type === 'image' ? 'Gerar Imagens' : 'Design de Logos'}</h2>
        <p className="text-xl text-gray-700 font-medium">{type === 'image' ? 'Crie conceitos visuais e referências com IA' : 'Crie marcas profissionais em segundos'}</p>
      </div>

      {type === 'logo' && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center gap-4 text-amber-800">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <p className="font-bold">Nota: Os logos gerados deverão passar por uma análise profissional antes do uso. Este resultado é uma referência visual de alta fidelidade, não a arte final vetorial definitiva.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm space-y-10">
          
          <div className="space-y-4">
            <label className="block text-base font-bold text-[#111111] uppercase tracking-wider">
              {type === 'image' ? 'Descrição da imagem' : 'Nome da marca *'}
            </label>
            {type === 'image' ? (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Uma composição abstrata em tons de azul e dourado..."
                className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-5 h-40 focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all resize-none text-base text-[#111111] font-medium"
              />
            ) : (
              <input 
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ex: Nova Café"
                className="w-full bg-gray-50 border border-gray-200 rounded-[1.25rem] px-6 py-5 focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all text-base text-[#111111] font-bold"
              />
            )}
          </div>

          {type === 'logo' && (
            <div className="space-y-4">
              <label className="block text-base font-bold text-[#111111] uppercase tracking-wider">Segmento</label>
              <input 
                type="text"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Ex: Cafeteria artesanal"
                className="w-full bg-gray-50 border border-gray-200 rounded-[1.25rem] px-6 py-5 focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all text-base text-[#111111] font-bold"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">{type === 'image' ? 'Contexto' : 'Tipo de Logo'}</label>
              <div className="relative">
                <select
                  value={type === 'image' ? context : selectedType}
                  onChange={(e) => type === 'image' ? setContext(e.target.value) : setSelectedType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-base text-[#111111] font-bold focus:ring-2 focus:ring-[#7C3AED] outline-none appearance-none transition-all"
                >
                  {type === 'image' ? (
                    <>
                      <option>Nenhum</option>
                      <option>Publicidade</option>
                      <option>Editorial</option>
                      <option>Social Media</option>
                    </>
                  ) : (
                    LOGO_TYPES.map(t => <option key={t.id} value={t.id}>{t.title}</option>)
                  )}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Objetivo</label>
              <div className="relative">
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-base text-[#111111] font-bold focus:ring-2 focus:ring-[#7C3AED] outline-none appearance-none transition-all"
                >
                  <option>Conceito visual</option>
                  <option>Finalização</option>
                  <option>Referência</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block text-base font-bold text-[#111111] uppercase tracking-wider">Estilos</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-sm ${
                    selectedStyles.includes(style)
                      ? 'bg-[#7C3AED] text-white border-transparent'
                      : 'bg-white text-[#111111] border-gray-100 hover:border-violet-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || (type === 'logo' && !brandName.trim()) || (type === 'image' && !prompt.trim())}
            className="w-full py-6 bg-[#111111] text-white rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : (type === 'image' ? <Sparkles className="w-7 h-7" /> : <Hexagon className="w-7 h-7" />)}
            {type === 'image' ? 'Gerar Imagem' : 'Gerar Logo'}
          </button>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="min-h-[600px] bg-white rounded-[3.5rem] border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-lg">
            {loading ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Loader2 className="w-12 h-12 text-[#7C3AED] animate-spin" />
                </div>
                <p className="font-black text-[#111111] text-2xl">Criando sua visão...</p>
              </div>
            ) : result ? (
              <div className="w-full h-full flex flex-col animate-in zoom-in-95 duration-500">
                <div className="relative flex-1">
                  <img src={result} alt="AI Result" className="w-full h-full object-contain p-10" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <a href={result} download="lumen-export.png" className="p-8 bg-white rounded-3xl text-[#7C3AED] shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 font-black text-lg">
                      <Download className="w-8 h-8" /> Baixar HQ (PNG)
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 max-w-sm opacity-20 italic">
                <Sparkles className="w-24 h-24 mx-auto" />
                <p className="text-2xl font-black uppercase tracking-widest">Aguardando Briefing</p>
              </div>
            )}
          </div>

          {logoInfo && !loading && type === 'logo' && (
            <div className="bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 ring-1 ring-black/5">
               <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-black text-violet-600 uppercase tracking-[0.2em]"><FileText className="w-4 h-4" /> Conceito Técnico</h4>
                    <p className="text-lg text-gray-700 font-medium italic leading-relaxed">"{logoInfo.description}"</p>
                  </div>
                  <button 
                    onClick={handleDownloadLogoInfo}
                    className="p-4 bg-gray-50 text-gray-400 hover:text-violet-600 rounded-2xl transition-all shadow-sm flex flex-col items-center gap-1 group active:scale-95"
                    title="Baixar Dossier Técnico"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase">Baixar JPG</span>
                  </button>
               </div>
               <div className="space-y-4">
                 <h4 className="flex items-center gap-2 text-xs font-black text-violet-600 uppercase tracking-[0.2em]"><Palette className="w-4 h-4" /> Sugestão Cromática</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {logoInfo.palette.map((c: any, i: number) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg shadow-sm" style={{ backgroundColor: c.hex }} />
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">{c.name}</p>
                            <p className="text-base font-bold font-mono text-gray-800 uppercase">{c.hex}</p>
                          </div>
                        </div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase flex flex-col gap-1">
                          <span>RGB: {c.rgb}</span>
                          <span>CMYK: {c.cmyk}</span>
                          <span>PANTONE: {c.pantone}</span>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
               <div className="pt-4 text-center">
                 <p className="text-[10px] text-gray-400 font-bold italic">Use as cores acima como guia técnico para produção. Baixe em PNG e use ferramentas como Adobe Illustrator para vetorizar em SVG/EPS.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

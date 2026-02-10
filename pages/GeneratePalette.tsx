import React, { useState, useEffect, useRef } from 'react';
import { Palette, Sparkles, Loader2, Copy, Check, Download, ChevronDown } from 'lucide-react';
import { generateJson } from '../geminiService';
import { Type } from '@google/genai';
import { CreativeItem, Project } from '../types';

const CONCEPTS = [
  { id: 'minimalista', title: 'Minimalista' },
  { id: 'moderno', title: 'Moderno' },
  { id: 'luxo', title: 'Luxo' },
  { id: 'calma', title: 'Calma' },
  { id: 'clareza', title: 'Clareza' },
  { id: 'vibrante', title: 'Vibrante' },
  { id: 'tecnologico', title: 'Tecnológico' },
  { id: 'premium', title: 'Premium' },
  { id: 'jovem', title: 'Jovem' },
  { id: 'retro', title: 'Retrô' },
  { id: 'vintage', title: 'Vintage' },
];

export default function GeneratePalette({ onSave }: { onSave: (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => void }) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [briefing, setBriefing] = useState('');
  const [colorCount, setColorCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Fixed: Use consistent local storage key and avoid non-existent CURRENT_USER_ID
  useEffect(() => {
    const saved = localStorage.getItem('lumen_projects_local');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  const handleGenerate = async () => {
    if (!briefing.trim() && selectedStyles.length === 0) {
      alert("Defina um conceito ou briefing.");
      return;
    }
    setLoading(true);

    const schema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        colors: { 
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
      required: ["name", "colors", "description"]
    };

    const prompt = `Gere uma paleta de cores profissional com EXATAMENTE ${colorCount} cores harmônicas. 
    Contexto: ${briefing}. Estilos: ${selectedStyles.join(', ')}. 
    Para cada cor forneça: Nome, HEX, RGB, CMYK, e o código PANTONE aproximado (ex: Pantone Solid Coated). 
    Saída em Português. Garanta qualidade de branding high-end.`;

    try {
      const result = await generateJson<any>(prompt, schema);
      setPalette(result);
      onSave({
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'palette',
        content: result,
        timestamp: Date.now(),
        title: result.name || "Nova Paleta",
        projectId: selectedProjectId || undefined
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar paleta.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJPG = () => {
    if (!palette) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution: 1920x1080
    canvas.width = 1920;
    canvas.height = 1080;

    // Background white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = palette.colors;
    const n = colors.length;
    const blockWidth = canvas.width / n;
    const blockHeight = canvas.height * 0.65;

    colors.forEach((color: any, i: number) => {
      // Draw Color Block
      ctx.fillStyle = color.hex;
      ctx.fillRect(i * blockWidth, 0, blockWidth, blockHeight);

      // Draw Info Block Below
      const infoY = blockHeight + 70;
      const centerX = i * blockWidth + blockWidth / 2;
      
      // Name
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 44px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(color.name.toUpperCase(), centerX, infoY);

      // HEX
      ctx.fillStyle = '#7C3AED';
      ctx.font = 'bold 38px Inter, sans-serif';
      ctx.fillText(color.hex.toUpperCase(), centerX, infoY + 60);

      // Technical Specs
      ctx.fillStyle = '#666666';
      ctx.font = '500 24px Inter, sans-serif';
      ctx.fillText(`RGB: ${color.rgb}`, centerX, infoY + 110);
      ctx.fillText(`CMYK: ${color.cmyk}`, centerX, infoY + 150);
      
      // PANTONE (MANDATORY)
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText(`PANTONE: ${color.pantone}`, centerX, infoY + 210);
    });

    // Branding Watermark
    ctx.fillStyle = '#7C3AED';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('LÚMEN Creative AI', canvas.width - 50, canvas.height - 50);

    // Download
    const link = document.createElement('a');
    link.download = `paleta-${palette.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-2 print:hidden">
        <h2 className="text-4xl font-black text-[#111111] uppercase tracking-tighter italic leading-none">Gerar Paletas</h2>
        <p className="text-xl text-gray-700 font-medium">Harmonia cromática e controle técnico preciso (RGB, CMYK e Pantone)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm space-y-10 print:hidden ring-1 ring-black/5">
          <div className="space-y-5">
            <label className="block text-base font-bold text-[#111111] uppercase tracking-wider">QUANTIDADE DE CORES</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button 
                  key={n} 
                  onClick={() => setColorCount(n)}
                  className={`flex-1 py-4 rounded-2xl font-black text-xl transition-all ${colorCount === n ? 'bg-[#7C3AED] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <label className="block text-base font-bold text-[#111111] uppercase tracking-wider">ESTILOS / CONCEITOS</label>
             <div className="grid grid-cols-2 gap-2">
                {CONCEPTS.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => toggleStyle(c.id)}
                    className={`py-3 px-4 rounded-xl font-bold text-sm border transition-all ${selectedStyles.includes(c.id) ? 'bg-[#7C3AED] text-white border-transparent shadow-lg' : 'bg-white text-gray-600 border-gray-100 hover:border-violet-200 shadow-sm'}`}
                  >
                    {c.title}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
            <label className="block text-base font-bold text-[#111111] uppercase tracking-wider">BRIEFING / CONCEITO ADICIONAL</label>
            <textarea 
              value={briefing} 
              onChange={e => setBriefing(e.target.value)}
              className="w-full h-40 bg-gray-50 border border-gray-200 rounded-[2rem] px-6 py-5 text-base text-[#111111] font-medium focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all shadow-inner"
              placeholder="Ex: Cores para uma marca de café premium, luxo e clareza..."
            />
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full py-6 bg-[#111111] text-white rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 shadow-lg hover:bg-black transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-7 h-7" /> : <Palette className="w-7 h-7" />} Gerar {colorCount} {colorCount === 1 ? 'Cor' : 'Cores'}
          </button>
        </div>

        <div className="lg:col-span-7 bg-white rounded-[3.5rem] border border-gray-200 p-10 flex flex-col shadow-lg min-h-[600px] print:border-none print:shadow-none print:p-0 ring-1 ring-black/5">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-16 h-16 text-[#7C3AED] animate-spin" />
              <p className="text-2xl font-black text-[#111111] uppercase tracking-widest italic">Calculando Harmonias Técnicas...</p>
            </div>
          ) : palette ? (
            <div className="w-full space-y-10 animate-in zoom-in-95">
              <div className="flex h-64 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white print:h-40">
                {palette.colors.map((c: any, i: number) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {palette.colors.map((c: any, i: number) => (
                  <div key={i} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-200 flex flex-col gap-4 group hover:bg-white transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl shadow-md border-2 border-white flex-shrink-0" style={{ backgroundColor: c.hex }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-black text-[#111111] truncate uppercase">{c.name}</p>
                        <p className="text-xl font-mono text-[#7C3AED] uppercase font-black">{c.hex}</p>
                      </div>
                      <button onClick={() => copyToClipboard(c.hex, `c-${i}`)} className="p-3 text-gray-400 hover:text-[#7C3AED] print:hidden">
                        {copiedKey === `c-${i}` ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                      <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-1 font-black">RGB</p>
                        <span className="font-mono">{c.rgb}</span>
                      </div>
                      <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-1 font-black">CMYK</p>
                        <span className="font-mono">{c.cmyk}</span>
                      </div>
                      <div className="bg-violet-100/50 p-3 rounded-xl border border-violet-100 col-span-2 flex justify-between items-center">
                        <p className="text-[10px] text-violet-600 font-black uppercase tracking-widest">Pantone Aproximado</p>
                        <span className="font-black text-[#111111] text-xs">{c.pantone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 print:hidden">
                <button 
                  onClick={handleDownloadJPG}
                  className="w-full py-5 bg-[#111111] text-white rounded-2xl text-lg font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
                >
                  <Download className="w-6 h-6" /> Baixar Paleta (JPG)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <Palette className="w-24 h-24 text-gray-300" />
              <p className="text-2xl text-gray-500 font-black uppercase tracking-widest italic">Aguardando Briefing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

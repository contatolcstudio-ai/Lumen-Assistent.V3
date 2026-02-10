import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, ChevronDown, ImageIcon, Download, LayoutGrid, FileText } from 'lucide-react';
import { generateImage } from '../geminiService';
import { CreativeItem } from '../types';

export default function GenerateNames({ onSave }: { onSave: (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => void }) {
  const [visualName, setVisualName] = useState('');
  const [visualVibe, setVisualVibe] = useState('Divertido/Cartoon');
  const [visualDescription, setVisualDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!visualName.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const vibesMap: Record<string, string> = {
        "Divertido/Cartoon": "Bold Cartoon/Snack style with thick outlines and glossy volume",
        "Street/Urbano": "Raw Street/Graffiti aesthetic with custom aggressive strokes",
        "Premium/Luxo": "High-End Premium metallic 3D lettering with luxury reflections",
        "Experimental": "Experimental Liquid/Dripping typography with high-contrast color shifts",
        "Retrô/Vintage": "Retro Neon 80s style with deep extrusions and vibrant glow",
        "Nenhum": "Clean professional custom wordmark design"
      };

      const baseStyle = vibesMap[visualVibe] || vibesMap["Nenhum"];
      
      const styles = [
        baseStyle,
        `${baseStyle} with dramatic heavy weights`,
        `${baseStyle} focused on geometric balance`,
        `${baseStyle} featuring futuristic sharp edges`,
        `${baseStyle} using elegant thin-to-thick variations`,
        `${baseStyle} with layered depth and professional shadows`
      ];

      const promises = styles.map(styleDesc => 
        generateImage(`
          CRITICAL: Create a world-class professional LETTERING WORDMARK for "${visualName}".
          BASE STYLE: ${styleDesc}.
          PERSONALITY: ${visualVibe}.
          ADDITIONAL BRIEFING: ${visualDescription}.
          RULES: 
          - Pure white background (#FFFFFF).
          - Use custom-drawn letterforms, NOT standard fonts.
          - High impact, packaging/storefront quality.
          - Bold outlines, 3D depth, and professional gradients/shadows allowed.
          - Design must grab attention from a distance.
        `)
      );

      const images = await Promise.all(promises);
      setResults(images);
      
      onSave({ 
        id: `v-${Date.now()}`, 
        type: 'visual_style', 
        content: images[0], 
        timestamp: Date.now(), 
        title: `Lettering: ${visualName}` 
      });
    } catch (err) { 
      console.error(err); 
      alert("Erro ao gerar conceitos visuais.");
    } finally { 
      setLoading(false); 
    }
  };

  const copy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-black text-[#111111] uppercase tracking-tighter italic leading-none">Lettering de Marca</h2>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">Wordmarks com personalidade forte e impacto visual absoluto</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[3rem] p-10 shadow-sm space-y-10 ring-1 ring-black/5">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-4">
            <label className="block text-sm font-black text-gray-400 uppercase tracking-[0.3em] text-center">TEXTO DA MARCA</label>
            <input 
              value={visualName} 
              onChange={e => setVisualName(e.target.value)} 
              placeholder="NOME DA MARCA" 
              className="w-full bg-gray-50 border border-gray-200 rounded-[2rem] px-10 py-8 text-3xl font-black text-center text-[#111111] focus:ring-4 focus:ring-violet-500/10 outline-none transition-all shadow-inner" 
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              <FileText className="w-3.5 h-3.5" /> Briefing Detalhado (Como você quer?)
            </label>
            <textarea 
              value={visualDescription}
              onChange={e => setVisualDescription(e.target.value)}
              placeholder="Ex: Cantos arredondados, inclinação para direita, estilo metálico, aparência de giz..."
              className="w-full h-32 bg-gray-50 border border-gray-200 rounded-[1.5rem] px-8 py-6 text-lg font-medium italic outline-none focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all shadow-inner resize-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">VIBE DESEJADA</label>
              <div className="relative">
                <select value={visualVibe} onChange={e => setVisualVibe(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-base appearance-none outline-none font-black text-[#111111] shadow-inner focus:ring-2 focus:ring-violet-100">
                  <option>Divertido/Cartoon</option>
                  <option>Street/Urbano</option>
                  <option>Premium/Luxo</option>
                  <option>Experimental</option>
                  <option>Retrô/Vintage</option>
                  <option>Nenhum</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={loading || !visualName.trim()} 
              className="w-full py-6 bg-[#111111] text-white rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 hover:bg-black shadow-xl transition-all disabled:opacity-30 active:scale-95"
            >
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Sparkles className="w-7 h-7" />}
              Gerar 6 Variações Ousadas
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-10 border-t border-gray-50">
            {results.map((img, i) => (
              <div key={i} className="group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ring-1 ring-black/5">
                <div className="aspect-square relative overflow-hidden bg-white">
                  <img src={img} alt={`Opção ${i + 1}`} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm gap-4">
                    <a href={img} download={`lettering-${visualName}-${i+1}.png`} className="p-4 bg-white rounded-2xl text-[#111111] shadow-2xl hover:scale-110 transition-transform font-black flex items-center gap-2 text-sm uppercase">
                      <Download className="w-5 h-5" /> Baixar HQ PNG
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="py-24 text-center space-y-8">
            <div className="relative inline-block">
               <Loader2 className="w-24 h-24 text-violet-600 animate-spin mx-auto" />
               <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-violet-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-black text-[#111111] uppercase tracking-tighter italic">Desenhando Formas Ousadas...</p>
              <p className="text-gray-400 font-medium">A LÚMEN está calculando o equilíbrio visual perfeito para sua marca.</p>
            </div>
          </div>
        )}
        
        {!loading && results.length === 0 && (
          <div className="py-24 text-center opacity-20 space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-gray-200">
               <LayoutGrid className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-xl font-black uppercase tracking-[0.4em]">Seu Grid Criativo</p>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Sparkles, Download, Loader2, Upload, ChevronDown } from 'lucide-react';
import { generateImage } from '../geminiService';
import { CreativeItem, Project } from '../types';

export default function GenerateMockup({ onSave }: { onSave: (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mockupDescription, setMockupDescription] = useState('Vamos utilizar a arte final para gerar um mockup profissional de forma otimizada e melhor para que sempre tenhamos o resultado esperado.');
  const [realism, setRealism] = useState('Ultra-realista');
  const [backgroundType, setBackgroundType] = useState('Cenário Clean');
  const [artImage, setArtImage] = useState<string | null>(null);
  const [refImage, setRefImage] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const artRef = useRef<HTMLInputElement>(null);
  const refRef = useRef<HTMLInputElement>(null);

  // Fixed: Use consistent local storage key and avoid non-existent CURRENT_USER_ID
  useEffect(() => {
    const saved = localStorage.getItem('lumen_projects_local');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!artImage) {
      alert("Por favor, envie sua arte final.");
      return;
    }
    setLoading(true);
    setResult(null);

    const bgPrompt = backgroundType === 'Fundo Branco' ? 'Pure solid white background (#FFFFFF)' : 
                     backgroundType === 'Cenário Realista' ? 'Professional high-end retail/lifestyle scene' : 
                     'Professional high-end clean studio scene';
    
    const prompt = `
      CRITICAL INSTRUCTION - ZERO DEVIATION: Generate an ultra-realistic professional mockup using the PROVIDED IMAGE as the source artwork.
      
      RULES:
      - 100% ARTWORK FIDELITY: Apply the art exactly as provided. NO redesigning.
      - MAPPING: Perfect 3D surface wrapping.
      - SUBJECT: ${mockupDescription}.
      - REALISM: ${realism}. Sharp textures and professional shadows.
      - ENVIRONMENT: ${bgPrompt}.
    `;

    try {
      const imageUrl = await generateImage(prompt, "1:1", artImage);
      setResult(imageUrl);
      onSave({
        id: `m-${Date.now()}`,
        type: 'mockup',
        content: imageUrl,
        timestamp: Date.now(),
        title: `Mockup: ${mockupDescription.substring(0, 20)}...`,
        projectId: selectedProjectId || undefined
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar mockup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-black text-[#111111]">Gerar Mockups Profissionais</h2>
        <p className="text-xl text-gray-700 font-medium">Realismo comercial e impacto visual para o mercado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm space-y-10">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">ARTE FINAL *</label>
                <div 
                  onClick={() => artRef.current?.click()}
                  className="h-48 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#7C3AED] hover:bg-violet-50 transition-all overflow-hidden relative group"
                >
                  {artImage ? <img src={artImage} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400 group-hover:text-violet-500 transition-colors"><Upload className="w-10 h-10 mx-auto mb-3" /><span className="text-base font-bold text-center px-4">Upload Arte</span></div>}
                  <input type="file" ref={artRef} onChange={(e) => handleUpload(e, setArtImage)} className="hidden" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">REFERÊNCIA (OPC)</label>
                <div 
                  onClick={() => refRef.current?.click()}
                  className="h-48 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#7C3AED] hover:bg-violet-50 transition-all overflow-hidden relative group"
                >
                  {refImage ? <img src={refImage} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400 group-hover:text-violet-500 transition-colors"><ImageIcon className="w-10 h-10 mx-auto mb-3" /><span className="text-base font-bold text-center px-4">Guia Visual</span></div>}
                  <input type="file" ref={refRef} onChange={(e) => handleUpload(e, setRefImage)} className="hidden" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">TIPO DE MOCKUP / BRIEFING</label>
              <textarea 
                value={mockupDescription}
                onChange={e => setMockupDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-lg font-medium focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all shadow-inner h-32 resize-none italic"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-widest ml-1">REALISMO</label>
                <div className="relative">
                  <select value={realism} onChange={e => setRealism(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-5 text-base font-black text-[#111111] appearance-none outline-none focus:ring-2 focus:ring-[#7C3AED]">
                    <option>Realista</option>
                    <option>Ultra-realista</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-widest ml-1">FUNDO</label>
                <div className="relative">
                  <select value={backgroundType} onChange={e => setBackgroundType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-5 text-base font-black text-[#111111] appearance-none outline-none focus:ring-2 focus:ring-[#7C3AED]">
                    <option>Cenário Clean</option>
                    <option>Fundo Branco</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={loading || !artImage}
              className={`w-full py-6 bg-[#111111] text-white rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 shadow-2xl transition-all ${loading || !artImage ? 'opacity-50' : 'hover:bg-black'}`}
            >
              {loading ? <Loader2 className="animate-spin w-7 h-7" /> : <Sparkles className="w-7 h-7" />} Renderizar Mockup
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 h-full min-h-[600px] bg-white rounded-[4rem] border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-xl">
          {loading ? (
            <div className="text-center space-y-6">
              <Loader2 className="w-16 h-16 text-[#7C3AED] animate-spin mx-auto" />
              <p className="text-3xl font-black text-[#111111]">Fidelidade Total...</p>
            </div>
          ) : result ? (
            <img src={result} className="w-full h-full object-contain" />
          ) : (
            <div className="text-center space-y-6 opacity-30 max-w-sm">
               <ImageIcon className="w-24 h-24 mx-auto text-gray-300" />
               <p className="text-2xl text-gray-500 font-black italic uppercase">Área de Visualização</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

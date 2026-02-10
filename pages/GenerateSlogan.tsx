
import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Quote } from 'lucide-react';
import { generateJson } from '../geminiService';
import { Type } from '@google/genai';
import { CreativeItem } from '../types';

const TONES = [
  { id: 'institucional', title: 'Institucional', desc: 'Sério e profissional' },
  { id: 'criativo', title: 'Criativo', desc: 'Original e inovador' },
  { id: 'ousado', title: 'Ousado', desc: 'Impactante e marcante' },
  { id: 'minimalista', title: 'Minimalista', desc: 'Simples e direto' },
  { id: 'amigavel', title: 'Amigável', desc: 'Próximo e acolhedor' },
  { id: 'premium', title: 'Premium', desc: 'Sofisticado e exclusivo' },
];

export default function GenerateSlogan({ onSave }: { onSave: (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => void }) {
  const [brandName, setBrandName] = useState('');
  const [segment, setSegment] = useState('');
  const [selectedTones, setSelectedTones] = useState<string[]>(['institucional']);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleTone = (id: string) => {
    if (selectedTones.includes(id)) {
      if (selectedTones.length > 1) setSelectedTones(selectedTones.filter(t => t !== id));
    } else {
      setSelectedTones([...selectedTones, id]);
    }
  };

  const handleGenerate = async () => {
    if (!brandName.trim()) return;
    setLoading(true);
    setResults([]);

    const schema = {
      type: Type.OBJECT,
      properties: {
        slogans: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 6 professional, short, high-impact slogans"
        }
      },
      required: ["slogans"]
    };

    const tonesText = selectedTones.map(t => TONES.find(x => x.id === t)?.title).join(', ');
    const prompt = `Generate 6 short, professional and high-impact slogans for "${brandName}". 
    Segment: ${segment}. Tones: ${tonesText}. Context: ${additionalInfo}. 
    Focus on short, institutional and catchy phrases in PT-BR.`;

    try {
      const data = await generateJson<{ slogans: string[] }>(prompt, schema);
      setResults(data.slogans);
      onSave({
        id: `s-${Date.now()}`, type: 'slogan', content: data.slogans, timestamp: Date.now(), title: `Slogans: ${brandName}`
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Gerar Slogan</h2>
        <p className="text-gray-600 font-medium">Crie slogans impactantes para suas marcas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800 ml-1">Nome da marca</label>
            <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Ex: LC STUDIO" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-bold" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800 ml-1">Segmento (opcional)</label>
            <input value={segment} onChange={e => setSegment(e.target.value)} placeholder="AGÊNCIA E GRÁFICA" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-bold" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-800 ml-1">Tom de voz</label><span className="text-[10px] text-violet-600 font-black uppercase tracking-widest">Escolher mais de um</span></div>
            <div className="grid grid-cols-2 gap-3">
              {TONES.map(t => (
                <button key={t.id} onClick={() => toggleTone(t.id)} className={`p-4 rounded-xl border text-left transition-all ${selectedTones.includes(t.id) ? 'border-[#7C3AED] bg-violet-50/50 ring-1 ring-[#7C3AED]' : 'border-gray-50 bg-white hover:border-gray-200 shadow-sm'}`}>
                  <p className={`text-sm font-bold ${selectedTones.includes(t.id) ? 'text-[#7C3AED]' : 'text-gray-900'}`}>{t.title}</p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight font-medium">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800 ml-1">Informações adicionais (opcional)</label>
            <textarea value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 h-28 resize-none text-sm font-medium" />
          </div>

          <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-[#A78BFA] text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-2 hover:bg-[#8B5CF6] shadow-lg shadow-violet-100 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Gerar slogans
          </button>
        </div>

        <div className="lg:col-span-7">
          <div className="h-full min-h-[550px] bg-white rounded-[2rem] border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
            {loading ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto"><Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" /></div>
                <p className="font-bold text-gray-900 text-lg">IA está refinando sua voz...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="w-full h-full p-10 space-y-4 overflow-y-auto animate-in fade-in slide-in-from-right-8">
                {results.map((s, i) => (
                  <div key={i} className="group bg-white border border-gray-200 p-6 rounded-[1.5rem] shadow-sm flex items-center justify-between gap-4 hover:border-violet-200 transition-all">
                    <p className="text-sm font-black text-gray-800 leading-tight flex-1">{s}</p>
                    <button onClick={() => copy(s, i)} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-violet-600 transition-colors">
                      {copiedIndex === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
                <div className="pt-8 text-center"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">6 sugestões exclusivas para {brandName}</p></div>
              </div>
            ) : (
              <div className="text-center space-y-4 px-10">
                <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center justify-center mx-auto text-gray-300 shadow-inner">
                  <Quote className="w-10 h-10" />
                </div>
                <p className="text-gray-400 font-bold">Seus slogans aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

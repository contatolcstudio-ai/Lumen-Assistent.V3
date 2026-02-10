
import React, { useState, useRef } from 'react';
import { Upload, Eraser, Download, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { generateImage } from '../geminiService';
import { CreativeItem } from '../types';

export default function RemoveBackground({ onSave }: { onSave: (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => void }) {
  const [loading, setLoading] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!sourceImage) return;
    setLoading(true);
    setResultImage(null);

    const prompt = "CRITICAL TASK: Extract the main subject from this image. Remove all background elements and replace with a pure, uniform, professional solid white background (#FFFFFF). Maintain high fidelity and sharp edges of the original subject.";

    try {
      const result = await generateImage(prompt, "1:1", sourceImage);
      setResultImage(result);
      onSave({
        id: `bgr-${Date.now()}`,
        type: 'bg_removal',
        content: result,
        timestamp: Date.now(),
        title: "Subject Extraction"
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao processar imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-[#111111]">Removedor de Fundo AI</h2>
        <p className="text-xl text-gray-700 font-medium">Recorte inteligente para ativos e fotos de produtos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm space-y-8 flex flex-col items-center justify-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-80 border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-violet-300 hover:bg-violet-50 transition-all overflow-hidden group"
          >
            {sourceImage ? (
              <img src={sourceImage} className="w-full h-full object-contain" />
            ) : (
              <div className="text-center space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-lg font-black uppercase tracking-widest">Enviar Imagem</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          </div>

          <button 
            onClick={handleRemoveBackground}
            disabled={loading || !sourceImage}
            className="w-full py-6 bg-[#111111] text-white rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Eraser />}
            Remover Fundo
          </button>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-[500px]">
          {loading ? (
            <div className="text-center space-y-6">
              <Loader2 className="w-16 h-16 text-[#7C3AED] animate-spin mx-auto" />
              <p className="text-2xl font-black">Isolando Objeto...</p>
            </div>
          ) : resultImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center group animate-in zoom-in-95 duration-500">
              <div className="flex-1 w-full bg-[#f0f0f0] rounded-3xl p-4 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <img src={resultImage} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
              </div>
              <div className="mt-8 flex gap-4 w-full">
                <a href={resultImage} download="lumen-cutout.png" className="flex-1 py-5 bg-[#7C3AED] text-white rounded-2xl text-center font-black flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" /> Baixar PNG
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30 space-y-4">
              <Sparkles className="w-16 h-16 mx-auto text-gray-300" />
              <p className="text-xl font-black">Seu recorte aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

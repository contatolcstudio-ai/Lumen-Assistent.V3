
import React from 'react';
import { Clock, ExternalLink, Trash2, AlertCircle, Trash, Download, FileText } from 'lucide-react';
import { CreativeItem } from '../types';

export default function History({ items, onDelete, onClearAll }: { 
  items: CreativeItem[], 
  onDelete: (id: string) => void,
  onClearAll: () => void
}) {
  const getExpirationText = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Expira em ${days} dia(s)`;
    return `Expira em ${hours} hora(s)`;
  };

  const translateType = (type: string) => {
    switch (type) {
      case 'budget': return 'ORÇAMENTO';
      case 'bg_removal': return 'REMOÇÃO DE FUNDO';
      case 'mockup': return 'MOCKUP';
      case 'palette': return 'PALETA';
      case 'image': return 'IMAGEM';
      case 'logo': return 'LOGO';
      case 'visual_style': return 'LETTERING';
      case 'name': return 'NOME';
      case 'slogan': return 'SLOGAN';
      default: return type.toUpperCase();
    }
  };

  const downloadItem = (item: CreativeItem) => {
    if (item.type === 'palette') {
      const p = item.content;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 1920;
        canvas.height = 1080;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const blockWidth = canvas.width / p.colors.length;
        p.colors.forEach((c: any, i: number) => {
          ctx.fillStyle = c.hex;
          ctx.fillRect(i * blockWidth, 0, blockWidth, 750);
          ctx.fillStyle = '#111111';
          ctx.font = 'bold 40px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(c.name.toUpperCase(), i * blockWidth + blockWidth / 2, 850);
          ctx.font = '30px Inter';
          ctx.fillText(c.hex.toUpperCase(), i * blockWidth + blockWidth / 2, 910);
        });
        const link = document.createElement('a');
        link.download = `paleta-${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
      }
    } else if (typeof item.content === 'string' && item.content.startsWith('data:image')) {
      const link = document.createElement('a');
      link.href = item.content;
      link.download = `${item.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-[#111111]">Histórico de Criações</h2>
          <p className="text-xl text-gray-700 font-medium">Arquivos expiram automaticamente em 3 dias</p>
        </div>
        <div className="flex gap-4">
          {items.length > 0 && (
            <button 
              onClick={() => { if(window.confirm("Limpar todo o histórico permanentemente?")) onClearAll(); }}
              className="px-6 py-3 bg-red-100 text-red-600 rounded-2xl text-base font-black flex items-center gap-3 hover:bg-red-200 transition-all border border-red-100 shadow-sm"
            >
              <Trash className="w-5 h-5" /> Limpar Histórico
            </button>
          )}
          <div className="px-6 py-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl text-base font-black flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-6 h-6" /> Armazenamento temporário
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.length === 0 ? (
          <div className="col-span-full py-32 text-center opacity-40">
            <Clock className="w-24 h-24 mx-auto mb-8 text-gray-300" />
            <p className="text-3xl font-black text-gray-500 italic uppercase">Nenhuma criação recente</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col ring-1 ring-black/5">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <span className="text-xs font-black uppercase text-violet-600 tracking-[0.2em]">{translateType(item.type)}</span>
              <span className="text-sm font-bold text-amber-600 italic">{getExpirationText(item.expiresAt)}</span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <h4 className="text-lg font-black text-[#111111] truncate mb-6 uppercase italic">{item.title}</h4>
              
              <div className="mb-8 flex-1">
                {item.type === 'palette' ? (
                  <div className="h-48 rounded-[2rem] overflow-hidden flex shadow-inner border border-gray-100">
                    {item.content.colors.map((c: any, i: number) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} title={c.hex} />
                    ))}
                  </div>
                ) : (item.type === 'image' || item.type === 'logo' || item.type === 'mockup' || item.type === 'bg_removal' || item.type === 'visual_style' ? (
                  <div className="aspect-square bg-white rounded-[2rem] overflow-hidden shadow-inner border border-gray-100 flex items-center justify-center p-2">
                    <img src={item.content} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-50 rounded-[2rem] p-6 overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner">
                     <FileText className="w-12 h-12 text-gray-300" />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const win = window.open();
                    win?.document.write(`
                      <body style="margin:0; background:#111; display:flex; align-items:center; justify-content:center; min-height:100vh;">
                        ${typeof item.content === 'string' && item.content.startsWith('data:image') 
                          ? `<img src="${item.content}" style="max-width: 90%; max-height: 90vh; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);" />`
                          : `<div style="color:white; font-family:sans-serif; text-align:center;">
                              <h2>${item.title}</h2>
                              <pre style="text-align:left; background:#222; padding:20px; border-radius:10px;">${JSON.stringify(item.content, null, 2)}</pre>
                             </div>`
                        }
                      </body>
                    `);
                  }}
                  className="flex-1 py-4 bg-[#111111] text-white rounded-xl text-base font-black hover:bg-black flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ExternalLink className="w-5 h-5"/> Abrir
                </button>
                <button 
                  onClick={() => downloadItem(item)}
                  title="Download"
                  className="p-4 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-all border border-violet-100"
                >
                  <Download className="w-6 h-6"/>
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  title="Excluir"
                  className="p-4 bg-red-100/10 text-red-600 rounded-xl hover:bg-red-100/20 transition-all border border-red-100/20"
                >
                  <Trash2 className="w-6 h-6"/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

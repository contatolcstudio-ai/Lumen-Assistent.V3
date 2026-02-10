
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Sparkles, Loader2, RotateCcw, Paperclip, X, 
  HelpCircle, Lightbulb, MessageSquare, ArrowRight,
  Palette, FileText, Megaphone, Briefcase, Zap, ChevronDown, ChevronUp,
  Search, Wand2, BarChart3, Settings2, Image as ImageIcon, Plus,
  History as HistoryIcon, Clock, Trash2
} from 'lucide-react';
import { Message } from '../types';
import { generateText } from '../geminiService';
import { supabase } from '../supabaseClient';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

const CONTEXTUAL_ACTIONS = [
  { label: 'Analisar Estética', prompt: 'Analise a estética e os elementos visuais deste arquivo enviado.', icon: Search },
  { label: 'Gerar Variações', prompt: 'Com base neste arquivo, sugira 3 variações criativas diferentes.', icon: Wand2 },
  { label: 'Extrair Briefing', prompt: 'Extraia os pontos principais deste documento e organize em um briefing técnico.', icon: FileText },
  { label: 'Sugerir Melhorias', prompt: 'Quais melhorias de design ou redação você sugere para este material?', icon: Zap },
];

const SUGGESTIONS = [
  { 
    label: 'Identidade Visual', 
    text: 'Crie um conceito de identidade visual para uma marca de café artesanal focada em sustentabilidade.', 
    icon: Palette, 
    gradient: 'from-violet-500 to-purple-600', 
    shadow: 'shadow-violet-200' 
  },
  { 
    label: 'Direção de Arte', 
    text: 'Analise as tendências de design para 2025 e como aplicá-las em um e-commerce de moda premium.', 
    icon: ImageIcon, 
    gradient: 'from-emerald-500 to-teal-600', 
    shadow: 'shadow-emerald-200' 
  },
  { 
    label: 'Copywriting', 
    text: 'Escreva um manifesto de marca impactante para uma startup de tecnologia educacional.', 
    icon: FileText, 
    gradient: 'from-rose-500 to-pink-600', 
    shadow: 'shadow-rose-200' 
  },
  { 
    label: 'Estratégia Social', 
    text: 'Sugira um cronograma de 30 dias de conteúdo para o Instagram de uma agência de viagens.', 
    icon: Megaphone, 
    gradient: 'from-amber-500 to-orange-600', 
    shadow: 'shadow-amber-200' 
  },
  { 
    label: 'Briefing Criativo', 
    text: 'Monte um roteiro de briefing para um projeto de rebranding completo de uma indústria têxtil.', 
    icon: Briefcase, 
    gradient: 'from-blue-500 to-indigo-600', 
    shadow: 'shadow-blue-200' 
  },
];

export default function ChatLumen() {
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, data: string, type: string, preview?: string} | null>(null);
  const [showTips, setShowTips] = useState(true);
  const [lastUploadWasSent, setLastUploadWasSent] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('lumen_chat_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lumen_chat_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setLastUploadWasSent(false);
    setInput('');
    setAttachedFile(null);
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setLastUploadWasSent(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Excluir esta conversa permanentemente?")) {
      const updatedHistory = history.filter(s => s.id !== id);
      setHistory(updatedHistory);
      if (currentSessionId === id) {
        startNewChat();
      }
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        const isImage = file.type.startsWith('image/');
        setAttachedFile({
          name: file.name,
          type: file.type,
          data: base64,
          preview: isImage ? reader.result as string : undefined
        });
        setLastUploadWasSent(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const userText = textOverride || input;
    if ((!userText.trim() && !attachedFile) || loading) return;

    const hadAttachment = !!attachedFile;
    const userMessage: Message = { 
      role: 'user', 
      text: attachedFile ? `[Arquivo: ${attachedFile.name}] ${userText}` : userText, 
      timestamp: Date.now() 
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    if (hadAttachment) {
      setLastUploadWasSent(true);
    } else {
      setLastUploadWasSent(false);
    }

    try {
      const systemInstruction = "Você é LÚMEN, a inteligência criativa dedicada do LC STUDIO. Seu objetivo é elevar o padrão dos projetos dos usuários através de direção de arte impecável, redação estratégica e soluções técnicas precisas. Se um arquivo for mencionado ou enviado, foque em analisá-lo com rigor estético e mercadológico.";
      
      const responseText = await generateText(userText, systemInstruction);
      
      const modelMessage: Message = { 
        role: 'model', 
        text: responseText || "Não consegui processar sua visão agora. Vamos tentar de novo?", 
        timestamp: Date.now() 
      };
      
      const finalMessages = [...newMessages, modelMessage];
      setMessages(finalMessages);

      let updatedHistory = [...history];
      if (currentSessionId) {
        updatedHistory = updatedHistory.map(s => 
          s.id === currentSessionId ? { ...s, messages: finalMessages, timestamp: Date.now() } : s
        );
      } else {
        const newSessionId = Date.now().toString();
        const newSession: ChatSession = {
          id: newSessionId,
          title: userText.substring(0, 30) + (userText.length > 30 ? '...' : ''),
          messages: finalMessages,
          timestamp: Date.now()
        };
        updatedHistory = [newSession, ...updatedHistory];
        setCurrentSessionId(newSessionId);
      }
      setHistory(updatedHistory);

    } catch (err: any) {
      console.error(err);
      const errorMessage = "Ocorreu uma instabilidade na conexão com a LÚMEN. Por favor, tente novamente em alguns instantes.";
      setMessages(prev => [...prev, { role: 'model', text: errorMessage, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full mx-auto animate-in fade-in duration-500 overflow-hidden px-2">
      
      <div className="flex-1 flex bg-white border border-gray-100 rounded-[3rem] shadow-2xl overflow-hidden relative ring-1 ring-black/5">
        
        <aside className="hidden md:flex w-72 flex-col border-r border-gray-100 bg-gray-50/30">
          <div className="p-6 border-b border-gray-100 bg-white">
            <button 
              onClick={startNewChat}
              className="w-full py-4 bg-[#111111] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" /> Novo Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">Histórico de Conversas</p>
            {history.map((session) => (
              <div 
                key={session.id} 
                onClick={() => loadSession(session)}
                className={`p-4 bg-white border rounded-2xl shadow-sm transition-all cursor-pointer group flex items-center gap-3 ${
                  currentSessionId === session.id ? 'border-violet-400 ring-1 ring-violet-400/20' : 'border-gray-100 hover:border-violet-200'
                }`}
              >
                <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center text-violet-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#111111] truncate uppercase italic leading-none">{session.title || 'Sessão Criativa'}</p>
                  <p className="text-[9px] text-gray-400 font-medium mt-1">{new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <button 
                  onClick={(e) => deleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {history.length === 0 && (
              <div className="pt-10 text-center opacity-20 italic">
                 <HistoryIcon className="w-10 h-10 mx-auto text-gray-300" />
                 <p className="text-[10px] font-black uppercase mt-2">Sem histórico</p>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 relative">
          
          <div className="relative z-20 flex items-center justify-between px-8 md:px-12 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="w-11 h-11 bg-[#111111] rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-violet-50 group hover:rotate-6 transition-transform">
                 <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-[9px] text-violet-600 font-black tracking-[0.4em] uppercase mb-0.5">LC STUDIO AI HUB</p>
                <h2 className="text-lg font-black text-[#111111] uppercase tracking-tighter italic leading-none">Canal de Inteligência LÚMEN</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={startNewChat}
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                title="Limpar Canal"
              >
                <RotateCcw className="w-3 h-3" /> Limpar Canal
              </button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="relative z-10 flex-1 overflow-y-auto px-6 md:px-12 lg:px-24 py-8 scroll-smooth scrollbar-hide space-y-10 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.03),transparent)]"
          >
            {messages.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="w-20 h-20 bg-violet-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 shadow-inner ring-8 ring-white">
                  <Sparkles className="w-10 h-10 text-violet-600 animate-pulse" />
                </div>
                <div className="space-y-4 max-w-3xl">
                  <h3 className="text-5xl font-black text-[#111111] uppercase tracking-tighter italic leading-none">O Futuro é Criativo.</h3>
                  <p className="text-xl font-medium leading-relaxed italic text-gray-400 px-4">
                    Descreva sua visão, envie um briefing ou anexe uma referência.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-4 duration-500`}
              >
                <div className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-2xl ${
                  msg.role === 'user' ? 'bg-[#7C3AED] text-white' : 'bg-[#111111] text-white ring-4 ring-violet-50'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-violet-400" />}
                </div>
                <div className={`max-w-[90%] lg:max-w-[75%] rounded-[2.5rem] px-8 py-6 shadow-xl border ${
                  msg.role === 'user' 
                    ? 'bg-[#7C3AED] text-white border-transparent' 
                    : 'bg-white border-gray-100 text-[#111111]'
                }`}>
                  <div className="text-base whitespace-pre-wrap font-medium leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-6">
                <div className="w-11 h-11 rounded-2xl bg-[#111111] text-white flex items-center justify-center animate-pulse shadow-xl ring-4 ring-violet-50">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div className="bg-white border border-gray-100 rounded-[2.5rem] px-10 py-6 shadow-sm">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-violet-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}

            {lastUploadWasSent && !loading && (
              <div className="flex flex-wrap justify-center gap-4 py-8 animate-in fade-in slide-in-from-top-6 duration-700">
                {CONTEXTUAL_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action.prompt)}
                    className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#111111] hover:bg-[#111111] hover:text-white hover:border-transparent transition-all shadow-xl flex items-center gap-3 active:scale-95 group"
                  >
                    <action.icon className="w-4 h-4 text-violet-500 group-hover:text-violet-400" /> {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-20 px-8 pb-8 pt-4 bg-white border-t border-gray-50/50">
            
            {attachedFile && (
              <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border border-gray-100 p-4 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-10 flex items-center gap-6 ring-[12px] ring-black/5 z-40">
                {attachedFile.preview ? (
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-inner">
                    <img src={attachedFile.preview} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center shrink-0 border border-violet-100">
                    <FileText className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-violet-600 uppercase tracking-[0.3em] mb-1">Material Recebido</p>
                  <p className="text-base font-black text-[#111111] truncate uppercase italic leading-tight">{attachedFile.name}</p>
                </div>
                <button 
                  onClick={() => { setAttachedFile(null); setLastUploadWasSent(false); }} 
                  className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="max-w-[1400px] mx-auto flex items-center gap-4 bg-gray-50 rounded-[2.5rem] p-2.5 border-2 border-gray-100 focus-within:ring-[10px] focus-within:ring-violet-500/5 focus-within:bg-white focus-within:border-violet-300 transition-all shadow-inner">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-all shrink-0"
              >
                <Paperclip className="w-6 h-6" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileAttach} 
                className="hidden" 
                accept="image/*,application/pdf,application/msword,text/plain" 
              />
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Digite sua visão ou briefing aqui..."
                className="flex-1 bg-transparent py-2.5 focus:outline-none text-lg text-[#111111] font-bold placeholder:text-gray-300 placeholder:italic transition-colors"
              />
              <button 
                onClick={() => handleSend()}
                disabled={(!input.trim() && !attachedFile) || loading}
                className="w-12 h-12 bg-[#111111] text-white rounded-full flex items-center justify-center disabled:opacity-10 hover:bg-violet-600 transition-all shadow-2xl active:scale-90 shrink-0 group/btn"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6 max-w-[1500px] mx-auto w-full px-4">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-[0.5em]">
            <Lightbulb className="w-5 h-5 text-violet-500" /> Start Here (Dicas de Uso)
          </div>
          <button 
            onClick={() => setShowTips(!showTips)}
            className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-2 hover:underline bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm"
          >
            {showTips ? 'Recolher Dicas' : 'Expandir Dicas'} {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showTips && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-in slide-in-from-bottom-6 duration-700">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => setInput(sug.text)}
                className={`group relative h-44 rounded-[2.5rem] overflow-hidden p-8 flex flex-col items-center justify-center text-center gap-4 transition-all hover:-translate-y-2 hover:shadow-2xl active:scale-95 bg-gradient-to-br ${sug.gradient} ${sug.shadow}`}
              >
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform ring-1 ring-white/30">
                  <sug.icon className="w-7 h-7" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest italic group-hover:tracking-[0.2em] transition-all">{sug.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

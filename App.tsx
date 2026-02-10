import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Key, Sparkles, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import Layout from './components/Layout';
import ModeSelector from './pages/ModeSelector';
import ChatLumen from './pages/ChatLumen';
import GenerateImage from './pages/GenerateImage';
import GeneratePalette from './pages/GeneratePalette';
import GenerateNames from './pages/GenerateNames';
import GenerateSlogan from './pages/GenerateSlogan';
import GenerateBudget from './pages/GenerateBudget';
import GenerateMockup from './pages/GenerateMockup';
import RemoveBackground from './pages/RemoveBackground';
import History from './pages/History';
import Notes from './pages/Notes';
import Projects from './pages/Projects';
import Management from './pages/Management';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Marketing from './pages/Marketing';
import Auth from './pages/Auth';
import { CreativeItem } from './types';
import { supabase } from './supabaseClient';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [history, setHistory] = useState<CreativeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    // Verificar se uma chave API já foi selecionada no ambiente
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };

    checkApiKey();

    // Escutar erros de API vindos do serviço
    const handleError = () => setHasApiKey(false);
    window.addEventListener('lumen-api-key-error', handleError);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('lumen-api-key-error', handleError);
    };
  }, []);

  useEffect(() => {
    if (session) {
      loadHistory();
    }
  }, [session]);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('creative_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('timestamp', { ascending: false });

    if (!error && data) {
      const now = Date.now();
      const validItems = data.filter(item => item.expires_at > now);
      setHistory(validItems);
    }
  };

  const addToHistory = async (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => {
    if (!session) return;
    const newItem = {
      ...item,
      user_id: session.user.id,
      expires_at: Date.now() + 259200000
    };
    const { error } = await supabase.from('creative_history').insert([newItem]);
    if (!error) loadHistory();
  };

  const removeFromHistory = async (id: string) => {
    const { error } = await supabase.from('creative_history').delete().eq('id', id);
    if (!error) setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = async () => {
    if (!session) return;
    const { error } = await supabase.from('creative_history').delete().eq('user_id', session.user.id);
    if (!error) setHistory([]);
  };

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume sucesso após acionar o diálogo conforme regras
      setHasApiKey(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não houver chave API, mostra tela de ativação (Obrigatório para este ambiente)
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6 font-inter">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl space-y-10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
            <Key className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter leading-tight">Ativar Estúdio LÚMEN</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Para liberar o processamento de inteligência artificial, você precisa conectar sua própria chave do Google AI Studio.
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <button 
              onClick={handleSelectApiKey}
              className="w-full py-6 bg-[#111111] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-violet-600 transition-all shadow-xl active:scale-95"
            >
              Conectar Chave API <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-violet-500 transition-colors"
            >
              Documentação de Faturamento <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <HashRouter>
      <Layout userEmail={session.user.email}>
        <Routes>
          <Route path="/" element={<ModeSelector />} />
          <Route path="/chat" element={<ChatLumen />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/marketing" element={<Marketing onSave={addToHistory} />} />
          <Route path="/images" element={<GenerateImage type="image" onSave={addToHistory} />} />
          <Route path="/logos" element={<GenerateImage type="logo" onSave={addToHistory} />} />
          <Route path="/palettes" element={<GeneratePalette onSave={addToHistory} />} />
          <Route path="/names" element={<GenerateNames onSave={addToHistory} />} />
          <Route path="/slogans" element={<GenerateSlogan onSave={addToHistory} />} />
          <Route path="/mockups" element={<GenerateMockup onSave={addToHistory} />} />
          <Route path="/bg-removal" element={<RemoveBackground onSave={addToHistory} />} />
          <Route path="/budgets" element={<GenerateBudget onSave={addToHistory} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/history" element={<History items={history} onDelete={removeFromHistory} onClearAll={clearHistory} />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/management" element={<Management />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
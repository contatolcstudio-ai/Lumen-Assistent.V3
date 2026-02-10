import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [history, setHistory] = useState<CreativeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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
      expires_at: Date.now() + 259200000 // 3 dias
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
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
          <Route path="/chat" element={<div className="h-full"><ChatLumen /></div>} />
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

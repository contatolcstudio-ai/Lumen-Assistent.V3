import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;
        alert("Cadastro realizado com sucesso! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white/70 backdrop-blur-3xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-white overflow-hidden relative z-10 ring-1 ring-black/5">
        
        <div className="hidden lg:flex flex-col justify-between p-16 bg-[#111111] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="mb-12">
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">LÚMEN</h1>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-6xl font-black text-white leading-none tracking-tighter italic uppercase">
                Onde a visão <br />
                <span className="text-violet-400 underline decoration-violet-500/30">se torna marca.</span>
              </h2>
              <p className="text-xl text-gray-400 font-medium italic leading-relaxed max-w-md">
                Acesse o cockpit criativo mais avançado para designers, agências e mentes inovadoras agora sincronizado em nuvem.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 pt-10">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Sincronização Segura via Supabase</p>
          </div>
        </div>

        <div className="p-12 lg:p-20 flex flex-col justify-center bg-white">
          <div className="mb-12">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit mb-8">
              <button 
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-[#111111] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Entrar
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-[#111111] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Cadastrar
              </button>
            </div>
            <h3 className="text-4xl font-black text-[#111111] italic uppercase tracking-tighter leading-none mb-4">
              {isLogin ? 'Bem-vindo.' : 'Crie sua conta.' }
            </h3>
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Identifique-se para acessar o estúdio.' : 'Junte-se à nova era da inteligência criativa.'}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                </div>
                <input
                  required
                  type="text"
                  placeholder="Nome Completo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="block w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-violet-500/10 focus:bg-white focus:border-violet-300 outline-none transition-all shadow-inner"
                />
              </div>
            )}

            <div className="group relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
              </div>
              <input
                required
                type="email"
                placeholder="E-mail profissional"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-violet-500/10 focus:bg-white focus:border-violet-300 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="group relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full pl-14 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-violet-500/10 focus:bg-white focus:border-violet-300 outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-violet-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="pt-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-6 bg-[#111111] text-white rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 hover:bg-black shadow-2xl active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Entrar no Estúdio' : 'Finalizar Cadastro'}
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">LÚMEN AI © 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

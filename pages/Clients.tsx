import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, User, Trash2, Edit3, X, Save, Phone, Mail, 
  Building2, UserCircle, Briefcase, FileText, Receipt, 
  TrendingUp, CheckCircle2, AlertCircle, ArrowRight,
  ChevronRight, Filter, Loader2, MoreVertical, CreditCard
} from 'lucide-react';
import { Client } from '../types';
import { supabase } from '../supabaseClient';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [type, setType] = useState<'Pessoa Física' | 'Empresa'>('Pessoa Física');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (!error && data) setClients(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("O nome é obrigatório.");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const clientPayload = {
      id: editingClient ? editingClient.id : undefined,
      user_id: user.id,
      name, type, whatsapp, email, observations, document,
      timestamp: Date.now()
    };

    const { error } = await supabase
      .from('clients')
      .upsert([clientPayload]);

    if (error) {
      alert("Erro ao salvar cliente: " + error.message);
    } else {
      fetchClients();
      closeForm();
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingClient(null);
    setName('');
    setType('Pessoa Física');
    setWhatsapp('');
    setEmail('');
    setDocument('');
    setObservations('');
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setType(client.type);
    setWhatsapp(client.whatsapp);
    setEmail(client.email);
    setDocument(client.document || '');
    setObservations(client.observations || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja excluir este cliente permanentemente?")) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (!error) {
        setClients(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.document && c.document.includes(search))
    );
  }, [clients, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#111111] uppercase tracking-tighter italic leading-none mb-2">Central de Clientes</h2>
          <p className="text-xl text-gray-500 font-medium italic">Base de dados sincronizada na nuvem</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#111111] text-white px-8 py-4 rounded-2xl font-black hover:bg-black shadow-xl active:scale-95 transition-all">
          <Plus className="w-5 h-5 inline-block mr-2" /> NOVO CADASTRO
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar cliente..." 
          className="w-full bg-white border border-gray-200 rounded-[2rem] py-5 pl-16 pr-8 text-lg outline-none shadow-sm font-medium focus:ring-4 focus:ring-violet-500/5 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClients.length === 0 ? (
            <div className="col-span-full py-40 text-center opacity-20 italic">
              <UserCircle className="w-24 h-24 mx-auto mb-6" />
              <p className="text-3xl font-black uppercase tracking-widest">Nenhum cliente encontrado</p>
            </div>
          ) : (
            filteredClients.map(client => (
              <div key={client.id} className="group bg-white border border-gray-200 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative ring-1 ring-black/5 animate-in zoom-in-95">
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${client.type === 'Empresa' ? 'bg-indigo-600' : 'bg-violet-600'}`}>
                    {client.type === 'Empresa' ? <Building2 className="w-7 h-7" /> : <User className="w-7 h-7" />}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(client)} className="p-3 bg-gray-50 text-gray-400 hover:text-violet-600 rounded-xl transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(client.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-[#111111] mb-2 uppercase italic tracking-tight truncate leading-none">{client.name}</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{client.type} {client.document ? `• ${client.document}` : ''}</p>
                <div className="space-y-3 pt-6 border-t border-gray-50">
                  <p className="text-xs font-bold text-gray-600 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-violet-500" /> {client.whatsapp || '—'}</p>
                  <p className="text-xs font-bold text-gray-600 flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 text-violet-500" /> {client.email || '—'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter leading-none">
                {editingClient ? 'Editar Cliente' : 'Novo Cadastro Cloud'}
              </h3>
              <button onClick={closeForm} className="p-3 bg-white rounded-full hover:bg-gray-100 text-gray-400 transition-all active:scale-90 shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[75vh] scrollbar-hide">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">NOME COMPLETO / EMPRESA *</label>
                <input required autoFocus value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-xl font-bold text-[#111111] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-violet-500/10 shadow-inner" />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">TIPO</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setType('Pessoa Física')} className={`py-4 rounded-xl font-bold text-sm border transition-all ${type === 'Pessoa Física' ? 'bg-[#111111] text-white' : 'bg-white'}`}>PF</button>
                    <button type="button" onClick={() => setType('Empresa')} className={`py-4 rounded-xl font-bold text-sm border transition-all ${type === 'Empresa' ? 'bg-[#111111] text-white' : 'bg-white'}`}>PJ</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> WHATSAPP
                  </label>
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:bg-white shadow-inner" placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> CPF / CNPJ
                  </label>
                  <input value={document} onChange={e => setDocument(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:bg-white shadow-inner" placeholder="000.000.000-00" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> E-MAIL
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:bg-white shadow-inner" placeholder="email@exemplo.com" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">OBSERVAÇÕES</label>
                <textarea value={observations} onChange={e => setObservations(e.target.value)} className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-base font-medium resize-none italic outline-none focus:bg-white shadow-inner" placeholder="Detalhes, preferências ou notas adicionais..." />
              </div>
              
              <button type="submit" className="w-full py-6 bg-[#7C3AED] text-white rounded-2xl text-xl font-black shadow-2xl active:scale-95 transition-all">
                {editingClient ? 'Salvar Alterações' : 'Finalizar Cadastro Cloud'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

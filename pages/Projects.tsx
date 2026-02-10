
import React, { useState, useEffect, useMemo } from 'react';
import { FolderOpen, Plus, Trash2, LayoutGrid, FileText, ChevronRight, X, ChevronDown, Package, MoreVertical, AlertCircle, Clock } from 'lucide-react';
import { Project, ProjectStatus, Client } from '../types';

const COLUMNS: ProjectStatus[] = [
  'Orçamento - Aguardando',
  'Orçamento - Em Elaboração',
  'Orçamento - Enviado',
  'Aprovado',
  'Criação',
  'Em Produção',
  'Finalizado',
  'Cancelado'
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Gráfica');

  useEffect(() => {
    const localProj = JSON.parse(localStorage.getItem('lumen_projects_local') || '[]');
    const localClients = JSON.parse(localStorage.getItem('lumen_clients_local') || '[]');
    setProjects(localProj);
    setClients(localClients);
  }, []);

  const saveToLocal = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem('lumen_projects_local', JSON.stringify(updated));
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const selectedClient = clients.find(c => c.id === selectedClientId);
    
    const newProject: Project = {
      id: Date.now().toString(),
      userId: 'local_user',
      name: newName,
      description: newDescription,
      clientName: selectedClient ? selectedClient.name : 'Cliente Avulso',
      clientId: selectedClientId || undefined,
      status: 'Orçamento - Aguardando',
      timestamp: Date.now(),
      category: selectedCategory,
      itemIds: []
    };

    const updated = [newProject, ...projects];
    saveToLocal(updated);
    setShowCreate(false);
    setNewName('');
    setNewDescription('');
    setSelectedClientId('');
  };

  const updateStatus = (id: string, newStatus: ProjectStatus) => {
    const updated = projects.map(p => p.id === id ? { ...p, status: newStatus } : p);
    saveToLocal(updated);
  };

  const deleteProject = (id: string) => {
    if (confirm("Excluir este projeto permanentemente?")) {
      saveToLocal(projects.filter(p => p.id !== id));
    }
  };

  const projectsByStatus = useMemo(() => {
    const map: Record<string, Project[]> = {};
    COLUMNS.forEach(c => map[c] = []);
    projects.forEach(p => {
      if (map[p.status]) map[p.status].push(p);
    });
    return map;
  }, [projects]);

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-3xl font-black text-[#111111] uppercase tracking-tighter italic leading-none">Pipeline Criativo</h2>
          <p className="text-gray-500 font-medium italic mt-2">Gestão de fluxo e status de produção</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-[#111111] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black shadow-xl active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> NOVO PROJETO
        </button>
      </div>

      <div className="overflow-x-auto pb-10 scrollbar-hide">
        <div className="flex gap-6 px-4 min-w-[1800px]">
          {COLUMNS.map(col => (
            <div key={col} className="w-[300px] shrink-0 space-y-4">
              <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                 <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest truncate max-w-[80%]">{col}</h3>
                 <span className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px] font-black text-[#7C3AED] shadow-inner">{projectsByStatus[col].length}</span>
              </div>

              <div className="space-y-4 min-h-[650px] bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 p-4 transition-colors">
                {projectsByStatus[col].length === 0 && (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-300 italic text-[11px] font-black uppercase tracking-[0.3em] opacity-40">
                    VAZIO
                  </div>
                )}
                {projectsByStatus[col].map(p => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all group relative ring-1 ring-black/5 animate-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${p.category === 'TI' ? 'bg-blue-500' : p.category === 'Gráfica' ? 'bg-orange-500' : 'bg-violet-500'}`} />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{p.category}</span>
                       </div>
                       <button onClick={() => deleteProject(p.id)} className="opacity-0 group-hover:opacity-100 p-1.5 bg-gray-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    
                    <h4 className="text-base font-black text-gray-900 leading-tight mb-2 uppercase italic truncate">{p.name}</h4>
                    <p className="text-[11px] font-medium text-gray-500 line-clamp-2 mb-6 h-8 italic">{p.description || 'Nenhuma nota vinculada.'}</p>
                    
                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[11px] font-black text-violet-600 uppercase shadow-sm">{p.clientName?.charAt(0)}</div>
                        <span className="text-[10px] font-black text-gray-500 uppercase truncate max-w-[120px]">{p.clientName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                        <Clock className="w-3 h-3" />
                        {new Date(p.timestamp).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                      </div>
                    </div>

                    <div className="mt-5 relative">
                      <select 
                        value={p.status}
                        onChange={(e) => updateStatus(p.id, e.target.value as ProjectStatus)}
                        className="w-full bg-gray-50 border-none rounded-xl px-3 py-2.5 text-[10px] font-black uppercase text-gray-600 outline-none focus:ring-2 focus:ring-violet-200 appearance-none shadow-inner"
                      >
                        {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col ring-1 ring-black/5">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-[#1a1a1a] uppercase italic leading-none">Inaugurar Novo Projeto</h3>
              <button onClick={() => setShowCreate(false)} className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NOME DO PROJETO *</label>
                  <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Redesign Landing Page" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-xl font-black italic outline-none focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all shadow-inner" />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DESCRIÇÃO RÁPIDA</label>
                  <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Breve resumo do projeto para o Kanban..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all h-24 resize-none italic shadow-inner" />
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CATEGORIA</label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm font-bold text-gray-700 outline-none shadow-inner">
                      <option>Gráfica</option>
                      <option>Agência</option>
                      <option>TI</option>
                      <option>Outro</option>
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CLIENTE</label>
                    <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm font-bold text-gray-700 outline-none shadow-inner">
                      <option value="">Cliente Avulso</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
               </div>

               <div className="pt-6">
                  <button onClick={handleCreate} className="w-full py-6 bg-[#111111] text-white rounded-[2rem] text-lg font-black uppercase tracking-widest hover:bg-black shadow-xl active:scale-95 transition-all">Criar Projeto no Pipeline</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

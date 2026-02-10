
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, Search, X } from 'lucide-react';
import { Note } from '../types';

const STATUS_OPTIONS: Note['status'][] = ['Começar', 'Urgente', 'Não Urgente', 'Esperando'];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<Note['status']>('Começar');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lumen_notes_local') || '[]');
    setNotes(saved);
  }, []);

  const saveToLocal = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('lumen_notes_local', JSON.stringify(updated));
  };

  const handleCreate = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      userId: 'local_user',
      title: 'Novo Briefing Local',
      content: '',
      status: 'Começar',
      timestamp: Date.now()
    };
    saveToLocal([newNote, ...notes]);
    setActiveNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
    setStatus(newNote.status);
  };

  const handleSave = () => {
    if (!activeNote) return;
    const updated = notes.map(n => n.id === activeNote.id ? { ...n, title, content, status, timestamp: Date.now() } : n);
    saveToLocal(updated);
    alert("Nota salva localmente!");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Excluir esta nota permanentemente?")) {
      const updated = notes.filter(n => n.id !== id);
      saveToLocal(updated);
      if (activeNote?.id === id) setActiveNote(null);
    }
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] flex gap-8 animate-in fade-in duration-500">
      <div className="w-80 flex flex-col gap-6">
        <h2 className="text-2xl font-black text-[#111111] uppercase tracking-tighter italic leading-none mb-1">Dossiê de Notas</h2>
        <button onClick={handleCreate} className="w-full py-4 bg-[#111111] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black shadow-xl active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> NOVA NOTA LOCAL
        </button>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar..." className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500/20 shadow-sm" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide pb-10">
          {filteredNotes.map(n => (
            <button key={n.id} onClick={() => { setActiveNote(n); setTitle(n.title); setContent(n.content); setStatus(n.status); }} className={`w-full text-left p-5 rounded-3xl border transition-all ${activeNote?.id === n.id ? 'bg-white border-violet-500 shadow-xl ring-violet-500' : 'bg-white border-gray-100 hover:border-violet-200 shadow-sm'}`}>
              <h4 className="font-black text-[11px] text-gray-900 truncate uppercase italic leading-tight">{n.title}</h4>
              <p className="text-[8px] font-black text-violet-500 uppercase mt-2 tracking-widest">{n.status}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] border border-gray-200 shadow-sm flex flex-col overflow-hidden relative ring-1 ring-black/5">
        {activeNote ? (
          <>
            <button onClick={() => setActiveNote(null)} className="absolute top-8 right-8 p-3 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 z-10 transition-all shadow-sm"><X className="w-5 h-5" /></button>
            <div className="p-12 border-b border-gray-50 space-y-8 bg-gray-50/20">
              <input value={title} onChange={e => setTitle(e.target.value)} className="text-5xl font-black text-gray-900 bg-transparent outline-none w-full uppercase italic leading-none" />
              <div className="flex gap-2 items-center">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => setStatus(s)} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${status === s ? 'bg-[#111111] text-white shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}>{s}</button>
                ))}
                <div className="flex-1"></div>
                <button onClick={handleSave} className="p-4 bg-[#111111] text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95"><Save className="w-6 h-6" /></button>
                <button onClick={() => handleDelete(activeNote.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all active:scale-90"><Trash2 className="w-6 h-6" /></button>
              </div>
            </div>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="flex-1 p-12 text-2xl leading-relaxed text-[#111111] bg-white outline-none border-none resize-none font-medium italic scrollbar-hide placeholder:text-gray-200" 
              placeholder="Inicie a redação local..." 
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-20 text-center italic">
            <Edit3 className="w-24 h-24 text-gray-300" />
            <p className="text-2xl font-black text-gray-400 uppercase tracking-[0.4em]">Selecione uma nota para editar</p>
          </div>
        )}
      </div>
    </div>
  );
}

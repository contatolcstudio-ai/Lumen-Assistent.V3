import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, Download, CheckCircle2, Copy, Check, User, ChevronDown, Package, Search, X, Flag, Tag, Clock, Percent, Loader2, ChevronRight, Mail, Edit3, Trash2
} from 'lucide-react';
import { CreativeItem, Client, Product, Project, ProjectStatus } from '../types';

const CATEGORIES = ['Gráfica', 'Agência', 'TI', 'Serviços', 'Outro'];
const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Urgente'];

const COLUMNS: ProjectStatus[] = [
  'Orçamento - Enviado',
  'Aprovado',
  'Cancelado'
];

export default function GenerateBudget({ onSave }: { onSave: (item: Omit<CreativeItem, 'userId' | 'expiresAt'>) => void }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [totalCost, setTotalCost] = useState<number | string>('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const [validityDate, setValidityDate] = useState('');
  const [artCost, setArtCost] = useState<number | string>('');
  const [category, setCategory] = useState('Gráfica');
  const [priority, setPriority] = useState('Média');

  const [profitMargin, setProfitMargin] = useState<number | string>(100);
  const [logisticsFee, setLogisticsFee] = useState<number | string>('');

  const [isCalculated, setIsCalculated] = useState(false);
  const [copiedProposal, setCopiedProposal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Kanban States
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    const loadLocalData = () => {
      setLoadingData(true);
      const savedClients = JSON.parse(localStorage.getItem('lumen_clients_local') || '[]');
      const savedProducts = JSON.parse(localStorage.getItem('lumen_products_local') || '[]');
      const savedProjects = JSON.parse(localStorage.getItem('lumen_projects_local') || '[]');
      setClients(savedClients);
      setProducts(savedProducts);
      setProjects(savedProjects);
      setLoadingData(false);
    };

    loadLocalData();
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setValidityDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  const handleClientSelect = (id: string) => {
    setSelectedClientId(id);
    const client = clients.find(c => c.id === id);
    if (client) {
      setClientName(client.name);
      setClientEmail(client.email || '');
      setClientWhatsApp(client.whatsapp || '');
    } else {
      setClientName('');
      setClientEmail('');
      setClientWhatsApp('');
    }
  };

  const handleProductSelect = (p: Product) => {
    setServiceType(p.name);
    setDescription(p.description || '');
    if (p.costPrice !== undefined) setTotalCost(p.costPrice);
    if (p.logisticsCost !== undefined) setLogisticsFee(p.logisticsCost);
    if (p.profitMargin !== undefined) setProfitMargin(p.profitMargin);
    setShowProductPicker(false);
  };

  const results = useMemo(() => {
    const q = Math.max(Number(quantity) || 1, 1);
    const prodBaseTotal = Number(totalCost) || 0; 
    const logTotal = Number(logisticsFee) || 0; 
    const artTotal = Number(artCost) || 0;     
    const marginPct = Number(profitMargin) || 0;

    const productionWithMargin = prodBaseTotal * (1 + marginPct / 100);
    const finalTotal = productionWithMargin + logTotal + artTotal;
    const unitPriceFinal = finalTotal / q;
    const artDisplay = artTotal > 0 ? `R$ ${artTotal.toFixed(2)}` : "Inclusa";

    return {
      finalTotal,
      unitPrice: unitPriceFinal,
      totalProdWithMargin: productionWithMargin,
      artTotal,
      artDisplay,
      quantity: q
    };
  }, [totalCost, profitMargin, logisticsFee, quantity, artCost]);

  const proposalText = useMemo(() => {
    if (!isCalculated) return "";
    return `📝 ORÇAMENTO - ${clientName?.toUpperCase() || 'CLIENTE'}\n\n` +
      `✨ Serviço: ${serviceType}\n` +
      `👤 Cliente: ${clientName || 'Prezado Cliente'}\n` +
      `📂 Categoria: ${category}\n` +
      `🎨 Arte: ${results.artDisplay}\n` +
      `🔢 Quantidade: ${results.quantity} Unidade(s)\n` +
      `🏷️ Valor Unitário: R$ ${results.unitPrice.toFixed(2)}\n` +
      `⏳ Prazo: ${deadline || 'A combinar'}\n` +
      `🗓️ Validade: ${validityDate ? new Date(validityDate).toLocaleDateString('pt-BR') : '7 dias'}\n\n` +
      `💰 INVESTIMENTO TOTAL: R$ ${results.finalTotal.toFixed(2)}\n\n` +
      `🚀 Sinal (50%): R$ ${(results.finalTotal * 0.5).toFixed(2)}\n` +
      `✅ Saldo na Entrega (50%): R$ ${(results.finalTotal * 0.5).toFixed(2)}\n\n` +
      (notes ? `📌 Observações: ${notes}\n\n` : '') +
      `🔥 Aguardamos sua aprovação para iniciarmos os trabalhos!`;
  }, [isCalculated, serviceType, clientName, description, quantity, deadline, results, notes, category, validityDate]);

  const handleCalculate = () => {
    if (!serviceType.trim() || Number(quantity) <= 0) {
      alert("Preencha o serviço e uma quantidade válida.");
      return;
    }
    setIsCalculated(false);
    setTimeout(() => setIsCalculated(true), 10);
  };

  const saveProjectsToLocal = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem('lumen_projects_local', JSON.stringify(updated));
  };

  const handleSave = () => {
    if (editingProjectId) {
      const updated = projects.map(p => p.id === editingProjectId ? {
        ...p,
        name: serviceType,
        description: description || `Investimento: R$ ${results.finalTotal.toFixed(2)}`,
        clientName: clientName || 'Cliente Avulso',
        category: category,
        priority: priority as any,
        totalValue: results.finalTotal,
        timestamp: Date.now()
      } : p);
      saveProjectsToLocal(updated);
      setEditingProjectId(null);
      alert("Orçamento atualizado!");
      return;
    }

    onSave({
      id: `budget-${Date.now()}`,
      type: 'budget',
      content: { ...results, serviceType, description, clientName, deadline, notes, clientId: selectedClientId, validityDate, category, priority },
      timestamp: Date.now(),
      title: `ORÇAMENTO - ${clientName || 'CLIENTE'}`
    });

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      userId: 'local_user',
      name: serviceType,
      description: description || `Investimento: R$ ${results.finalTotal.toFixed(2)}`,
      clientName: clientName || 'Cliente Avulso',
      clientId: selectedClientId || undefined,
      status: 'Orçamento - Enviado',
      timestamp: Date.now(),
      category: category,
      priority: priority as any,
      totalValue: results.finalTotal,
      itemIds: []
    };

    saveProjectsToLocal([newProject, ...projects]);
    alert("Orçamento enviado ao Pipeline!");
  };

  const copyProposal = () => {
    navigator.clipboard.writeText(proposalText);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2000);
  };

  const updateStatus = (id: string, newStatus: ProjectStatus) => {
    const targetProject = projects.find(p => p.id === id);
    if (!targetProject) return;

    // Se aprovado, sincronizar com os lançamentos PDV da Gestão
    if (newStatus === 'Aprovado' && targetProject.status !== 'Aprovado') {
      const lancamentosSessao = JSON.parse(localStorage.getItem('lumen_pdv_lancamentos') || '[]');
      const operacaoAtiva = localStorage.getItem('lumen_pdv_ativa') === 'true';

      if (operacaoAtiva) {
        // Usa o valor numérico exato armazenado no projeto
        const totalValue = targetProject.totalValue || 0;

        const newLaunch = {
          id: `LANC-AUTO-${Date.now()}`,
          clientId: targetProject.clientId || null,
          clientName: targetProject.clientName,
          projectName: targetProject.name,
          description: targetProject.description,
          requestDate: new Date().toISOString().split('T')[0],
          deliveryDate: '',
          totalValue: totalValue,
          paidValue: 0,
          status: 'Pendente',
          priority: targetProject.priority || 'Média',
          category: targetProject.category || 'Gráfica'
        };

        const updatedLancamentos = [newLaunch, ...lancamentosSessao];
        localStorage.setItem('lumen_pdv_lancamentos', JSON.stringify(updatedLancamentos));
        alert(`O orçamento de ${targetProject.clientName} foi aprovado e lançado na Gestão Operacional com o valor exato de R$ ${totalValue.toFixed(2)}!`);
      }
    }

    saveProjectsToLocal(projects.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const deleteProject = (id: string) => {
    if (window.confirm("Deseja excluir este orçamento?")) {
      const updated = projects.filter(p => p.id !== id);
      saveProjectsToLocal(updated);
    }
  };

  const handleEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setServiceType(p.name);
    setClientName(p.clientName || '');
    setCategory(p.category || 'Gráfica');
    setPriority(p.priority || 'Média');
    setDescription(p.description);
    setIsCalculated(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const projectsByStatus = useMemo(() => {
    const map: Record<string, Project[]> = {};
    COLUMNS.forEach(c => map[c] = []);
    projects.forEach(p => { if (map[p.status]) map[p.status].push(p); });
    return map;
  }, [projects]);

  return (
    <div className="max-w-[1800px] mx-auto space-y-16 animate-in fade-in duration-500 pb-32">
      <div className="print:hidden space-y-2">
        <h2 className="text-4xl font-black text-[#111111] uppercase tracking-tighter italic leading-none">Gerador de Orçamentos</h2>
        <p className="text-xl text-gray-700 font-medium italic mt-2">Engenharia de preços com transparência técnica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8 print:hidden">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm space-y-8 ring-1 ring-black/5 relative">
            <div className="flex items-center gap-3">
               <Calculator className="w-8 h-8 text-violet-600" />
               <h3 className="text-2xl font-black text-[#111111] uppercase tracking-tighter italic leading-none">{editingProjectId ? 'Editando Orçamento' : 'Parâmetros do Job'}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CATEGORIA</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-[#7C3AED]">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRIORIDADE</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-[#7C3AED]">
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CLIENTE</label>
                <select value={selectedClientId} onChange={e => handleClientSelect(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner outline-none">
                  <option value="">{loadingData ? 'Sincronizando...' : 'Preenchimento Avulso'}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NOME DO CLIENTE *</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: Lucas" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner outline-none" />
              </div>

              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ITEM / SERVIÇO *</label>
                  <button onClick={() => setShowProductPicker(!showProductPicker)} className="text-[10px] font-black uppercase text-violet-600 flex items-center gap-1 hover:underline"><Package className="w-3 h-3" /> USAR CATÁLOGO</button>
                </div>
                <input value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder="Ex: Cartão de Visita" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner outline-none" />
                {showProductPicker && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl p-4 max-h-64 overflow-y-auto ring-1 ring-black/5 animate-in zoom-in-95">
                    {products.map(p => (
                      <button key={p.id} onClick={() => handleProductSelect(p)} className="w-full text-left p-3 rounded-xl hover:bg-violet-50 text-sm font-bold text-gray-700 transition-colors flex items-center justify-between">{p.name}<ChevronRight className="w-3 h-3 text-gray-300" /></button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">VALOR DA ARTE (R$)</label>
                  <input type="number" value={artCost} onChange={e => setArtCost(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-black shadow-inner outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MARGEM DE LUCRO (%)</label>
                  <div className="relative">
                    <input type="number" value={profitMargin} onChange={e => setProfitMargin(e.target.value)} className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 text-lg font-black text-emerald-600 shadow-inner outline-none" />
                    <Percent className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">QUANTIDADE *</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-black shadow-inner outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CUSTO PRODUÇÃO (R$) *</label>
                  <input type="number" value={totalCost} onChange={e => setTotalCost(e.target.value)} placeholder="Ex: 73.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-black shadow-inner" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">LOGÍSTICA</label>
                   <input type="number" value={logisticsFee} onChange={e => setLogisticsFee(e.target.value)} placeholder="15.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">VALIDADE</label>
                   <input type="date" value={validityDate} onChange={e => setValidityDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner outline-none" />
                 </div>
              </div>

              <div className="flex gap-4">
                {editingProjectId && (
                  <button onClick={() => { setEditingProjectId(null); setIsCalculated(false); }} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
                )}
                <button onClick={handleCalculate} className="flex-[2] py-7 bg-[#111111] text-white rounded-[2.5rem] text-xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)]">
                  <Calculator className="w-7 h-7" /> Processar Orçamento
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {!isCalculated ? (
            <div className="bg-white rounded-[4rem] border border-gray-100 p-12 h-full flex flex-col items-center justify-center text-center opacity-30 ring-1 ring-black/5 italic">
              <Package className="w-20 h-20 mb-6 text-gray-300" />
              <p className="text-3xl font-black uppercase tracking-[0.4em] italic text-gray-400">AGUARDANDO PARÂMETROS</p>
              <p className="text-base font-medium mt-4 text-gray-500 max-w-sm">Preencha os dados estruturais para renderizar a proposta.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="bg-white rounded-[4rem] border border-gray-100 p-12 shadow-2xl space-y-10 print:shadow-none print:p-0 ring-1 ring-black/5">
                <div className="flex justify-between items-start border-b border-gray-100 pb-10">
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black text-[#111111] italic uppercase tracking-tighter">PROPOSTA COMERCIAL</h4>
                    <p className="text-2xl text-[#7C3AED] font-black italic">{clientName || 'CLIENTE FINAL'}</p>
                  </div>
                  <div className="px-5 py-2.5 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase border border-red-100 italic tracking-widest shadow-sm">Prioridade: {priority}</div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço de Venda Unitário</p>
                    <p className="text-5xl font-black text-[#111111] tracking-tighter leading-none">R$ {results.unitPrice.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Geral ({results.quantity} un)</p>
                    <p className="text-5xl font-black text-[#7C3AED] tracking-tighter leading-none italic">R$ {results.finalTotal.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-10 border-t-2 border-dashed border-gray-100 space-y-8">
                  <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] italic">Estrutura de Fechamento (50/50)</h5>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-emerald-50/50 p-8 rounded-[3rem] border border-emerald-100 shadow-sm">
                      <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-2">🚀 Entrada / Reserva</p>
                      <p className="text-3xl font-black text-emerald-700 tracking-tighter">R$ {(results.finalTotal * 0.5).toFixed(2)}</p>
                    </div>
                    <div className="bg-violet-50/50 p-8 rounded-[3rem] border border-violet-100 shadow-sm">
                      <p className="text-[11px] font-black text-violet-600 uppercase tracking-widest mb-2">✅ Conclusão / Entrega</p>
                      <p className="text-3xl font-black text-violet-700 tracking-tighter">R$ {(results.finalTotal * 0.5).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-10 print:hidden">
                  <button onClick={() => window.print()} className="flex-1 py-6 bg-[#111111] text-white rounded-3xl text-xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"><Download className="w-6 h-6" /> Exportar PDF</button>
                  <button onClick={handleSave} className="flex-1 py-6 bg-white text-[#111111] rounded-3xl text-xl font-black flex items-center justify-center gap-3 border border-gray-200 shadow-lg active:scale-95 hover:bg-gray-50 transition-all"><CheckCircle2 className="w-6 h-6 text-violet-600" /> {editingProjectId ? 'Atualizar no Pipeline' : 'Iniciar no Pipeline'}</button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-gray-200 p-10 shadow-sm space-y-6 print:hidden ring-1 ring-black/5">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Mail className="w-4 h-4 text-violet-500" />
                       <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Texto p/ WhatsApp</h5>
                    </div>
                    <button onClick={copyProposal} className="flex items-center gap-2 text-[10px] font-black uppercase text-violet-600 hover:text-violet-800 transition-colors bg-violet-50 px-4 py-2 rounded-xl shadow-sm">
                      {copiedProposal ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} {copiedProposal ? 'COPIADO' : 'COPIAR'}
                    </button>
                 </div>
                 <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 font-medium text-gray-700 whitespace-pre-wrap text-sm leading-relaxed max-h-64 overflow-y-auto italic shadow-inner">
                    {proposalText}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-20 border-t border-gray-200">
        <div className="flex items-center justify-between mb-12 px-4">
          <div>
            <h3 className="text-3xl font-black text-[#111111] uppercase tracking-tighter italic">Histórico de orçamentos</h3>
            <p className="text-gray-500 font-medium italic mt-2">Controle o status de todos os orçamentos emitidos</p>
          </div>
        </div>

        <div className="overflow-x-auto pb-10 scrollbar-hide">
          <div className="flex gap-6 px-4 min-w-[800px]">
            {COLUMNS.map(col => (
              <div key={col} className="w-[300px] shrink-0 space-y-4">
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                   <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest truncate max-w-[80%]">{col}</h3>
                   <span className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px] font-black text-[#7C3AED] shadow-inner">{projectsByStatus[col].length}</span>
                </div>

                <div className="space-y-4 min-h-[650px] bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 p-4 transition-colors">
                  {projectsByStatus[col].length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-300 italic text-[11px] font-black uppercase tracking-[0.3em] opacity-40">VAZIO</div>
                  )}
                  {projectsByStatus[col].map(p => (
                    <div key={p.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all group relative ring-1 ring-black/5 animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${p.category === 'TI' ? 'bg-blue-500' : p.category === 'Gráfica' ? 'bg-orange-500' : 'bg-violet-500'}`} />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{p.category}</span>
                         </div>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => handleEditProject(p)} className="p-1.5 bg-gray-50 text-gray-400 hover:text-violet-600 rounded-lg transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                           <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                         </div>
                      </div>
                      <h4 className="text-base font-black text-gray-900 leading-tight mb-2 uppercase italic truncate">{p.name}</h4>
                      <p className="text-[11px] font-medium text-gray-500 line-clamp-2 mb-6 h-8 italic">{p.description || 'Nenhuma nota.'}</p>
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[11px] font-black text-violet-600 uppercase shadow-sm">{p.clientName?.charAt(0)}</div>
                          <span className="text-[10px] font-black text-gray-500 uppercase truncate max-w-[120px]">{p.clientName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                          <Clock className="w-3 h-3" /> {new Date(p.timestamp).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}
                        </div>
                      </div>
                      <div className="mt-5 relative">
                        <select 
                          value={p.status}
                          onChange={(e) => updateStatus(p.id, e.target.value as ProjectStatus)}
                          className="w-full bg-gray-50 border-none rounded-xl px-3 py-2.5 text-[10px] font-black uppercase text-gray-600 outline-none appearance-none shadow-inner focus:ring-2 focus:ring-violet-200"
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
      </div>
    </div>
  );
}
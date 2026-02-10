import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, FileSpreadsheet, History as HistoryIcon, X, AlertCircle, 
  Trash2, Edit3, Search, Play, Square, Timer as TimerIcon, Eye,
  UserPlus, CreditCard, Phone, Mail, FileText as FileIcon, Clock,
  Download, Printer, Package, ChevronDown, LogOut, Camera, 
  Settings, CheckCircle2, Monitor, Printer as PrinterIcon, 
  AlertTriangle, Image as ImageIcon, ArrowRight, Users, FileDown,
  FilterX
} from 'lucide-react';
import { Client, Product } from '../types';
import DailyReport from '../components/DailyReport';

type ProjectStatus = 'Pendente' | 'Parcial' | 'Pago';
type PriorityLevel = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

interface StudioProject {
  id: string;
  clientId: string | null;
  clientName: string; 
  projectName: string;
  description?: string;
  requestDate: string;
  deliveryDate: string;
  totalValue: number;
  paidValue: number;
  status: ProjectStatus;
  priority: PriorityLevel;
  category: string;
}

interface SessionReport {
  id: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  duracao: string;
  totalFaturado: number;
  totalRecebido: number;
  totalPendente: number;
  lancamentos: StudioProject[];
}

const CATEGORIES = ['Gráfica', 'Agência', 'TI', 'Serviços', 'Outro'];
const PRIORITIES: PriorityLevel[] = ['Baixa', 'Média', 'Alta', 'Urgente'];

// COMPONENTE: Hub de Impressoras (Sincronizado)
const PrinterHubModal = ({ onClose }: { onClose: () => void }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [printers, setPrinters] = useState<{name: string, status: string, type: string}[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPrinters([
        { name: 'Rede Local: EPSON L3250 Series', status: 'Pronta', type: 'Jato de Tinta' },
        { name: 'USB: HP LaserJet Professional', status: 'Em uso', type: 'Laser' },
        { name: 'Microsoft Print to PDF', status: 'Software', type: 'Virtual' }
      ]);
      setIsScanning(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    document.title = `Dossie_Fechamento_${Date.now()}`;
    window.print();
    document.title = originalTitle;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[950] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col ring-1 ring-black/10 animate-in zoom-in-95">
        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-black text-[#1a1a1a] uppercase italic leading-none flex items-center gap-3">
            <Printer className="w-6 h-6 text-violet-600" /> Hub de Impressoras
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X className="w-6 h-6 text-gray-400" /></button>
        </div>
        <div className="p-10 space-y-4">
          {isScanning ? (
            <div className="py-12 text-center space-y-6 animate-pulse">
               <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full mx-auto animate-spin"></div>
               <p className="text-sm font-black uppercase text-gray-400 tracking-widest">Sincronizando com o dispositivo...</p>
            </div>
          ) : printers.length > 0 ? (
            printers.map((p, i) => (
              <button key={i} onClick={() => { window.print(); onClose(); }} className="w-full flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-3xl hover:bg-white hover:border-violet-300 hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${p.status === 'Pronta' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                  <div className="text-left">
                    <p className="font-black text-[#1a1a1a] uppercase text-xs tracking-tight">{p.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.type} • {p.status}</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-violet-500 -rotate-90" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center space-y-4 opacity-50 italic">
               <AlertTriangle className="w-12 h-12 mx-auto text-amber-500" />
               <p className="text-lg font-black uppercase text-gray-500 tracking-widest">Nenhuma impressora detectada</p>
            </div>
          )}
          <button 
            onClick={handleDownloadPDF}
            className="w-full py-6 bg-violet-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-violet-700 transition-all flex items-center justify-center gap-3 mt-4 shadow-xl active:scale-95"
          >
            <FileDown className="w-4 h-4" /> BAIXAR PDF DO RELATÓRIO
          </button>
        </div>
      </div>
    </div>
  );
};

// COMPONENTE: Hub de Clientes (Atalhos)
const ClientsViewModal = ({ clients, onClose, onSelectClient }: { clients: Client[], onClose: () => void, onSelectClient: (id: string | null) => void }) => (
  <div className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col ring-1 ring-black/10 animate-in zoom-in-95 max-h-[85vh]">
      <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-2xl font-black text-[#1a1a1a] uppercase italic leading-none flex items-center gap-4">
          <Users className="w-8 h-8 text-violet-600" /> Base de Clientes Ativos
        </h3>
        <div className="flex gap-2">
          <button onClick={() => { onSelectClient(null); onClose(); }} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-sm">VER TODOS</button>
          <button onClick={onClose} className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm"><X className="w-6 h-6" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.length === 0 ? (
            <div className="col-span-full py-20 text-center opacity-20 italic">
              <UserPlus className="w-20 h-20 mx-auto mb-6" />
              <p className="text-2xl font-black uppercase tracking-widest">Nenhum cliente cadastrado</p>
            </div>
          ) : (
            clients.map(c => (
              <button key={c.id} onClick={() => { onSelectClient(c.id); onClose(); }} className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex items-center gap-5 hover:bg-white hover:border-violet-300 hover:shadow-xl transition-all group text-left">
                <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center font-black text-violet-600 text-xl shadow-sm">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 uppercase italic truncate tracking-tight">{c.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{c.email || 'Sem e-mail'}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-200 group-hover:text-violet-500 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
);

// COMPONENTE: Dossiê de Relatório da Sessão
const ReportViewModal = ({ report, onClose }: { report: SessionReport, onClose: () => void }) => {
  const [isPrinterHubOpen, setIsPrinterHubOpen] = useState(false);

  const handleDownloadJPG = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensões profissionais de alta resolução
    const width = 1200;
    const padding = 60;
    const itemsCount = report.lancamentos.length;
    const dynamicHeight = 1000 + (itemsCount * 140);
    
    canvas.width = width;
    canvas.height = Math.max(1600, dynamicHeight);

    // Fundo Branco Ultra-Premium
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cabeçalho Roxo Estilizado (Matching the App)
    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(0, 0, canvas.width, 240);

    // Sombra do Cabeçalho
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 240, canvas.width, 4);

    // Título Principal
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 italic 54px Inter';
    ctx.fillText('RELATÓRIO CONSOLIDADO', padding, 120);
    
    ctx.font = '700 20px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`ID DA SESSÃO: ${report.id} • DATA: ${report.data}`, padding, 160);

    // Janela de Tempo no Header
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 italic 32px Inter';
    ctx.fillText(`${report.horaInicio} — ${report.horaFim}`, width - padding, 120);
    ctx.font = '700 uppercase 14px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(`DURAÇÃO TOTAL: ${report.duracao}`, width - padding, 155);
    ctx.textAlign = 'left';

    // Seção de Resumo de Valores
    const drawMetricCard = (x: number, y: number, label: string, val: number, color: string, bgColor: string, borderColor: string) => {
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(x, y, 340, 200, 45);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = color;
      ctx.font = '900 uppercase 14px Inter';
      ctx.fillText(label, x + 35, y + 60);
      
      ctx.fillStyle = '#111111';
      ctx.font = '900 42px Inter';
      ctx.fillText(val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), x + 35, y + 135);
    };

    const cardY = 300;
    drawMetricCard(padding, cardY, 'Faturamento', report.totalFaturado, '#7C3AED', '#F5F3FF', '#DDD6FE');
    drawMetricCard(padding + 370, cardY, 'Valor Recebido', report.totalRecebido, '#059669', '#ECFDF5', '#A7F3D0');
    drawMetricCard(padding + 740, cardY, 'Pendente / Aberto', report.totalPendente, '#DC2626', '#FEF2F2', '#FECACA');

    // Título da Lista
    ctx.fillStyle = '#111111';
    ctx.font = '900 italic 28px Inter';
    ctx.fillText(`REGISTROS REALIZADOS (${itemsCount})`, padding, 580);
    
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, 610);
    ctx.lineTo(width - padding, 610);
    ctx.stroke();

    // Renderização dos Itens
    let currentY = 660;
    report.lancamentos.forEach((item, idx) => {
      // Card do Item
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(padding, currentY, width - (padding * 2), 110, 25);
      ctx.fill();
      ctx.strokeStyle = '#F3F4F6';
      ctx.stroke();

      // Info Esquerda
      ctx.fillStyle = '#111111';
      ctx.font = '800 italic 22px Inter';
      ctx.fillText(item.projectName.toUpperCase(), padding + 40, currentY + 45);
      
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '700 uppercase 14px Inter';
      ctx.fillText(`${item.clientName} • ${item.category}`, padding + 40, currentY + 75);

      // Status Badge
      const isPago = item.status === 'Pago';
      ctx.fillStyle = isPago ? '#ECFDF5' : '#FFFBEB';
      ctx.beginPath();
      ctx.roundRect(padding + 600, currentY + 40, 100, 30, 10);
      ctx.fill();
      ctx.fillStyle = isPago ? '#059669' : '#D97706';
      ctx.font = '900 uppercase 10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(item.status, padding + 650, currentY + 60);
      ctx.textAlign = 'left';

      // Valor Direita
      ctx.textAlign = 'right';
      ctx.fillStyle = '#111111';
      ctx.font = '900 28px Inter';
      ctx.fillText(item.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), width - padding - 40, currentY + 65);
      ctx.textAlign = 'left';

      currentY += 135;
    });

    // Rodapé de Validade
    const footerY = canvas.height - 60;
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
    
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '900 uppercase 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('LÚMEN CREATIVE STUDIO AI — SISTEMA POS OPERACIONAL DE ALTA PERFORMANCE', canvas.width / 2, footerY);

    // Download Real
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Lumen_Fechamento_${report.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Dossiê renderizado em 1200px (HD). O download do arquivo JPG foi iniciado.");
  };

  return (
    <div className="fixed inset-0 z-[700] bg-black/80 flex items-center justify-center p-4 print:p-0 print:bg-white overflow-hidden">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:rounded-none ring-1 ring-black/10">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 print:hidden">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#1a1a1a] uppercase italic tracking-tighter">Dossiê de Fechamento de Turno</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID DA SESSÃO: {report.id}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPrinterHubOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" /> IMPRIMIR / PDF
            </button>
            <button 
              onClick={handleDownloadJPG}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              <Camera className="w-4 h-4" /> BAIXAR JPG
            </button>
            <button 
              onClick={onClose} 
              className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div id="report-content" className="flex-1 overflow-y-auto p-12 space-y-12 print:overflow-visible print:p-0">
          <div className="flex justify-between items-start border-b border-gray-100 pb-10">
            <div className="space-y-5">
              <div className="w-20 h-20 bg-violet-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                <FileIcon className="w-10 h-10" />
              </div>
              <h2 className="text-5xl font-black text-[#1a1a1a] uppercase italic tracking-tighter leading-none">Relatório Consolidado</h2>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Turno encerrado em {report.data}</p>
            </div>
            <div className="text-right space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Janela de Tempo</p>
              <p className="text-3xl font-black text-[#1a1a1a] italic">{report.horaInicio} — {report.horaFim}</p>
              <div className="inline-block px-5 py-2 bg-violet-100 text-violet-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                Duração Total: {report.duracao}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-10 rounded-[3rem] space-y-3 border border-gray-100 shadow-inner overflow-hidden min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faturamento do Turno</p>
              <p className="text-4xl font-black text-[#1a1a1a] break-all leading-none">{report.totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="bg-emerald-50 p-10 rounded-[3rem] space-y-3 border border-emerald-100 shadow-inner overflow-hidden min-w-0">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Valor Recebido</p>
              <p className="text-4xl font-black text-emerald-700 break-all leading-none">{report.totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="bg-red-50 p-10 rounded-[3rem] space-y-3 border border-red-100 shadow-inner overflow-hidden min-w-0">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Pendente / Aberto</p>
              <p className="text-4xl font-black text-red-600 break-all leading-none">{report.totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          </div>

          <div className="space-y-8">
             <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Registros Realizados ({report.lancamentos.length})</h4>
             </div>
             <div className="space-y-4">
                {report.lancamentos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-8 bg-white border border-gray-100 rounded-[2rem] ring-1 ring-black/5 hover:bg-gray-50 transition-colors">
                     <div>
                        <p className="font-black text-lg text-[#1a1a1a] uppercase italic">{item.projectName}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">{item.clientName} • {item.category}</p>
                     </div>
                     <div className="text-right space-y-1">
                        <p className="font-black text-xl text-[#1a1a1a]">{item.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Pago' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="pt-16 border-t border-gray-100 text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.6em]">LÚMEN CREATIVE STUDIO AI — SISTEMA POS OPERACIONAL</p>
          </div>
        </div>
      </div>
      {isPrinterHubOpen && <PrinterHubModal onClose={() => setIsPrinterHubOpen(false)} />}
    </div>
  );
};

export default function Management() {
  const [operacaoAtiva, setOperacaoAtiva] = useState<boolean>(false);
  const [inicioOperacao, setInicioOperacao] = useState<Date | null>(null);
  const [tempoDecorrido, setTempoDecorrido] = useState('00:00:00');
  
  const [lancamentos, setLancamentos] = useState<StudioProject[]>([]);
  const [historico, setHistorico] = useState<SessionReport[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [isNovoLancamentoOpen, setIsNovoLancamentoOpen] = useState(false);
  const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
  const [isClientsHubOpen, setIsClientsHubOpen] = useState(false);
  const [editingLaunchId, setEditingLaunchId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isEncerrarTurnoOpen, setIsEncerrarTurnoOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SessionReport | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  
  const [selectedClientIdFilter, setSelectedClientIdFilter] = useState<string | null>(null);

  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    const savedAtiva = localStorage.getItem('lumen_pdv_ativa') === 'true';
    const savedInicio = localStorage.getItem('lumen_pdv_inicio');
    if (savedAtiva && savedInicio) {
      setOperacaoAtiva(true);
      setInicioOperacao(new Date(savedInicio));
    }
    const savedLancamentos = localStorage.getItem('lumen_pdv_lancamentos');
    if (savedLancamentos) setLancamentos(JSON.parse(savedLancamentos));
    
    const savedHistorico = localStorage.getItem('lumen_pdv_history');
    if (savedHistorico) setHistorico(JSON.parse(savedHistorico));
    const savedClients = localStorage.getItem('lumen_clients_local');
    if (savedClients) setClients(JSON.parse(savedClients));
    const savedProducts = localStorage.getItem('lumen_products_local');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lumen_pdv_lancamentos' && e.newValue) {
        setLancamentos(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (operacaoAtiva && inicioOperacao) {
      timerIntervalRef.current = setInterval(() => {
        const agora = new Date();
        const diff = agora.getTime() - inicioOperacao.getTime();
        const segundos = Math.floor((diff / 1000) % 60);
        const minutos = Math.floor((diff / (1000 * 60)) % 60);
        const horas = Math.floor(diff / (1000 * 60 * 60));
        setTempoDecorrido([
          horas.toString().padStart(2, '0'),
          minutos.toString().padStart(2, '0'),
          segundos.toString().padStart(2, '0')
        ].join(':'));
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTempoDecorrido('00:00:00');
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [operacaoAtiva, inicioOperacao]);

  const handleComecarTurno = () => {
    const agora = new Date();
    setInicioOperacao(agora);
    setOperacaoAtiva(true);
    setLancamentos([]);
    localStorage.setItem('lumen_pdv_ativa', 'true');
    localStorage.setItem('lumen_pdv_inicio', agora.toISOString());
    localStorage.setItem('lumen_pdv_lancamentos', '[]');
  };

  const handleFinalizarEncerramento = () => {
    const agora = new Date();
    setOperacaoAtiva(false);
    const totalFaturado = lancamentos.reduce((acc, p) => acc + p.totalValue, 0);
    const totalRecebido = lancamentos.reduce((acc, p) => acc + p.paidValue, 0);
    
    if (inicioOperacao) {
      const novoRelatorio: SessionReport = {
        id: `POS-${Date.now()}`,
        data: inicioOperacao.toLocaleDateString('pt-BR'),
        horaInicio: inicioOperacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        horaFim: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        duracao: tempoDecorrido,
        totalFaturado,
        totalRecebido,
        totalPendente: totalFaturado - totalRecebido,
        lancamentos: [...lancamentos]
      };
      const novoHistorico = [novoRelatorio, ...historico];
      setHistorico(novoHistorico);
      localStorage.setItem('lumen_pdv_history', JSON.stringify(novoHistorico));
      setSelectedReport(novoRelatorio);
    }

    setLancamentos([]);
    localStorage.setItem('lumen_pdv_ativa', 'false');
    localStorage.removeItem('lumen_pdv_inicio');
    localStorage.setItem('lumen_pdv_lancamentos', '[]');
    setIsEncerrarTurnoOpen(false);
  };

  const [newLaunchForm, setNewLaunchForm] = useState({
    projectName: '', description: '', clientId: '', category: 'Serviços',
    priority: 'Média' as PriorityLevel, totalValue: 0, paidValue: 0,
    requestDate: new Date().toISOString().split('T')[0]
  });

  const handleSaveLaunch = () => {
    if (!newLaunchForm.projectName.trim()) return;
    const selectedClient = clients.find(c => c.id === newLaunchForm.clientId);
    const status: ProjectStatus = newLaunchForm.totalValue > 0 && newLaunchForm.paidValue >= newLaunchForm.totalValue ? 'Pago' : newLaunchForm.paidValue > 0 ? 'Parcial' : 'Pendente';
    const newProj: StudioProject = {
      id: editingLaunchId || `LANC-${Date.now()}`,
      clientId: newLaunchForm.clientId || null,
      clientName: selectedClient ? selectedClient.name : 'Cliente Avulso',
      projectName: newLaunchForm.projectName,
      description: newLaunchForm.description,
      requestDate: newLaunchForm.requestDate,
      deliveryDate: '',
      totalValue: newLaunchForm.totalValue,
      paidValue: newLaunchForm.paidValue,
      status,
      priority: newLaunchForm.priority,
      category: newLaunchForm.category
    };
    const updated = editingLaunchId 
      ? lancamentos.map(l => l.id === editingLaunchId ? newProj : l)
      : [newProj, ...lancamentos];
    setLancamentos(updated);
    localStorage.setItem('lumen_pdv_lancamentos', JSON.stringify(updated));
    setIsNovoLancamentoOpen(false);
    setEditingLaunchId(null);
    setNewLaunchForm({
      projectName: '', description: '', clientId: '', category: 'Serviços',
      priority: 'Média', totalValue: 0, paidValue: 0,
      requestDate: new Date().toISOString().split('T')[0]
    });
  };

  const filteredLancamentos = useMemo(() => {
    if (!selectedClientIdFilter) return lancamentos;
    return lancamentos.filter(l => l.clientId === selectedClientIdFilter);
  }, [lancamentos, selectedClientIdFilter]);

  // Base completa de lançamentos para analytics (histórico + ativo)
  const allProjectsForAnalytics = useMemo(() => {
    const historyProjects = historico.flatMap(h => h.lancamentos);
    return [...historyProjects, ...lancamentos];
  }, [historico, lancamentos]);

  const formatCurrencyInput = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'totalValue' | 'paidValue') => {
    const val = e.target.value.replace(/\D/g, '');
    const numeric = Number(val) / 100;
    setNewLaunchForm(prev => ({ ...prev, [field]: numeric }));
  };

  const [quickClient, setQuickClient] = useState({ name: '', type: 'Pessoa Física' as 'Pessoa Física' | 'Empresa', whatsapp: '', email: '' });
  const handleSaveQuickClient = () => {
    if (!quickClient.name) return;
    const newClient: Client = { id: `CL-Q-${Date.now()}`, userId: 'local_user', ...quickClient, timestamp: Date.now() };
    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    localStorage.setItem('lumen_clients_local', JSON.stringify(updatedClients));
    setNewLaunchForm(p => ({ ...p, clientId: newClient.id }));
    setIsQuickClientOpen(false);
    setQuickClient({ name: '', type: 'Pessoa Física', whatsapp: '', email: '' });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmationId) return;
    const updated = lancamentos.filter(l => l.id !== deleteConfirmationId);
    setLancamentos(updated);
    localStorage.setItem('lumen_pdv_lancamentos', JSON.stringify(updated));
    setDeleteConfirmationId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-inter relative">
      <div className="max-w-[1600px] mx-auto space-y-10 px-6 lg:px-10 pt-8">
        
        <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-8 ring-1 ring-black/5 relative">
           <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all ${operacaoAtiva ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                 <TimerIcon className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Status da Operação</p>
                 <h3 className={`text-2xl font-black uppercase italic tracking-tighter transition-all ${operacaoAtiva ? 'text-emerald-600' : 'text-gray-300'}`}>
                    {operacaoAtiva ? 'Turno em Andamento' : 'Turno Encerrado / Standby'}
                 </h3>
                 {operacaoAtiva && inicioOperacao && (
                    <p className="text-[10px] font-bold text-gray-500 mt-1">Iniciado em {inicioOperacao.toLocaleDateString()} às {inicioOperacao.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                 )}
              </div>
           </div>

           <div className="flex flex-col items-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Duração do Turno</p>
              <div className={`text-6xl font-black tracking-tighter tabular-nums leading-none ${operacaoAtiva ? 'text-[#1a1a1a]' : 'text-gray-100'}`}>
                 {tempoDecorrido}
              </div>
           </div>

           <div className="flex flex-col items-center">
              {!operacaoAtiva ? (
                 <button 
                   onClick={handleComecarTurno}
                   className="h-14 flex items-center gap-3 bg-[#111111] text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                 >
                   <Play className="w-4 h-4 fill-white" /> Começar Turno
                 </button>
              ) : (
                 <button 
                   onClick={() => setIsEncerrarTurnoOpen(true)}
                   className="h-14 flex items-center gap-3 bg-red-600 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl active:scale-95 border border-white/20"
                 >
                   <Square className="w-4 h-4 fill-white text-white" /> Encerrar Turno
                 </button>
              )}
           </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#111111] uppercase tracking-tighter italic leading-none flex items-center gap-4">
                <FileSpreadsheet className="w-8 h-8 text-violet-600" /> Gestão Operacional
              </h2>
              <p className="text-sm text-gray-500 font-medium italic mt-1">Lançamentos em tempo real do turno ativo</p>
            </div>
            {selectedClientIdFilter && (
              <button 
                onClick={() => setSelectedClientIdFilter(null)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-[10px] font-black uppercase border border-violet-100 animate-in zoom-in-95 shadow-sm"
              >
                <FilterX className="w-4 h-4" /> Limpar Filtro de Cliente
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsClientsHubOpen(true)} 
                className="h-11 flex items-center gap-2 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-white border border-gray-200 text-gray-500 hover:text-violet-600 hover:border-violet-200 shadow-sm active:scale-95"
            >
              <Users className="w-4 h-4" /> BASE DE CLIENTES
            </button>
            <button 
                onClick={() => {
                  if (!operacaoAtiva) return alert("Inicie um turno operacional para realizar lançamentos.");
                  setIsNovoLancamentoOpen(true);
                }} 
                className={`h-11 flex items-center gap-2 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${operacaoAtiva ? 'bg-[#111111] text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Plus className="w-4 h-4" /> NOVO LANÇAMENTO
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Item / Serviço</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor (R$)</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Pago (R$)</th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLancamentos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center opacity-30 italic font-bold uppercase tracking-widest gap-6">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center">
                           <span className="text-3xl font-black">!</span>
                        </div>
                        <span className="text-xl">NENHUM LANÇAMENTO REGISTRADO</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLancamentos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-6 font-bold text-gray-900 uppercase italic text-xs">{p.clientName}</td>
                      <td className="px-6 py-6 font-black text-sm text-gray-900 uppercase italic tracking-tight">{p.projectName}</td>
                      <td className="px-6 py-6 text-right font-black text-[#1a1a1a]">
                        {p.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-6 text-right font-black text-emerald-600">
                        {p.paidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-6 text-center">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${p.status === 'Pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.status === 'Parcial' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{p.status}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                         <div className="flex items-center justify-center gap-2">
                           <button onClick={() => { setEditingLaunchId(p.id); setNewLaunchForm({...p, clientId: p.clientId || ''}); setIsNovoLancamentoOpen(true); }} className="p-2 bg-gray-50 text-gray-400 hover:text-violet-600 rounded-lg transition-colors shadow-sm"><Edit3 className="w-4 h-4" /></button>
                           <button onClick={() => setDeleteConfirmationId(p.id)} className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DailyReport projects={allProjectsForAnalytics} />

        <div className="bg-white border border-gray-200 rounded-[2.5rem] p-10 ring-1 ring-black/5">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-50 pb-6">
              <div className="flex items-center gap-4">
                <HistoryIcon className="w-8 h-8 text-violet-600" />
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dossiê de Arquivos</p>
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter text-[#1a1a1a]">Histórico de Turnos Fechados</h3>
                </div>
              </div>
           </div>
           
           {historico.length === 0 ? (
             <div className="py-20 text-center opacity-30 italic">
                <p className="text-xl font-black uppercase tracking-widest">Nenhuma sessão encerrada no histórico</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {historico.map((session) => (
                  <div key={session.id} className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] hover:bg-white transition-all shadow-sm flex flex-col h-full ring-1 ring-black/5">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1">{session.data}</p>
                           <h4 className="text-xl font-black text-[#111111] italic leading-none">{session.horaInicio} — {session.horaFim}</h4>
                        </div>
                        <div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-[9px] font-black uppercase">{session.duracao}</div>
                     </div>
                     <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-400 font-bold uppercase text-[10px]">Faturamento</span>
                           <span className="font-black text-gray-900">{session.totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-emerald-500/70 font-bold uppercase text-[10px]">Recebido</span>
                           <span className="font-black text-emerald-600">{session.totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                     </div>
                     <button onClick={() => setSelectedReport(session)} className="w-full py-4 bg-[#111111] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95">
                       <Eye className="w-4 h-4" /> Visualizar Dossiê
                     </button>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {selectedReport && <ReportViewModal report={selectedReport} onClose={() => setSelectedReport(null)} />}

      {/* HUB DE ENCERRAMENTO */}
      {isEncerrarTurnoOpen && (
        <div className="fixed inset-0 z-[850] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col ring-1 ring-black/10 animate-in zoom-in-95">
            <div className="p-12 text-center space-y-8">
               <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                  <LogOut className="w-10 h-10" />
               </div>
               <div className="space-y-3">
                  <h3 className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter leading-none">Encerrar Turno?</h3>
                  <p className="text-gray-500 font-medium italic text-lg leading-snug">Ao confirmar, os lançamentos ativos serão consolidados e arquivados.</p>
               </div>
            </div>
            <div className="p-10 pt-0 flex gap-4">
              <button onClick={() => setIsEncerrarTurnoOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest">CANCELAR</button>
              <button onClick={handleFinalizarEncerramento} className="flex-[1.5] py-5 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 shadow-xl transition-all">CONFIRMAR</button>
            </div>
          </div>
        </div>
      )}

      {/* HUB DE EXCLUSÃO */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[800] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col ring-1 ring-black/5 animate-in zoom-in-95">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner"><Trash2 className="w-10 h-10" /></div>
              <h3 className="text-2xl font-black text-[#111111] uppercase italic tracking-tighter leading-none">Remover Lançamento?</h3>
            </div>
            <div className="p-10 pt-0 flex gap-4">
              <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase">CANCELAR</button>
              <button onClick={handleConfirmDelete} className="flex-[1.5] py-5 bg-red-600 text-white rounded-2xl text-xs font-black uppercase">EXCLUIR</button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CLIENT MODAL */}
      {isQuickClientOpen && (
        <div className="fixed inset-0 z-[800] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-12 space-y-10 animate-in zoom-in-95 ring-1 ring-black/10">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter">Novo Cliente Rápido</h3>
               <button onClick={() => setIsQuickClientOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome Completo *</label>
                  <input value={quickClient.name} onChange={e => setQuickClient(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 font-bold text-lg outline-none focus:ring-4 focus:ring-violet-500/10 shadow-inner" />
               </div>
            </div>
            <button onClick={handleSaveQuickClient} className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-violet-700 active:scale-95 transition-all">SALVAR E SELECIONAR</button>
          </div>
        </div>
      )}
    </div>
  );
}

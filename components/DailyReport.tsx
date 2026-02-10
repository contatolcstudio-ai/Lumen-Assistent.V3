import React, { useMemo } from 'react';
import { 
  TrendingUp, BarChart3, ShoppingBag, 
  Calendar, FileText, ArrowUpRight, 
  Target, Award
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface StudioProject {
  id: string;
  projectName: string;
  requestDate: string;
  totalValue: number;
  paidValue: number;
}

interface DailyReportProps {
  projects: StudioProject[];
}

export default function DailyReport({ projects }: DailyReportProps) {
  const analytics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Métricas de Hoje (Cards)
    const todayProjects = projects.filter(p => p.requestDate === today);
    const todayBilled = todayProjects.reduce((acc, p) => acc + p.totalValue, 0);
    const todayReceived = todayProjects.reduce((acc, p) => acc + p.paidValue, 0);
    const todayCount = todayProjects.length;
    const todayPending = todayBilled - todayReceived;

    // 2. Gráfico de Tendência (Últimos 7 dias) - "Lógica Anterior Otimizada"
    const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayName = weekDays[d.getDay()];
      
      const dayProjects = projects.filter(p => p.requestDate === dayStr);
      const dayReceived = dayProjects.reduce((acc, p) => acc + p.paidValue, 0);
      const dayTotal = dayProjects.reduce((acc, p) => acc + p.totalValue, 0);
      
      chartData.push({
        name: dayName,
        recebido: dayReceived,
        pendente: dayTotal - dayReceived
      });
    }

    // 3. Produtos mais vendidos (Top 5 - Hoje)
    const productMap: Record<string, { count: number; total: number }> = {};
    todayProjects.forEach(p => {
      const name = p.projectName || 'Não Identificado';
      if (!productMap[name]) {
        productMap[name] = { count: 0, total: 0 };
      }
      productMap[name].count += 1;
      productMap[name].total += p.totalValue;
    });

    const topProducts = Object.entries(productMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      today: { billed: todayBilled, received: todayReceived, count: todayCount, open: todayPending },
      chartData,
      topProducts
    };
  }, [projects]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Calendar className="w-6 h-6 text-violet-600" />
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em] italic">Relatório de Inteligência Diária</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 border border-gray-100 rounded-3xl shadow-sm h-36 flex flex-col justify-center transition-all hover:shadow-md border-l-4 border-l-gray-300">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">OS Criadas Hoje</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-[#1a1a1a] italic leading-none">{analytics.today.count}</p>
            <FileText className="w-8 h-8 text-gray-100" />
          </div>
        </div>
        <div className="bg-white p-8 border border-gray-100 rounded-3xl shadow-sm h-36 flex flex-col justify-center transition-all hover:shadow-md border-l-4 border-l-violet-600">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Faturamento Hoje</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-violet-700 italic leading-none">
              {analytics.today.billed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <TrendingUp className="w-8 h-8 text-violet-100" />
          </div>
        </div>
        <div className="bg-white p-8 border border-gray-100 rounded-3xl shadow-sm h-36 flex flex-col justify-center transition-all hover:shadow-md border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recebido Hoje</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-emerald-600 italic leading-none">
              {analytics.today.received.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <Target className="w-8 h-8 text-emerald-100" />
          </div>
        </div>
        <div className="bg-white p-8 border border-gray-100 rounded-3xl shadow-sm h-36 flex flex-col justify-center transition-all hover:shadow-md border-l-4 border-l-red-500">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Pendência Hoje</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-red-500 italic leading-none">
              {analytics.today.open.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <ArrowUpRight className="w-8 h-8 text-red-100" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white border border-gray-100 p-10 rounded-[3rem] shadow-xl flex flex-col ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-6 h-6 text-violet-600" />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Fluxo de Faturamento Atual</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recebidos</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pendentes</span>
                </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 900, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 900, fill: '#9CA3AF' }}
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    padding: '12px 16px'
                  }}
                />
                <Bar dataKey="recebido" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={60} />
                <Bar dataKey="pendente" stackId="a" fill="#EF4444" radius={[12, 12, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic animate-pulse">Visualização sincronizada com os lançamentos ativos</p>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-gray-100 p-10 rounded-[3rem] shadow-xl flex flex-col ring-1 ring-black/5">
          <div className="flex items-center gap-4 mb-10">
            <Award className="w-6 h-6 text-amber-500" />
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Alta Performance: Top 5</p>
          </div>
          <div className="space-y-6 flex-1">
            {analytics.topProducts.map((prod, i) => (
              <div key={i} className="flex items-center justify-between group transition-transform hover:translate-x-1">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-[11px] text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors border border-gray-100">
                    0{i+1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#1a1a1a] uppercase italic truncate">{prod.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{prod.count} Vendas Ativas</p>
                  </div>
                </div>
                <p className="text-sm font-black text-[#1a1a1a] italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  {prod.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
            {analytics.topProducts.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic py-16 space-y-4">
                <ShoppingBag className="w-12 h-12 text-gray-200" />
                <p className="text-[11px] font-black uppercase tracking-widest">Sem vendas registradas hoje</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
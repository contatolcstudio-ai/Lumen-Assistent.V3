
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Package, Trash2, Edit3, X, Save, 
  Tag, Archive, ChevronRight, Calculator, Truck, Percent, ChevronDown, Loader2
} from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../supabaseClient';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null);

  const [nomeProduto, setNomeProduto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [valorCusto, setValorCusto] = useState<number | string>('');
  const [valorLogistica, setValorLogistica] = useState<number | string>('');
  const [margemLucro, setMargemLucro] = useState<number | string>(100);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fixed: Map snake_case DB columns to camelCase Product interface properties
  const fetchProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (!error && data) {
      const mappedProducts: Product[] = data.map((p: any) => ({
        ...p,
        userId: p.user_id,
        costPrice: p.cost_price,
        logisticsCost: p.logistics_cost,
        profitMargin: p.profit_margin,
        sellingPrice: p.selling_price
      }));
      setProducts(mappedProducts);
    }
    setLoading(false);
  };

  const suggestedPrice = useMemo(() => {
    const cost = Number(valorCusto) || 0;
    const log = Number(valorLogistica) || 0;
    const margin = Number(margemLucro) || 0;
    const priceWithMargin = cost * (1 + margin / 100);
    return priceWithMargin + log;
  }, [valorCusto, valorLogistica, margemLucro]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return unique.sort();
  }, [products]);

  // Fixed: Use camelCase keys in payload to align with type system expectations
  const handleSaveProduct = async () => {
    if (!nomeProduto.trim()) return alert("O nome é obrigatório.");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const productPayload = {
      id: editingProduct ? editingProduct.id : undefined,
      user_id: user.id, // Column in DB
      name: nomeProduto,
      category: categoria,
      sku: codigo,
      description: descricao,
      cost_price: Number(valorCusto) || 0, // Column in DB
      logistics_cost: Number(valorLogistica) || 0, // Column in DB
      profit_margin: Number(margemLucro) || 0, // Column in DB
      selling_price: suggestedPrice, // Column in DB
      timestamp: Date.now()
    };

    const { error } = await supabase.from('products').upsert([productPayload]);

    if (error) {
      alert("Erro ao salvar produto: " + error.message);
    } else {
      fetchProducts();
      closeForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja remover este produto permanentemente?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setNomeProduto('');
    setCategoria('');
    setCodigo('');
    setDescricao('');
    setValorCusto('');
    setValorLogistica('');
    setMargemLucro(100);
  };

  // Fixed: Use camelCase properties from Product interface
  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setNomeProduto(p.name);
    setCategoria(p.category);
    setCodigo(p.sku);
    setDescricao(p.description);
    setValorCusto(p.costPrice || '');
    setValorLogistica(p.logisticsCost || '');
    setMargemLucro(p.profitMargin || 100);
    setShowForm(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = selectedFilterCategory ? p.category === selectedFilterCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedFilterCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#111111] uppercase tracking-tighter italic leading-none mb-2">Catálogo de Produtos</h2>
          <p className="text-xl text-gray-500 font-medium italic">Gestão sincronizada em nuvem</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#111111] text-white px-8 py-4 rounded-2xl font-black hover:bg-black shadow-xl active:scale-95 transition-all">
          <Plus className="w-5 h-5 inline-block mr-2" /> NOVO ITEM
        </button>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar produto ou SKU..." 
            className="w-full bg-white border border-gray-200 rounded-[2rem] py-5 pl-16 pr-8 text-lg outline-none shadow-sm font-medium focus:ring-4 focus:ring-violet-500/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
           <button 
             onClick={() => setSelectedFilterCategory(null)}
             className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${selectedFilterCategory === null ? 'bg-[#111111] text-white border-transparent shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-violet-200'}`}
           >
             TODOS OS ITENS
           </button>
           {categories.map(cat => (
             <button 
               key={cat}
               onClick={() => setSelectedFilterCategory(cat)}
               className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${selectedFilterCategory === cat ? 'bg-violet-600 text-white border-transparent shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-violet-200'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-40 text-center opacity-20 italic">
              <Archive className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <p className="text-3xl font-black uppercase tracking-widest text-gray-400">Catálogo Vazio</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="group bg-white border border-gray-200 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative ring-1 ring-black/5 animate-in zoom-in-95">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-lg">
                    <Package className="w-7 h-7" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)} className="p-3 bg-gray-50 text-gray-400 hover:text-violet-600 rounded-xl transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-[#111111] mb-2 uppercase italic tracking-tight truncate leading-none">{product.name}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">{product.category || 'Sem Categoria'}</span>
                  {product.sellingPrice ? (
                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">R$ {product.sellingPrice.toFixed(2)}</span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500 font-medium italic line-clamp-3 mb-8 flex-1 leading-relaxed">
                  {product.description || 'Sem descrição detalhada.'}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[650] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-3xl font-black text-[#111111] uppercase italic tracking-tighter leading-none">
                {editingProduct ? 'Editar Item' : 'Novo Produto Cloud'}
              </h3>
              <button onClick={closeForm} className="p-3 bg-white rounded-full hover:bg-gray-100 text-gray-400 transition-all active:scale-90 shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto max-h-[75vh] scrollbar-hide">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">NOME *</label>
                <input autoFocus value={nomeProduto} onChange={e => setNomeProduto(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-xl font-bold text-[#111111] outline-none focus:bg-white shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">CATEGORIA</label>
                  <div className="relative">
                    <input 
                      value={categoria} 
                      onChange={e => setCategoria(e.target.value)} 
                      list="category-suggestions"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner outline-none focus:bg-white" 
                    />
                    <datalist id="category-suggestions">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">SKU</label>
                  <input value={codigo} onChange={e => setCodigo(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner outline-none focus:bg-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Calculator className="w-3.5 h-3.5" /> VALOR DE CUSTO (R$)
                  </label>
                  <input type="number" value={valorCusto} onChange={e => setValorCusto(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner outline-none focus:bg-white" placeholder="0.00" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Truck className="w-3.5 h-3.5" /> LOGÍSTICA (R$)
                  </label>
                  <input type="number" value={valorLogistica} onChange={e => setValorLogistica(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-inner outline-none focus:bg-white" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Percent className="w-3.5 h-3.5" /> MARGEM DE LUCRO DESEJADA (%)
                  </label>
                  <div className="relative">
                    <input type="number" value={margemLucro} onChange={e => setMargemLucro(e.target.value)} className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-5 text-xl font-black text-emerald-600 shadow-inner outline-none focus:bg-emerald-100/50" placeholder="100" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-xl">%</span>
                  </div>
                </div>

                <div className="bg-violet-50 p-6 rounded-3xl border border-violet-100 flex flex-col justify-center shadow-inner">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1">Valor Unitário Sugerido</p>
                  <p className="text-3xl font-black text-violet-900 leading-none">R$ {suggestedPrice.toFixed(2)}</p>
                  <p className="text-[9px] text-violet-400 font-black mt-2 uppercase tracking-tight italic opacity-80">Cálculo sincronizado em tempo real</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">DESCRIÇÃO DETALHADA</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-base font-medium resize-none italic outline-none focus:bg-white shadow-inner" placeholder="Especifique características ou observações técnicas..." />
              </div>
              <button onClick={handleSaveProduct} className="w-full py-6 bg-[#7C3AED] text-white rounded-2xl text-xl font-black shadow-2xl active:scale-95 hover:bg-violet-700 transition-all">
                Salvar no Catálogo Cloud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

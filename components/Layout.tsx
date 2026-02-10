
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  MessageSquare, 
  Image as ImageIcon, 
  Hexagon, 
  Palette,
  FileText,
  Briefcase,
  Eraser,
  History,
  Type as TypeIcon,
  Quote,
  Users,
  Megaphone,
  User as UserIcon,
  Package,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navigation: NavigationItem[] = [
  { name: 'Início', path: '/', icon: Sparkles },
  { name: 'Chat LÚMEN', path: '/chat', icon: MessageSquare },
  { name: 'Marketing', path: '/marketing', icon: Megaphone },
  
  { name: 'Gerar Imagem', path: '/images', icon: ImageIcon },
  { name: 'Gerar Logos', path: '/logos', icon: Hexagon },
  { name: 'Gerar Lettering', path: '/names', icon: TypeIcon },
  { name: 'Gerar Paletas', path: '/palettes', icon: Palette },
  { name: 'Gerar Slogan', path: '/slogans', icon: Quote },
  { name: 'Gerar Mockup', path: '/mockups', icon: ImageIcon },
  { name: 'Removedor de Fundo', path: '/bg-removal', icon: Eraser },
  
  { name: 'Clientes', path: '/clients', icon: Users },
  { name: 'Gestão', path: '/management', icon: Briefcase },
  { name: 'Produtos', path: '/products', icon: Package },
  { name: 'Gerar Orçamentos', path: '/budgets', icon: FileText },
  
  { name: 'Anotações', path: '/notes', icon: MessageSquare },
  { name: 'Histórico', path: '/history', icon: History },
];

const NavLink: React.FC<{item: NavigationItem, isActive: boolean, isExpanded: boolean, onClick?: () => void}> = ({ item, isActive, isExpanded, onClick }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
      isActive 
        ? 'bg-[#7C3AED] text-white font-bold shadow-lg shadow-violet-100' 
        : 'text-[#111111] hover:bg-gray-100 font-medium'
    } ${!isExpanded ? 'justify-center' : ''}`}
  >
    <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
    {isExpanded && <span className="text-sm truncate animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>}
    
    {!isExpanded && (
      <div className="absolute left-full ml-4 px-2 py-1 bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
        {item.name}
      </div>
    )}
  </Link>
);

const Layout: React.FC<{children: React.ReactNode, userEmail?: string}> = ({ children, userEmail }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = () => setIsExpanded(!isExpanded);

  return (
    <div className="min-h-screen bg-gray-50 flex font-inter overflow-x-hidden">
      <aside 
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-50 transition-all duration-500 ease-in-out print:hidden ${
          isExpanded ? 'w-72' : 'w-20'
        }`}
      >
        <div className="flex flex-col flex-grow px-4 py-8 relative">
          <div className={`flex items-center gap-4 px-2 mb-8 group overflow-hidden ${!isExpanded ? 'justify-center' : ''}`}>
            <Link to="/" className="flex items-center gap-4 shrink-0">
              {isExpanded ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h1 className="text-2xl font-black text-[#111111] tracking-tighter leading-none italic uppercase">LÚMEN</h1>
                  <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-transparent mt-1 rounded-full"></div>
                </div>
              ) : (
                <span className="text-xl font-black italic">L.</span>
              )}
            </Link>
          </div>
          
          <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1 scrollbar-hide pb-4 overflow-x-hidden">
            {navigation.map((item, index) => {
                const isSeparator = [3, 10, 14].includes(index);
                return (
                    <React.Fragment key={item.path}>
                        <NavLink item={item} isActive={location.pathname === item.path} isExpanded={isExpanded} />
                        {isSeparator && <div className={`my-4 h-px bg-gray-100 ${isExpanded ? 'mx-2' : 'mx-1'}`} />}
                    </React.Fragment>
                );
            })}
          </nav>

          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className={`px-4 py-3 bg-gray-50 rounded-2xl flex items-center gap-3 overflow-hidden ${!isExpanded ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              {isExpanded && (
                <div className="min-w-0 animate-in fade-in duration-300">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Local</p>
                  <p className="text-xs font-bold text-gray-900 truncate">Estúdio Offline</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={toggleMenu}
            className="absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-violet-600 shadow-sm z-[60] transition-transform hover:scale-110 active:scale-95"
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <main className={`flex-1 min-h-screen transition-all duration-500 ease-in-out print:ml-0 print:min-h-0 ${
        isExpanded ? 'lg:ml-72' : 'lg:ml-20'
      }`}>
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 px-6 flex items-center justify-between print:hidden">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl font-black italic tracking-tighter">LÚMEN</span>
          </Link>
          <button onClick={toggleMenu} className="p-2 bg-gray-50 rounded-lg"><Menu className="w-6 h-6"/></button>
        </div>

        <div className={`pt-24 lg:pt-10 pb-12 px-4 lg:px-12 max-w-[1600px] mx-auto transition-all duration-500 print:pt-0 print:pb-0 print:px-0 print:max-w-none`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

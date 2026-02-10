export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ItemType = 'image' | 'logo' | 'palette' | 'name' | 'slogan' | 'budget' | 'mockup' | 'visual_style' | 'bg_removal' | 'marketing' | 'social_art';

export interface CreativeItem {
  id: string;
  userId: string;
  type: ItemType;
  content: any;
  timestamp: number;
  expiresAt: number; // 3 days after creation
  title: string;
  projectId?: string;
  clientName?: string;
}

export type ProjectStatus = 
  | 'Orçamento - Aguardando' 
  | 'Orçamento - Em Elaboração' 
  | 'Orçamento - Enviado' 
  | 'Aprovado' 
  | 'Criação' 
  | 'Em Produção' 
  | 'Finalizado' 
  | 'Cancelado';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  clientId?: string;
  clientName?: string;
  itemIds: string[];
  status: ProjectStatus;
  timestamp: number;
  category?: string;
  priority?: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  validityDate?: string;
  totalValue?: number;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string;
  sku: string;
  description: string;
  timestamp: number;
  // Novos campos técnicos
  costPrice?: number;
  logisticsCost?: number;
  profitMargin?: number;
  sellingPrice?: number; // Calculated value
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  type: 'Pessoa Física' | 'Empresa';
  whatsapp: string;
  email: string;
  observations?: string;
  timestamp: number;
  // Novo campo
  document?: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  baseCost: number;
}

export interface Budget {
  id: string;
  userId: string;
  clientId?: string;
  projectId?: string;
  items: BudgetItem[];
  margin: number; // Percentage (e.g., 50)
  timestamp: number;
  validityDate?: string;
  artCost?: number;
  isArtIncluded?: boolean;
  category?: string;
  priority?: string;
}

export interface OperationSession {
  id: string;
  user_id: string;
  date?: string; // Tornando opcional
  started_at: string;
  ended_at: string | null;
  duration: string | null;
  timestamp?: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  clientId?: string;
  projectId?: string;
  status: 'A começar' | 'Em criação' | 'Finalizado' | 'Entregue';
  urgency: 'Urgente' | 'Não urgente';
  timestamp: number;
}

export interface FinanceEntry {
  id: string;
  userId: string;
  value: number;
  clientId?: string;
  projectId?: string;
  date: string;
  timestamp: number;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: 'Começar' | 'Urgente' | 'Não Urgente' | 'Esperando';
  timestamp: number;
}
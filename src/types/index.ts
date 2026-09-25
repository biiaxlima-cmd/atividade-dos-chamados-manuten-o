export type UserRole = 'operador' | 'mecanico';

export interface User {
  login: string;
  nome: string;
  cargo: string;
  role: UserRole;
  setor?: string;
  avatar?: string;
}

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica';

export type TicketCategory =
  | 'Mecânica'
  | 'Elétrica'
  | 'Hidráulica'
  | 'Pneumática'
  | 'Lubrificação'
  | 'Estrutural'
  | 'Instrumentação'
  | 'Outro';

export type TicketStatus = 'aberto' | 'em_atendimento' | 'encerrado';

export interface Ticket {
  id: string;
  protocolo: string;
  titulo: string;
  equipamento: string;
  tag_equipamento: string;
  setor: string;
  prioridade: TicketPriority;
  categoria: TicketCategory;
  descricao_problema: string;
  status: TicketStatus;
  
  // Dados do Operador que abriu
  operador_nome: string;
  operador_login: string;
  data_abertura: string;
  
  // Dados do Mecânico que atende e encerra
  mecanico_nome?: string;
  mecanico_login?: string;
  data_inicio_atendimento?: string;
  data_encerramento?: string;
  
  // Resolução do Mecânico
  descricao_solucao?: string;
  pecas_substituidas?: string;
  tempo_parada_minutos?: number;
  causa_raiz?: string;
  observacoes_tecnicas?: string;
  
  // Fotos / Evidências de Manutenção (Supabase Storage)
  foto_problema_url?: string;
  foto_solucao_url?: string;

  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastChecked?: string;
}

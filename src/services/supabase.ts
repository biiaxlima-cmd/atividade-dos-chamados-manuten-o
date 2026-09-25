import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ticket } from '../types';
import { INITIAL_TICKETS } from '../data/initialTickets';

const LOCAL_STORAGE_TICKETS_KEY = 'maint_tickets_v1';
const SUPABASE_URL_KEY = 'maint_supabase_url';
const SUPABASE_KEY_KEY = 'maint_supabase_anon_key';
export const STORAGE_BUCKET_NAME = 'chamados-anexos';

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- SISTEMA DE GESTÃO DE MANUTENÇÃO INDUSTRIAL (SIGMA)
-- SCRIPT COMPLETO COM BANCO DE DADOS E POLÍTICAS DE ARMAZENAMENTO (STORAGE)
-- =========================================================================

-- 1. CRIAÇÃO DA TABELA DE CHAMADOS (TICKETS)
CREATE TABLE IF NOT EXISTS chamados (
  id TEXT PRIMARY KEY,
  protocolo TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  equipamento TEXT NOT NULL,
  tag_equipamento TEXT,
  setor TEXT NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  categoria TEXT NOT NULL,
  descricao_problema TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('aberto', 'em_atendimento', 'encerrado')),
  operador_nome TEXT NOT NULL,
  operador_login TEXT NOT NULL,
  data_abertura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mecanico_nome TEXT,
  mecanico_login TEXT,
  data_inicio_atendimento TIMESTAMPTZ,
  data_encerramento TIMESTAMPTZ,
  descricao_solucao TEXT,
  pecas_substituidas TEXT,
  tempo_parada_minutos INTEGER,
  causa_raiz TEXT,
  observacoes_tecnicas TEXT,
  foto_problema_url TEXT,
  foto_solucao_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HABILITAR ROW LEVEL SECURITY (RLS) NA TABELA DE CHAMADOS
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para a tabela chamados
CREATE POLICY "Permitir leitura de chamados" 
  ON chamados FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção de chamados" 
  ON chamados FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de chamados" 
  ON chamados FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir exclusão de chamados" 
  ON chamados FOR DELETE 
  USING (true);

-- 3. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_data_abertura ON chamados(data_abertura DESC);
CREATE INDEX IF NOT EXISTS idx_chamados_protocolo ON chamados(protocolo);

-- =========================================================================
-- 4. POLÍTICAS DE ARMAZENAMENTO (SUPABASE STORAGE)
-- Nota: O RLS em storage.objects já vem habilitado por padrão pelo Supabase.
-- Nunca execute 'ALTER TABLE storage.objects' pois a tabela pertence ao sistema.
-- =========================================================================

-- A. Criação do Bucket de Armazenamento para Anexos e Fotos de Manutenção
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chamados-anexos',
  'chamados-anexos',
  true,
  10485760, -- Limite de 10 Megabytes por arquivo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'image/svg+xml'
  ];

-- B. Políticas de Armazenamento para storage.objects (Bucket: chamados-anexos)

-- 1. Política de Leitura/Download: Permite visualizar e baixar fotos e documentos anexados
DROP POLICY IF EXISTS "Permitir leitura pública de anexos de chamados" ON storage.objects;
CREATE POLICY "Permitir leitura pública de anexos de chamados"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chamados-anexos');

-- 2. Política de Upload: Permite enviar fotos do problema e fotos da peça consertada
DROP POLICY IF EXISTS "Permitir upload de anexos de chamados" ON storage.objects;
CREATE POLICY "Permitir upload de anexos de chamados"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chamados-anexos');

-- 3. Política de Atualização: Permite substituir ou atualizar arquivo anexado
DROP POLICY IF EXISTS "Permitir atualização de anexos de chamados" ON storage.objects;
CREATE POLICY "Permitir atualização de anexos de chamados"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'chamados-anexos')
WITH CHECK (bucket_id = 'chamados-anexos');

-- 4. Política de Exclusão: Permite remover anexos caso necessário
DROP POLICY IF EXISTS "Permitir exclusão de anexos de chamados" ON storage.objects;
CREATE POLICY "Permitir exclusão de anexos de chamados"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chamados-anexos');
`;

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getActiveSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const localUrl = (localStorage.getItem(SUPABASE_URL_KEY) || '').trim();
  const localKey = (localStorage.getItem(SUPABASE_KEY_KEY) || '').trim();

  const url = localUrl || envUrl;
  const anonKey = localKey || envKey;

  const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
  const isConfigured = Boolean(isValidUrl && anonKey && anonKey !== 'your-anon-key');

  return { url, anonKey, isConfigured };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getActiveSupabaseConfig();

  if (!isConfigured) {
    cachedClient = null;
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: false }
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Erro ao instanciar Supabase Client:', err);
    return null;
  }
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  cachedClient = null;
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
  cachedClient = null;
}

export async function testSupabaseConnection(urlToTest?: string, keyToTest?: string): Promise<{ success: boolean; message: string; tableReady?: boolean; storageReady?: boolean }> {
  try {
    const { url: currentUrl, anonKey: currentKey } = getActiveSupabaseConfig();
    const testUrl = (urlToTest !== undefined ? urlToTest : currentUrl).trim();
    const testKey = (keyToTest !== undefined ? keyToTest : currentKey).trim();

    if (!testUrl || !testKey) {
      return { success: false, message: 'URL e Chave Anon do Supabase são obrigatórias.' };
    }

    if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
      return { success: false, message: 'A URL deve começar com https:// (ex: https://xyz.supabase.co)' };
    }

    const tempClient = createClient(testUrl, testKey, { auth: { persistSession: false } });

    // Testa consulta à tabela chamados
    const { data, error } = await tempClient.from('chamados').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.toLowerCase().includes('does not exist')) {
        return {
          success: true,
          tableReady: false,
          storageReady: false,
          message: 'Conectado com sucesso ao Supabase! A tabela "chamados" ou o bucket ainda não existem. Execute o script SQL no Supabase para criá-los.'
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }

    // Testa se o bucket de storage existe
    const { data: buckets } = await tempClient.storage.listBuckets();
    const storageFound = buckets?.some(b => b.name === STORAGE_BUCKET_NAME) ?? false;

    return {
      success: true,
      tableReady: true,
      storageReady: storageFound,
      message: `Conectado com sucesso! Tabela "chamados" verificada (${data?.length ?? 0} registros). ${
        storageFound ? 'Bucket de armazenamento "chamados-anexos" ativo com políticas RLS!' : 'Dica: Execute o script SQL para habilitar o bucket de armazenamento.'
      }`
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha desconhecida ao conectar ao Supabase.' };
  }
}

// Upload de anexo / foto para o Supabase Storage com fallback base64
export async function uploadAttachment(file: File, folder: 'problemas' | 'solucoes'): Promise<string> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

      const { data, error } = await client.storage
        .from(STORAGE_BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = client.storage
          .from(STORAGE_BUCKET_NAME)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('Falha no upload para Supabase Storage, utilizando fallback local:', error.message);
      }
    } catch (err) {
      console.warn('Erro ao enviar para Supabase Storage:', err);
    }
  }

  // Fallback seguro usando Data URL para teste sem Supabase Storage configurado
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// Local Storage Handlers
export function getLocalTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TICKETS;
  } catch {
    return INITIAL_TICKETS;
  }
}

export function saveLocalTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Falha ao salvar no localStorage:', err);
  }
}

// Unified Service to fetch Tickets (Supabase with Local Fallback)
export async function fetchAllTickets(): Promise<{ tickets: Ticket[]; isUsingSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      tickets: getLocalTickets(),
      isUsingSupabase: false
    };
  }

  try {
    const { data, error } = await client
      .from('chamados')
      .select('*')
      .order('data_abertura', { ascending: false });

    if (error) {
      console.warn('Erro ao consultar Supabase, utilizando dados locais:', error.message);
      return {
        tickets: getLocalTickets(),
        isUsingSupabase: false,
        error: `Supabase: ${error.message}. Carregando armazenamento local.`
      };
    }

    if (data && Array.isArray(data)) {
      if (data.length === 0) {
        const local = getLocalTickets();
        return {
          tickets: local,
          isUsingSupabase: true
        };
      }
      const mappedTickets: Ticket[] = data.map((row: any) => ({
        id: String(row.id),
        protocolo: row.protocolo || `OS-${row.id}`,
        titulo: row.titulo,
        equipamento: row.equipamento,
        tag_equipamento: row.tag_equipamento || '',
        setor: row.setor,
        prioridade: row.prioridade,
        categoria: row.categoria,
        descricao_problema: row.descricao_problema,
        status: row.status,
        operador_nome: row.operador_nome,
        operador_login: row.operador_login,
        data_abertura: row.data_abertura || row.created_at || new Date().toISOString(),
        mecanico_nome: row.mecanico_nome || undefined,
        mecanico_login: row.mecanico_login || undefined,
        data_inicio_atendimento: row.data_inicio_atendimento || undefined,
        data_encerramento: row.data_encerramento || undefined,
        descricao_solucao: row.descricao_solucao || undefined,
        pecas_substituidas: row.pecas_substituidas || undefined,
        tempo_parada_minutos: row.tempo_parada_minutos ? Number(row.tempo_parada_minutos) : undefined,
        causa_raiz: row.causa_raiz || undefined,
        observacoes_tecnicas: row.observacoes_tecnicas || undefined,
        foto_problema_url: row.foto_problema_url || undefined,
        foto_solucao_url: row.foto_solucao_url || undefined,
        created_at: row.created_at || undefined,
      }));

      saveLocalTickets(mappedTickets);
      return { tickets: mappedTickets, isUsingSupabase: true };
    }

    return { tickets: getLocalTickets(), isUsingSupabase: false };
  } catch (err: any) {
    console.error('Falha de rede com Supabase:', err);
    return {
      tickets: getLocalTickets(),
      isUsingSupabase: false,
      error: 'Não foi possível conectar ao Supabase. Modo offline/local ativado.'
    };
  }
}

// Inserir novo chamado
export async function createTicketService(newTicket: Ticket): Promise<{ success: boolean; isUsingSupabase: boolean; error?: string }> {
  const current = getLocalTickets();
  const updated = [newTicket, ...current.filter(t => t.id !== newTicket.id)];
  saveLocalTickets(updated);

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, isUsingSupabase: false };
  }

  try {
    const payload = {
      id: newTicket.id,
      protocolo: newTicket.protocolo,
      titulo: newTicket.titulo,
      equipamento: newTicket.equipamento,
      tag_equipamento: newTicket.tag_equipamento,
      setor: newTicket.setor,
      prioridade: newTicket.prioridade,
      categoria: newTicket.categoria,
      descricao_problema: newTicket.descricao_problema,
      status: newTicket.status,
      operador_nome: newTicket.operador_nome,
      operador_login: newTicket.operador_login,
      data_abertura: newTicket.data_abertura,
      foto_problema_url: newTicket.foto_problema_url || null,
      foto_solucao_url: newTicket.foto_solucao_url || null,
      created_at: newTicket.created_at || new Date().toISOString()
    };

    const { error } = await client.from('chamados').insert([payload]);

    if (error) {
      console.warn('Erro ao inserir no Supabase (salvo localmente):', error.message);
      return { success: true, isUsingSupabase: false, error: error.message };
    }

    return { success: true, isUsingSupabase: true };
  } catch (err: any) {
    console.error('Erro de rede ao salvar chamado no Supabase:', err);
    return { success: true, isUsingSupabase: false, error: err.message };
  }
}

// Atualizar chamado
export async function updateTicketService(updatedTicket: Ticket): Promise<{ success: boolean; isUsingSupabase: boolean; error?: string }> {
  const current = getLocalTickets();
  const next = current.map(t => (t.id === updatedTicket.id ? updatedTicket : t));
  saveLocalTickets(next);

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, isUsingSupabase: false };
  }

  try {
    const payload: Record<string, any> = {
      status: updatedTicket.status,
      mecanico_nome: updatedTicket.mecanico_nome || null,
      mecanico_login: updatedTicket.mecanico_login || null,
      data_inicio_atendimento: updatedTicket.data_inicio_atendimento || null,
      data_encerramento: updatedTicket.data_encerramento || null,
      descricao_solucao: updatedTicket.descricao_solucao || null,
      pecas_substituidas: updatedTicket.pecas_substituidas || null,
      tempo_parada_minutos: updatedTicket.tempo_parada_minutos ?? null,
      causa_raiz: updatedTicket.causa_raiz || null,
      observacoes_tecnicas: updatedTicket.observacoes_tecnicas || null,
      foto_problema_url: updatedTicket.foto_problema_url || null,
      foto_solucao_url: updatedTicket.foto_solucao_url || null,
    };

    const { error } = await client
      .from('chamados')
      .update(payload)
      .eq('id', updatedTicket.id);

    if (error) {
      console.warn('Erro ao atualizar no Supabase (salvo localmente):', error.message);
      return { success: true, isUsingSupabase: false, error: error.message };
    }

    return { success: true, isUsingSupabase: true };
  } catch (err: any) {
    console.error('Erro de conexão ao atualizar chamado no Supabase:', err);
    return { success: true, isUsingSupabase: false, error: err.message };
  }
}

// Sincronizar todos os chamados locais com o Supabase
export async function syncAllLocalToSupabase(): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { count: 0, error: 'Supabase não está configurado.' };
  }

  try {
    const local = getLocalTickets();
    if (local.length === 0) return { count: 0 };

    const payload = local.map(t => ({
      id: t.id,
      protocolo: t.protocolo,
      titulo: t.titulo,
      equipamento: t.equipamento,
      tag_equipamento: t.tag_equipamento,
      setor: t.setor,
      prioridade: t.prioridade,
      categoria: t.categoria,
      descricao_problema: t.descricao_problema,
      status: t.status,
      operador_nome: t.operador_nome,
      operador_login: t.operador_login,
      data_abertura: t.data_abertura,
      mecanico_nome: t.mecanico_nome || null,
      mecanico_login: t.mecanico_login || null,
      data_inicio_atendimento: t.data_inicio_atendimento || null,
      data_encerramento: t.data_encerramento || null,
      descricao_solucao: t.descricao_solucao || null,
      pecas_substituidas: t.pecas_substituidas || null,
      tempo_parada_minutos: t.tempo_parada_minutos ?? null,
      causa_raiz: t.causa_raiz || null,
      observacoes_tecnicas: t.observacoes_tecnicas || null,
      foto_problema_url: t.foto_problema_url || null,
      foto_solucao_url: t.foto_solucao_url || null,
    }));

    const { error } = await client.from('chamados').upsert(payload, { onConflict: 'id' });

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: payload.length };
  } catch (err: any) {
    return { count: 0, error: err.message || 'Falha na sincronização.' };
  }
}

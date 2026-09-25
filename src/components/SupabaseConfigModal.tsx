import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Server
} from 'lucide-react';
import {
  getActiveSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  syncAllLocalToSupabase,
  SUPABASE_SQL_SCHEMA
} from '../services/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableReady?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveSupabaseConfig();
      setUrl(active.url);
      setAnonKey(active.anonKey);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = async () => {
    saveSupabaseConfig(url, anonKey);
    onConfigChanged();
    await handleTestConnection();
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult({
      success: true,
      message: 'Configurações removidas. O sistema agora opera com o banco de dados local seguro.'
    });
    onConfigChanged();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncAllLocalToSupabase();
    if (res.error) {
      setSyncResult(`Falha na sincronização: ${res.error}`);
    } else {
      setSyncResult(`${res.count} chamado(s) sincronizados com o Supabase com sucesso!`);
      onConfigChanged();
    }
    setSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuração do Banco de Dados Supabase</h3>
              <p className="text-xs text-slate-400">Conecte sua conta do Supabase para persistência dos chamados em nuvem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Instructions Box */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Como conectar ao seu projeto Supabase:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
              <li>Acesse seu painel no <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-1">Supabase <ExternalLink className="w-3 h-3 inline" /></a>.</li>
              <li>Vá em <strong>Project Settings → API</strong> e copie a <strong>Project URL</strong> e a <strong>anon / public key</strong>.</li>
              <li>Cole nos campos abaixo e clique em <strong>Salvar e Testar</strong>.</li>
              <li>Copie o script SQL abaixo e execute no <strong>SQL Editor</strong> do Supabase para criar a tabela.</li>
            </ol>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo-seu-projeto.supabase.co"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Test Connection Result */}
            {testResult && (
              <div
                className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{testResult.success ? 'Status da Conexão' : 'Falha na Conexão'}</div>
                  <div className="mt-0.5 leading-relaxed">{testResult.message}</div>
                </div>
              </div>
            )}

            {syncResult && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400" />
                <span>{syncResult}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={testing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-2"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>Salvar e Testar Conexão</span>
              </button>

              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={syncing || !url || !anonKey}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs border border-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Enviar Chamados Locais para o Supabase</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg text-xs transition-colors ml-auto"
              >
                Usar Apenas Armazenamento Local
              </button>
            </div>
          </div>

          {/* SQL Script Section */}
          <div className="border-t border-slate-800 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Script SQL: Banco de Dados + Políticas de Armazenamento (Storage)
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    RLS & Bucket Ativos
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cria a tabela <code className="text-emerald-400">chamados</code>, o bucket <code className="text-emerald-400">chamados-anexos</code> e as políticas de upload e visualização.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold transition-colors shrink-0 shadow-xs"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script SQL Completo</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-56 leading-relaxed select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Suporte a fallback offline automático caso o Supabase fique indisponível</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

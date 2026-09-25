import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Wrench, HardHat, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Database, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onOpenSupabaseConfig: () => void;
  isSupabaseConfigured: boolean;
}

const PRECONFIGURED_USERS: Record<string, { pass: string; user: User }> = {
  operador: {
    pass: 'operador123',
    user: {
      login: 'operador',
      nome: 'Carlos Eduardo',
      cargo: 'Operador de Produção & Usinagem',
      role: 'operador',
      setor: 'Usinagem de Precisão'
    }
  },
  mecanico: {
    pass: 'mecanico123',
    user: {
      login: 'mecanico',
      nome: 'Roberto Santos',
      cargo: 'Mecânico de Manutenção Industrial',
      role: 'mecanico',
      setor: 'Oficina Central de Manutenção'
    }
  }
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onOpenSupabaseConfig,
  isSupabaseConfigured
}) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedLogin = login.trim().toLowerCase();
    const config = PRECONFIGURED_USERS[trimmedLogin];

    if (!config) {
      setError('Usuário não encontrado. Utilize "operador" ou "mecanico".');
      return;
    }

    if (config.pass !== password) {
      setError('Senha incorreta. Verifique os dados de acesso.');
      return;
    }

    onLogin(config.user);
  };

  const handleQuickSelect = (role: UserRole) => {
    setError(null);
    if (role === 'operador') {
      setLogin('operador');
      setPassword('operador123');
    } else {
      setLogin('mecanico');
      setPassword('mecanico123');
    }
  };

  const handleDirectLogin = (role: UserRole) => {
    const config = PRECONFIGURED_USERS[role];
    onLogin(config.user);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background industrial pattern accent */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Header Bar */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">SIGMA Manutenção</h1>
            <p className="text-xs text-slate-400">Sistema Integrado de Gestão e Ordens de Serviço</p>
          </div>
        </div>

        <button
          onClick={onOpenSupabaseConfig}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Configurar Supabase'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-8">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Acesso ao Sistema</h2>
            <p className="text-sm text-slate-400 mt-1">
              Informe suas credenciais ou utilize os atalhos de perfil abaixo.
            </p>
          </div>

          {/* Quick Profile Selectors */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Acesso Rápido por Perfil
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Operador Card */}
              <button
                type="button"
                onClick={() => handleDirectLogin('operador')}
                className="group p-3 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-900 text-left transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Operador</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Abre chamados</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">operador / operador123</div>
                </div>
              </button>

              {/* Mecânico Card */}
              <button
                type="button"
                onClick={() => handleDirectLogin('mecanico')}
                className="group p-3 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-900 text-left transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Mecânico</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Encerra chamados</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">mecanico / mecanico123</div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-700 w-full" />
            <span className="bg-slate-800 px-3 text-xs text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Ou digite os dados
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Usuário / Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="operador ou mecanico"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('operador')}
                className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
              >
                Preencher Operador
              </button>
              <span className="text-slate-600 text-xs">·</span>
              <button
                type="button"
                onClick={() => handleQuickSelect('mecanico')}
                className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
              >
                Preencher Mecânico
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>

        {/* Security & Access Info */}
        <div className="mt-4 p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-300 font-medium">Controle de Acesso Baseado em Funções:</span>
            <p className="mt-0.5 text-slate-400 text-[11px] leading-relaxed">
              O <strong className="text-slate-200">Operador</strong> tem permissão exclusiva para registrar novos chamados descrevendo o problema. O <strong className="text-slate-200">Mecânico</strong> possui permissão para assumir e encerrar chamados descrevendo o serviço executado.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
        <span>Sistema de Abertura e Encerramento de Chamados · Manutenção Preventiva e Corretiva</span>
      </div>
    </div>
  );
};

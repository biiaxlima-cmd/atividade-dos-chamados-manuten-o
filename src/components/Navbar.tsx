import React from 'react';
import { User } from '../types';
import { LogOut, Database, HardHat, Wrench } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onOpenSupabaseConfig: () => void;
  isSupabaseConfigured: boolean;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenSupabaseConfig,
  isSupabaseConfigured,
  activeFilter,
  onSelectFilter
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              SIGMA Manutenção
            </span>
          </div>

          {/* Zone 2: Navigation / Quick View Filters */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => onSelectFilter('todos')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeFilter === 'todos' ? 'text-amber-400 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Todos os Chamados
            </button>
            <button
              onClick={() => onSelectFilter('aberto')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeFilter === 'aberto' ? 'text-amber-400 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Abertos
            </button>
            <button
              onClick={() => onSelectFilter('em_atendimento')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeFilter === 'em_atendimento' ? 'text-amber-400 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Em Atendimento
            </button>
            <button
              onClick={() => onSelectFilter('encerrado')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeFilter === 'encerrado' ? 'text-amber-400 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Encerrados
            </button>
          </nav>

          {/* Zone 3: Primary Actions and User Identity */}
          <div className="flex items-center gap-3">
            {/* Supabase Status Trigger */}
            <button
              onClick={onOpenSupabaseConfig}
              title={isSupabaseConfigured ? 'Conectado ao Supabase' : 'Banco local ativo - Clique para configurar Supabase'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors whitespace-nowrap"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isSupabaseConfigured ? 'Supabase' : 'DB Local'}
              </span>
            </button>

            {/* User Profile Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                {currentUser.role === 'operador' ? (
                  <HardHat className="w-4 h-4 text-amber-400" />
                ) : (
                  <Wrench className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">{currentUser.nome}</div>
                <div className="text-[11px] text-slate-400 capitalize">
                  {currentUser.role === 'operador' ? 'Operador de Produção' : 'Mecânico de Manutenção'}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Sair da conta"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

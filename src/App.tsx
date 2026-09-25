import React, { useState, useEffect, useCallback } from 'react';
import { User, Ticket } from './types';
import { LoginForm } from './components/LoginForm';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { TicketList } from './components/TicketList';
import { NewTicketModal } from './components/NewTicketModal';
import { CloseTicketModal } from './components/CloseTicketModal';
import { TicketDetailsModal } from './components/TicketDetailsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import {
  getActiveSupabaseConfig,
  fetchAllTickets,
  createTicketService,
  updateTicketService
} from './services/supabase';
import {
  HardHat,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  CheckCircle,
  Database
} from 'lucide-react';

const CURRENT_USER_KEY = 'maint_current_user_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Filters & Modals
  const [activeFilter, setActiveFilter] = useState('todos');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setSupabaseError(null);
    try {
      const result = await fetchAllTickets();
      setTickets(result.tickets);
      setIsUsingSupabase(result.isUsingSupabase);
      if (result.error) {
        setSupabaseError(result.error);
      }
    } catch (err: any) {
      console.error('Erro ao carregar chamados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.error(err);
    }
    showToast(`Bem-vindo, ${user.nome}! Conectado como ${user.role === 'operador' ? 'Operador' : 'Mecânico'}.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  const handleQuickSwitchRole = () => {
    if (!currentUser) return;
    if (currentUser.role === 'operador') {
      const mec: User = {
        login: 'mecanico',
        nome: 'Roberto Santos',
        cargo: 'Mecânico de Manutenção Industrial',
        role: 'mecanico',
        setor: 'Oficina Central de Manutenção'
      };
      handleLogin(mec);
    } else {
      const op: User = {
        login: 'operador',
        nome: 'Carlos Eduardo',
        cargo: 'Operador de Produção & Usinagem',
        role: 'operador',
        setor: 'Usinagem de Precisão'
      };
      handleLogin(op);
    }
  };

  const handleCreateTicket = async (newTicket: Ticket) => {
    const res = await createTicketService(newTicket);
    setTickets((prev) => [newTicket, ...prev.filter((t) => t.id !== newTicket.id)]);
    showToast(
      `Chamado ${newTicket.protocolo} aberto com sucesso! ${
        res.isUsingSupabase ? '(Salvo no Supabase)' : '(Salvo localmente)'
      }`
    );
  };

  const handleCloseTicket = async (updatedTicket: Ticket) => {
    const res = await updateTicketService(updatedTicket);
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    showToast(
      `Chamado ${updatedTicket.protocolo} encerrado com sucesso pelo mecânico! ${
        res.isUsingSupabase ? '(Atualizado no Supabase)' : '(Atualizado localmente)'
      }`
    );
  };

  const handleStartService = async (ticket: Ticket) => {
    if (!currentUser || currentUser.role !== 'mecanico') return;

    const nowIso = new Date().toISOString();
    const updated: Ticket = {
      ...ticket,
      status: 'em_atendimento',
      mecanico_nome: currentUser.nome,
      mecanico_login: currentUser.login,
      data_inicio_atendimento: nowIso
    };

    const res = await updateTicketService(updated);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (selectedTicket && selectedTicket.id === ticket.id) {
      setSelectedTicket(updated);
    }
    showToast(
      `Você assumiu o chamado ${ticket.protocolo}. Status alterado para Em Atendimento. ${
        res.isUsingSupabase ? '(Supabase)' : ''
      }`
    );
  };

  const supabaseConfig = getActiveSupabaseConfig();

  // If not logged in, render the login form
  if (!currentUser) {
    return (
      <>
        <LoginForm
          onLogin={handleLogin}
          onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
          isSupabaseConfigured={supabaseConfig.isConfigured}
        />
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onConfigChanged={loadData}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        isSupabaseConfigured={supabaseConfig.isConfigured}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role Banner / Contextual Guide */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                currentUser.role === 'operador'
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
              }`}
            >
              {currentUser.role === 'operador' ? (
                <HardHat className="w-5 h-5" />
              ) : (
                <Wrench className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  Painel do {currentUser.role === 'operador' ? 'Operador' : 'Mecânico'}
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-mono">@{currentUser.login}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {currentUser.role === 'operador' ? (
                  <>
                    Como <strong>Operador</strong>, você deve registrar o chamado e descrever minuciosamente o problema observado na máquina para a equipe de manutenção.
                  </>
                ) : (
                  <>
                    Como <strong>Mecânico</strong>, você deve inspecionar a ocorrência, assumir o atendimento e ao concluir <strong>encerrar o chamado descrevendo o que foi feito</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser.role === 'operador' ? (
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Abrir Chamado</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveFilter('aberto')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Ver Chamados Pendentes</span>
              </button>
            )}

            {/* Quick Toggle to other role */}
            <button
              onClick={handleQuickSwitchRole}
              title={`Alternar para ${currentUser.role === 'operador' ? 'Mecânico' : 'Operador'}`}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Alternar para {currentUser.role === 'operador' ? 'Mecânico' : 'Operador'}</span>
            </button>
          </div>
        </div>

        {/* Database Status Alert (if needed) */}
        {supabaseError && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{supabaseError}</span>
            </div>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="underline text-amber-200 hover:text-white font-medium whitespace-nowrap ml-2"
            >
              Ajustar Conexão Supabase
            </button>
          </div>
        )}

        {/* Key Operational Metrics */}
        <StatsBar tickets={tickets} />

        {/* Loading Indicator or Tickets View */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-mono">Carregando ordens de serviço...</p>
          </div>
        ) : (
          <TicketList
            tickets={tickets}
            currentUser={currentUser}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            onOpenNewModal={() => setIsNewModalOpen(true)}
            onOpenDetailsModal={(ticket) => {
              setSelectedTicket(ticket);
              setIsDetailsModalOpen(true);
            }}
            onOpenCloseModal={(ticket) => {
              setSelectedTicket(ticket);
              setIsCloseModalOpen(true);
            }}
            onStartService={handleStartService}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        currentUser={currentUser}
        onSubmit={handleCreateTicket}
      />

      <CloseTicketModal
        isOpen={isCloseModalOpen}
        onClose={() => {
          setIsCloseModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        currentUser={currentUser}
        onSubmit={handleCloseTicket}
      />

      <TicketDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        currentUser={currentUser}
        onStartService={handleStartService}
        onOpenCloseModal={(t) => {
          setSelectedTicket(t);
          setIsCloseModalOpen(true);
        }}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigChanged={loadData}
      />
    </div>
  );
}

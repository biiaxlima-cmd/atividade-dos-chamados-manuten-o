import React, { useState, useMemo } from 'react';
import { Ticket, User, TicketPriority } from '../types';
import {
  Search,
  Plus,
  Filter,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  HardHat,
  ChevronRight,
  Eye,
  CheckCheck
} from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  currentUser: User;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  onOpenNewModal: () => void;
  onOpenDetailsModal: (ticket: Ticket) => void;
  onOpenCloseModal: (ticket: Ticket) => void;
  onStartService: (ticket: Ticket) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  currentUser,
  activeFilter,
  onSelectFilter,
  onOpenNewModal,
  onOpenDetailsModal,
  onOpenCloseModal,
  onStartService
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('todas');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Status filter
      if (activeFilter !== 'todos' && ticket.status !== activeFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'todas' && ticket.prioridade !== priorityFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'todas' && ticket.categoria !== categoryFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = ticket.titulo.toLowerCase().includes(query);
        const matchEquip = ticket.equipamento.toLowerCase().includes(query);
        const matchTag = ticket.tag_equipamento?.toLowerCase().includes(query);
        const matchProto = ticket.protocolo.toLowerCase().includes(query);
        const matchDesc = ticket.descricao_problema.toLowerCase().includes(query);
        const matchSetor = ticket.setor.toLowerCase().includes(query);
        const matchOperador = ticket.operador_nome.toLowerCase().includes(query);
        const matchMecanico = ticket.mecanico_nome?.toLowerCase().includes(query);

        if (!matchTitle && !matchEquip && !matchTag && !matchProto && !matchDesc && !matchSetor && !matchOperador && !matchMecanico) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, activeFilter, priorityFilter, categoryFilter, searchTerm]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const priorityMeta: Record<TicketPriority, { label: string; text: string }> = {
    baixa: { label: 'Baixa', text: 'text-emerald-400' },
    media: { label: 'Média', text: 'text-amber-400' },
    alta: { label: 'Alta', text: 'text-orange-400' },
    critica: { label: 'Crítica', text: 'text-rose-400' }
  };

  const statusMeta: Record<string, { label: string; dot: string; text: string }> = {
    aberto: { label: 'Aberto', dot: 'bg-amber-400', text: 'text-amber-400' },
    em_atendimento: { label: 'Em Atendimento', dot: 'bg-blue-400', text: 'text-blue-400' },
    encerrado: { label: 'Encerrado', dot: 'bg-emerald-400', text: 'text-emerald-400' }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Control Bar: Search & Filters */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs (Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'aberto', label: 'Abertos' },
            { id: 'em_atendimento', label: 'Em Atendimento' },
            { id: 'encerrado', label: 'Encerrados' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar máquina, protocolo, descrição..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todas">Todas Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>

          {/* Primary Action Button based on Role */}
          {currentUser.role === 'operador' ? (
            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Abrir Novo Chamado</span>
            </button>
          ) : (
            <div className="text-xs text-blue-400 font-medium px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
              Painel do Mecânico (Encerramento & Reparo)
            </div>
          )}
        </div>
      </div>

      {/* Tickets List View */}
      {filteredTickets.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">Nenhum chamado encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm || priorityFilter !== 'todas' || categoryFilter !== 'todas'
              ? 'Tente ajustar os filtros ou o termo de pesquisa.'
              : 'Não há registros com este status no momento.'}
          </p>
          {currentUser.role === 'operador' && (
            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Abrir Chamado Agora</span>
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {filteredTickets.map((ticket) => {
            const pMeta = priorityMeta[ticket.prioridade] || priorityMeta.media;
            const sMeta = statusMeta[ticket.status] || statusMeta.aberto;

            return (
              <div
                key={ticket.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left zone: Status, Protocol, Machine, Title, Description */}
                <div className="flex-1 min-w-0">
                  {/* Metadata line without static pills */}
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mb-1">
                    <span className="font-mono font-medium text-slate-300">{ticket.protocolo}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className={`flex items-center gap-1 font-medium ${sMeta.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sMeta.dot}`} />
                      {sMeta.label}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className={`font-medium ${pMeta.text}`}>Prioridade {pMeta.label}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{ticket.categoria}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{ticket.setor}</span>
                  </div>

                  {/* Main Title & Equipment */}
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {ticket.titulo}
                    </h4>
                  </div>

                  <div className="text-xs font-medium text-amber-400/90 mt-0.5">
                    {ticket.equipamento} {ticket.tag_equipamento ? `(${ticket.tag_equipamento})` : ''}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1 leading-relaxed">
                    {ticket.status === 'encerrado' && ticket.descricao_solucao
                      ? `[Solução Executada]: ${ticket.descricao_solucao}`
                      : ticket.descricao_problema}
                  </p>

                  {/* Footer metadata: Operator opening & Mechanic resolution */}
                  <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500 mt-2 font-mono">
                    <span>Aberto por: {ticket.operador_nome} em {formatDate(ticket.data_abertura)}</span>
                    {ticket.mecanico_nome && (
                      <>
                        <span className="text-slate-700">|</span>
                        <span className="text-slate-400">
                          Mecânico: {ticket.mecanico_nome}
                          {ticket.data_encerramento ? ` (Encerrado em ${formatDate(ticket.data_encerramento)})` : ' (Em atendimento)'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right zone: Contextual action buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenDetailsModal(ticket)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Detalhes</span>
                  </button>

                  {/* Mecânico Actions */}
                  {currentUser.role === 'mecanico' && ticket.status === 'aberto' && (
                    <button
                      type="button"
                      onClick={() => onStartService(ticket)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-200 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Assumir</span>
                    </button>
                  )}

                  {currentUser.role === 'mecanico' && ticket.status !== 'encerrado' && (
                    <button
                      type="button"
                      onClick={() => onOpenCloseModal(ticket)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Encerrar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

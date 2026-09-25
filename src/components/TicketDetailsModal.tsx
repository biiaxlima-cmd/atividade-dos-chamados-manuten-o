import React from 'react';
import { Ticket, User } from '../types';
import {
  X,
  Printer,
  Clock,
  Wrench,
  HardHat,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Tag,
  MapPin,
  Flame,
  CheckCheck,
  Camera,
  ExternalLink
} from 'lucide-react';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  currentUser: User;
  onStartService?: (ticket: Ticket) => void;
  onOpenCloseModal?: (ticket: Ticket) => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  isOpen,
  onClose,
  ticket,
  currentUser,
  onStartService,
  onOpenCloseModal
}) => {
  if (!isOpen || !ticket) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const priorityStyles: Record<string, { label: string; text: string; bg: string }> = {
    baixa: { label: 'Baixa', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    media: { label: 'Média', text: 'text-amber-400', bg: 'bg-amber-500/10' },
    alta: { label: 'Alta', text: 'text-orange-400', bg: 'bg-orange-500/10' },
    critica: { label: 'Crítica / Linha Parada', text: 'text-rose-400', bg: 'bg-rose-500/10' }
  };

  const statusStyles: Record<string, { label: string; text: string; dot: string }> = {
    aberto: { label: 'Aberto (Aguardando Atendimento)', text: 'text-amber-400', dot: 'bg-amber-400' },
    em_atendimento: { label: 'Em Atendimento Técnico', text: 'text-blue-400', dot: 'bg-blue-400' },
    encerrado: { label: 'Encerrado / Concluído', text: 'text-emerald-400', dot: 'bg-emerald-400' }
  };

  const pConfig = priorityStyles[ticket.prioridade] || priorityStyles.media;
  const sConfig = statusStyles[ticket.status] || statusStyles.aberto;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between print:border-b-2 print:border-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 print:hidden">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 print:bg-slate-100 print:text-black">
                  {ticket.protocolo}
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600">· Ordem de Serviço de Manutenção</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5 print:text-black">{ticket.titulo}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              title="Imprimir Ordem de Serviço"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Key metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 print:bg-slate-50 print:border-slate-200">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Status Atual</span>
              <span className={`text-xs font-semibold flex items-center gap-1.5 mt-1 ${sConfig.text} print:text-slate-900`}>
                <span className={`w-2 h-2 rounded-full ${sConfig.dot} shrink-0`} />
                {sConfig.label}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Prioridade</span>
              <span className={`text-xs font-semibold mt-1 block ${pConfig.text} print:text-slate-900`}>
                {pConfig.label}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Equipamento / TAG</span>
              <span className="text-xs font-medium text-slate-200 mt-1 block font-mono print:text-slate-900">
                {ticket.tag_equipamento || '—'} · {ticket.equipamento}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Setor Fabril</span>
              <span className="text-xs font-medium text-slate-200 mt-1 block print:text-slate-900">
                {ticket.setor}
              </span>
            </div>
          </div>

          {/* Section 1: Relato do Operador (Abertura) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
            <div className="bg-slate-800/50 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between print:bg-slate-100 print:border-slate-300">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-400 print:text-slate-800" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
                  1. Registro do Operador (Abertura do Chamado)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 print:text-slate-600">
                {formatDate(ticket.data_abertura)}
              </span>
            </div>

            <div className="p-4 space-y-3 bg-slate-900/40 print:bg-white">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 print:text-slate-700">
                <div>
                  <span className="text-slate-500">Operador: </span>
                  <strong className="text-slate-300 print:text-slate-900">{ticket.operador_nome}</strong>
                  <span className="text-[11px] text-slate-500 font-mono ml-1">(@{ticket.operador_login})</span>
                </div>
                <div>·</div>
                <div>
                  <span className="text-slate-500">Categoria: </span>
                  <strong className="text-slate-300 print:text-slate-900">{ticket.categoria}</strong>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1 print:text-slate-900">
                  Descrição do Problema / Sintoma Observado:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-200 print:text-black">
                  {ticket.descricao_problema}
                </p>
              </div>

              {ticket.foto_problema_url && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5 print:text-slate-900">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Foto / Evidência da Falha Registrada pelo Operador:</span>
                  </span>
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-2 inline-block">
                    <img
                      src={ticket.foto_problema_url}
                      alt="Evidência da falha"
                      className="max-h-60 max-w-full rounded object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Atendimento e Resolução do Mecânico */}
          <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
            <div className="bg-slate-800/50 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between print:bg-slate-100 print:border-slate-300">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400 print:text-slate-800" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
                  2. Diagnóstico e Encerramento pelo Mecânico
                </h3>
              </div>
              {ticket.data_encerramento && (
                <span className="text-xs font-mono text-emerald-400 print:text-emerald-700">
                  Encerrado em: {formatDate(ticket.data_encerramento)}
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-900/40 print:bg-white space-y-4">
              {ticket.status === 'aberto' ? (
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center text-xs text-amber-300/80">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                  <span>Chamado aguardando atuação da equipe mecânica de manutenção.</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 print:text-slate-700">
                    <div>
                      <span className="text-slate-500">Mecânico Responsável: </span>
                      <strong className="text-slate-300 print:text-slate-900">{ticket.mecanico_nome || '—'}</strong>
                      {ticket.mecanico_login && (
                        <span className="text-[11px] text-slate-500 font-mono ml-1">(@{ticket.mecanico_login})</span>
                      )}
                    </div>
                    {ticket.data_inicio_atendimento && (
                      <>
                        <div>·</div>
                        <div>
                          <span className="text-slate-500">Início: </span>
                          <span className="font-mono">{formatDate(ticket.data_inicio_atendimento)}</span>
                        </div>
                      </>
                    )}
                    {ticket.tempo_parada_minutos !== undefined && (
                      <>
                        <div>·</div>
                        <div>
                          <span className="text-slate-500">Tempo de Parada: </span>
                          <strong className="text-slate-200 font-mono">{ticket.tempo_parada_minutos} min</strong>
                        </div>
                      </>
                    )}
                  </div>

                  {ticket.descricao_solucao ? (
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block mb-1 print:text-slate-900">
                        Serviço Executado (O que foi feito pelo mecânico):
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-200 print:text-black">
                        {ticket.descricao_solucao}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-blue-400 italic">
                      Mecânico está em atendimento no local inspecionando o equipamento.
                    </div>
                  )}

                  {ticket.pecas_substituidas && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Peças Substituídas:</span>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 print:bg-slate-50 print:border-slate-200">
                          {ticket.pecas_substituidas}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Causa Raiz Identificada:</span>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 print:bg-slate-50 print:border-slate-200">
                          {ticket.causa_raiz || 'Não informada'}
                        </div>
                      </div>
                    </div>
                  )}

                  {ticket.observacoes_tecnicas && (
                    <div>
                      <span className="text-slate-400 text-xs block mb-0.5">Recomendações e Observações Técnicas:</span>
                      <p className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                        {ticket.observacoes_tecnicas}
                      </p>
                    </div>
                  )}

                  {ticket.foto_solucao_url && (
                    <div>
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5 print:text-slate-900">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        <span>Foto / Evidência do Reparo Finalizado e Peças Substituídas:</span>
                      </span>
                      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-2 inline-block">
                        <img
                          src={ticket.foto_solucao_url}
                          alt="Evidência do conserto"
                          className="max-h-60 max-w-full rounded object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Workflow Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between print:hidden">
          <div className="text-xs text-slate-400">
            {currentUser.role === 'operador' && (
              <span>Visualizando como <strong>Operador</strong></span>
            )}
            {currentUser.role === 'mecanico' && (
              <span>Ações disponíveis para o perfil de <strong>Mecânico</strong></span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Fechar
            </button>

            {/* Mecânico Actions */}
            {currentUser.role === 'mecanico' && ticket.status === 'aberto' && onStartService && (
              <button
                onClick={() => onStartService(ticket)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Assumir Atendimento</span>
              </button>
            )}

            {currentUser.role === 'mecanico' && ticket.status !== 'encerrado' && onOpenCloseModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCloseModal(ticket);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Encerrar Chamado</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

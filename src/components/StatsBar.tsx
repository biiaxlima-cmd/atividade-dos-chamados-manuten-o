import React from 'react';
import { Ticket } from '../types';
import { Clock, CheckCircle2, AlertOctagon, Wrench } from 'lucide-react';

interface StatsBarProps {
  tickets: Ticket[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ tickets }) => {
  const total = tickets.length;
  const abertos = tickets.filter(t => t.status === 'aberto').length;
  const emAtendimento = tickets.filter(t => t.status === 'em_atendimento').length;
  const encerrados = tickets.filter(t => t.status === 'encerrado').length;

  // Calculo de tempo médio de atendimento dos encerrados
  const closedTicketsWithTime = tickets.filter(t => t.status === 'encerrado' && t.tempo_parada_minutos);
  const totalMinutes = closedTicketsWithTime.reduce((acc, curr) => acc + (curr.tempo_parada_minutos || 0), 0);
  const avgMinutes = closedTicketsWithTime.length > 0 ? Math.round(totalMinutes / closedTicketsWithTime.length) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Total */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total de Chamados</span>
          <Wrench className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-mono tabular-nums">{total}</span>
          <span className="text-xs text-slate-500">registrados</span>
        </div>
      </div>

      {/* Abertos */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-amber-400/90 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Aguardando Atendimento</span>
          <AlertOctagon className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{abertos}</span>
          <span className="text-xs text-slate-500">em fila</span>
        </div>
      </div>

      {/* Em Atendimento */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-blue-400/90 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Em Manutenção</span>
          <Clock className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-400 font-mono tabular-nums">{emAtendimento}</span>
          <span className="text-xs text-slate-500">em execução</span>
        </div>
      </div>

      {/* Encerrados */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-emerald-400/90 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Encerrados</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{encerrados}</span>
          <span className="text-xs text-slate-500">
            {avgMinutes > 0 ? `méd. ${avgMinutes}min` : 'concluídos'}
          </span>
        </div>
      </div>
    </div>
  );
};

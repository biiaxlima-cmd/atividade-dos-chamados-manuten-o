import React, { useState } from 'react';
import { User, Ticket } from '../types';
import { X, CheckCircle, Wrench, Clock, Cog, AlertTriangle, Camera, Trash2, UploadCloud } from 'lucide-react';
import { uploadAttachment } from '../services/supabase';

interface CloseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  currentUser: User;
  onSubmit: (updatedTicket: Ticket) => Promise<void>;
}

export const CloseTicketModal: React.FC<CloseTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  currentUser,
  onSubmit
}) => {
  const [descricaoSolucao, setDescricaoSolucao] = useState('');
  const [pecasSubstituidas, setPecasSubstituidas] = useState('');
  const [tempoParadaMinutos, setTempoParadaMinutos] = useState<number>(45);
  const [causaRaiz, setCausaRaiz] = useState('Desgaste natural de componente');
  const [observacoesTecnicas, setObservacoesTecnicas] = useState('');
  const [fotoSolucaoUrl, setFotoSolucaoUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFoto(true);
      setError(null);
      const url = await uploadAttachment(file, 'solucoes');
      setFotoSolucaoUrl(url);
    } catch (err: any) {
      setError('Falha ao processar arquivo: ' + (err?.message || 'erro'));
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!descricaoSolucao.trim()) {
      setError('O mecânico deve obrigatoriamente descrever o serviço executado para encerrar o chamado.');
      return;
    }

    try {
      setIsSubmitting(true);
      const nowIso = new Date().toISOString();

      const updatedTicket: Ticket = {
        ...ticket,
        status: 'encerrado',
        mecanico_nome: currentUser.nome,
        mecanico_login: currentUser.login,
        data_inicio_atendimento: ticket.data_inicio_atendimento || nowIso,
        data_encerramento: nowIso,
        descricao_solucao: descricaoSolucao.trim(),
        pecas_substituidas: pecasSubstituidas.trim() || 'Nenhuma peça substituída (apenas ajuste/lubrificação)',
        tempo_parada_minutos: Number(tempoParadaMinutos) || 0,
        causa_raiz: causaRaiz.trim(),
        observacoes_tecnicas: observacoesTecnicas.trim() || undefined,
        foto_solucao_url: fotoSolucaoUrl || undefined
      };

      await onSubmit(updatedTicket);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao encerrar chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Encerramento de Chamado Técnico</h3>
                <span className="text-xs font-mono text-slate-400">{ticket.protocolo}</span>
              </div>
              <p className="text-xs text-slate-400">
                Mecânico responsável: <span className="text-slate-200 font-medium">{currentUser.nome}</span>
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Context box: What operator reported */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-300">
                {ticket.equipamento} ({ticket.tag_equipamento})
              </span>
              <span>Aberto por: {ticket.operador_nome}</span>
            </div>
            <div className="text-slate-300 font-medium">{ticket.titulo}</div>
            <p className="text-slate-400 text-[11px] leading-relaxed italic bg-slate-900/60 p-2 rounded-md border border-slate-800">
              "{ticket.descricao_problema}"
            </p>
          </div>

          {/* O que foi feito (Descriptive solution - mandatory) */}
          <div>
            <label className="block text-xs font-medium text-slate-200 mb-1">
              Descrição do Serviço Executado (O que foi feito) *
            </label>
            <textarea
              rows={4}
              value={descricaoSolucao}
              onChange={(e) => setDescricaoSolucao(e.target.value)}
              placeholder="Descreva minuciosamente o serviço efetuado: desmontagem, inspeção, reparo mecânico, alinhamento, troca de componentes, reaperto com torquímetro, testes de rotação e carga..."
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Registro técnico para o histórico de manutenção da máquina e rastreabilidade preventiva.
            </p>
          </div>

          {/* Peças substituídas */}
          <div>
            <label className="block text-xs font-medium text-slate-200 mb-1">
              Peças / Componentes Substituídos
            </label>
            <input
              type="text"
              value={pecasSubstituidas}
              onChange={(e) => setPecasSubstituidas(e.target.value)}
              placeholder="Ex: Rolamento blindado 6205-2RS, 1 correia em V A-42, retentor de óleo Sabó..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Causa Raiz */}
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Causa Raiz Identificada
              </label>
              <select
                value={causaRaiz}
                onChange={(e) => setCausaRaiz(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Desgaste natural de componente">Desgaste natural de componente</option>
                <option value="Falta de lubrificação periódica">Falta de lubrificação periódica</option>
                <option value="Sobrecarga mecânica / Esforço excessivo">Sobrecarga mecânica / Esforço excessivo</option>
                <option value="Contaminação por cavaco ou pó abrasivo">Contaminação por cavaco ou pó abrasivo</option>
                <option value="Desalinhamento ou folga excessiva">Desalinhamento ou folga excessiva</option>
                <option value="Falha operacional / Impacto acidental">Falha operacional / Impacto acidental</option>
                <option value="Fadiga prematura de material">Fadiga prematura de material</option>
                <option value="Outro motivo técnico">Outro motivo técnico</option>
              </select>
            </div>

            {/* Tempo de parada */}
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Tempo Total de Intervenção (minutos)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={tempoParadaMinutos}
                  onChange={(e) => setTempoParadaMinutos(Number(e.target.value))}
                  required
                  className="w-full pl-3 pr-16 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 pointer-events-none">
                  minutos
                </span>
              </div>
            </div>
          </div>

          {/* Observações técnicas */}
          <div>
            <label className="block text-xs font-medium text-slate-200 mb-1">
              Observações Técnicas / Recomendações Preventivas
            </label>
            <input
              type="text"
              value={observacoesTecnicas}
              onChange={(e) => setObservacoesTecnicas(e.target.value)}
              placeholder="Ex: Máquina liberada para produção. Recomenda-se checagem de nível de óleo em 48h."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Anexo de Foto da Peça Trocada ou Serviço / Supabase Storage */}
          <div>
            <label className="block text-xs font-medium text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Foto da Peça Substituída ou Reparo Finalizado (Supabase Storage)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Bucket: chamados-anexos</span>
            </label>

            {fotoSolucaoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center gap-3">
                <img
                  src={fotoSolucaoUrl}
                  alt="Evidência do reparo"
                  className="w-14 h-14 object-cover rounded-md border border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-200 block truncate">Evidência do conserto anexada</span>
                  <span className="text-[11px] text-emerald-400">Pronto para encerramento</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFotoSolucaoUrl(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors"
                  title="Remover anexo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-950/60 rounded-lg p-3 text-center cursor-pointer block transition-colors group">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploadingFoto}
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 group-hover:text-slate-200">
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                  <span>
                    {uploadingFoto ? 'Enviando foto ao armazenamento...' : 'Clique para anexar foto do reparo ou peças (máx 10MB)'}
                  </span>
                </div>
              </label>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Encerrando...' : 'Concluir e Encerrar Chamado'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User, Ticket, TicketPriority, TicketCategory } from '../types';
import { X, PlusCircle, AlertCircle, HardHat, Camera, Trash2, UploadCloud } from 'lucide-react';
import { uploadAttachment } from '../services/supabase';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSubmit: (ticket: Ticket) => Promise<void>;
}

const CATEGORIES: TicketCategory[] = [
  'Mecânica',
  'Hidráulica',
  'Pneumática',
  'Elétrica',
  'Lubrificação',
  'Estrutural',
  'Instrumentação',
  'Outro'
];

const COMMON_EQUIPMENTS = [
  { nome: 'Torno CNC Index G200', tag: 'CNC-04', setor: 'Usinagem de Precisão' },
  { nome: 'Prensa Excêntrica Mecânica 200t', tag: 'PRE-12', setor: 'Estamparia Pesada' },
  { nome: 'Centro de Usinagem Vertical Mazak', tag: 'CUV-08', setor: 'Usinagem de Precisão' },
  { nome: 'Compressor de Ar Parafuso Atlas Copco', tag: 'CMP-02', setor: 'Utilidades & Compressores' },
  { nome: 'Ponte Rolante Industrial 10t', tag: 'PTR-01', setor: 'Expedição e Logística' },
  { nome: 'Célula Robotizada de Solda KUKA', tag: 'ROB-03', setor: 'Montagem e Soldagem' },
  { nome: 'Empilhadeira a Combustão Hyster 2.5t', tag: 'EMP-05', setor: 'Logística Interna' },
  { nome: 'Injetora Termoplástica Romi 300t', tag: 'INJ-07', setor: 'Termoplásticos' }
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit
}) => {
  const [titulo, setTitulo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [tagEquipamento, setTagEquipamento] = useState('');
  const [setor, setSetor] = useState('Usinagem de Precisão');
  const [prioridade, setPrioridade] = useState<TicketPriority>('media');
  const [categoria, setCategoria] = useState<TicketCategory>('Mecânica');
  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [fotoProblemaUrl, setFotoProblemaUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFoto(true);
      setError(null);
      const url = await uploadAttachment(file, 'problemas');
      setFotoProblemaUrl(url);
    } catch (err: any) {
      setError('Falha ao processar arquivo: ' + (err?.message || 'erro'));
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSelectQuickEquipment = (item: typeof COMMON_EQUIPMENTS[0]) => {
    setEquipamento(item.nome);
    setTagEquipamento(item.tag);
    setSetor(item.setor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || !equipamento.trim() || !descricaoProblema.trim()) {
      setError('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      const protocolo = `OS-${year}-${randomNum}`;
      const nowIso = new Date().toISOString();

      const newTicket: Ticket = {
        id: 'tk-' + Date.now().toString(),
        protocolo,
        titulo: titulo.trim(),
        equipamento: equipamento.trim(),
        tag_equipamento: tagEquipamento.trim() || 'S/TAG',
        setor: setor.trim(),
        prioridade,
        categoria,
        descricao_problema: descricaoProblema.trim(),
        status: 'aberto',
        operador_nome: currentUser.nome,
        operador_login: currentUser.login,
        data_abertura: nowIso,
        foto_problema_url: fotoProblemaUrl || undefined,
        created_at: nowIso
      };

      await onSubmit(newTicket);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao registrar chamado.');
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
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Abertura de Chamado de Manutenção</h3>
              <p className="text-xs text-slate-400">
                Registrado por: <span className="text-slate-200 font-medium">{currentUser.nome}</span> (Operador)
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
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Equipment Selector Pills */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Sugestões Rápidas de Equipamento
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_EQUIPMENTS.slice(0, 4).map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => handleSelectQuickEquipment(item)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {item.tag} · {item.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome do Equipamento / Máquina *
              </label>
              <input
                type="text"
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                placeholder="Ex: Torno CNC Index G200"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tag / Código
              </label>
              <input
                type="text"
                value={tagEquipamento}
                onChange={(e) => setTagEquipamento(e.target.value)}
                placeholder="Ex: CNC-04"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Setor Fabril *
              </label>
              <input
                type="text"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                placeholder="Ex: Usinagem de Precisão"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Categoria da Falha *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as TicketCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nível de Prioridade *
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="baixa">Baixa (Não para a linha)</option>
                <option value="media">Média (Atenção requerida)</option>
                <option value="alta">Alta (Risco de parada)</option>
                <option value="critica">Crítica (Linha parada / Emergência)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Título Resumido da Ocorrência *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Vibração intensa no fuso principal e superaquecimento"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Descrição Detalhada do Problema Observado *
            </label>
            <textarea
              rows={4}
              value={descricaoProblema}
              onChange={(e) => setDescricaoProblema(e.target.value)}
              placeholder="Descreva detalhadamente o sintoma: o que a máquina estava fazendo quando falhou, barulhos, odores, vazamentos, mensagens de alarme no painel, vibração ou peças defeituosas..."
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Quanto mais detalhes o operador fornecer, mais rápido o mecânico poderá diagnosticar e resolver.
            </p>
          </div>

          {/* Anexo de Foto da Falha / Supabase Storage */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Foto ou Evidência da Falha (Opcional - Supabase Storage)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Bucket: chamados-anexos</span>
            </label>

            {fotoProblemaUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center gap-3">
                <img
                  src={fotoProblemaUrl}
                  alt="Evidência do problema"
                  className="w-14 h-14 object-cover rounded-md border border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-200 block truncate">Evidência anexada com sucesso</span>
                  <span className="text-[11px] text-emerald-400">Pronto para envio</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFotoProblemaUrl(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors"
                  title="Remover anexo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/60 rounded-lg p-3 text-center cursor-pointer block transition-colors group">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploadingFoto}
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 group-hover:text-slate-200">
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  <span>
                    {uploadingFoto ? 'Enviando foto ao armazenamento...' : 'Clique para anexar foto do problema (máx 10MB)'}
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
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? 'Registrando...' : 'Emitir Ordem de Manutenção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

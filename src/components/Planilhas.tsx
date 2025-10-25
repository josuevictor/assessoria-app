import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Calendar, User, Edit, X } from 'lucide-react';
import Swal from 'sweetalert2';
import type { Aluno, Planilha } from '../types';
import {
  getPlanilhas,
  createPlanilha,
  getTreinosByPlanilha,
  updatePlanilha,
} from '../services/planilhaService';
import { fetchAlunos } from '../services/AtletaService';
import { updateTreino } from '../services/treinos';

export default function Planilhas() {
  const [showModal, setShowModal] = useState(false);
  const [planilhas, setPlanilhas] = useState<Planilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Campos criar
  const [cpf, setCpf] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [descricao, setDescricao] = useState('');

  // Detalhes
  const [detalhesModal, setDetalhesModal] = useState(false);
  const [treinos, setTreinos] = useState<any[]>([]);
  const [planilhaSelecionada, setPlanilhaSelecionada] = useState<Planilha | null>(null);
  const [loadingTreinos, setLoadingTreinos] = useState(false);

  // Busca alunos (criar)
  const [nomeBusca, setNomeBusca] = useState('');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [showListaAlunos, setShowListaAlunos] = useState(false);

  // Edição
  const [editId, setEditId] = useState<number | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    descricao: '',
    data_inicio: '',
    data_fim: '',
  });
  const [updating, setUpdating] = useState(false); // opcional: desabilitar botão enquanto atualiza

  // Editar treino
  const [editTreinoModal, setEditTreinoModal] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState<any | null>(null);
  const [treinoForm, setTreinoForm] = useState({
    tipo: '',
    dia_semana: '',
    data_treino: '',
    distancia_prevista_km: '',
    tempo_previsto_min: '',
    observacoes: '',
  });
  const [updatingTreino, setUpdatingTreino] = useState(false);


  function openEditTreinoModal(treino: any) {
    setTreinoSelecionado(treino);
    setTreinoForm({
      tipo: treino.tipo || '',
      dia_semana: treino.dia_semana || '',
      data_treino: treino.data_treino?.split('T')[0] || '',
      distancia_prevista_km: treino.distancia_prevista_km || '',
      tempo_previsto_min: treino.tempo_previsto_min || '',
      observacoes: treino.observacoes || '',
    });
    setEditTreinoModal(true);
  }


  async function handleUpdateTreino(e: React.FormEvent) {
    e.preventDefault();
    if (!treinoSelecionado) return;

    setUpdatingTreino(true);
    try {
      const updatedTreino = await updateTreino(treinoSelecionado.id, treinoForm);

      // Atualiza localmente
      setTreinos((prev) =>
        prev.map((t) => (t.id === treinoSelecionado.id ? { ...t, ...updatedTreino } : t))
      );

      setEditTreinoModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Treino atualizado com sucesso!',
        confirmButtonColor: '#ea580c',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar treino',
        text: err.message || 'Não foi possível salvar as alterações.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setUpdatingTreino(false);
    }
  }


  // Carregar planilhas
  useEffect(() => {
    async function carregar() {
      try {
        const data = await getPlanilhas();
        setPlanilhas(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar planilhas');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  // Buscar alunos ao abrir modal de criar
  useEffect(() => {
    if (!showModal) return;
    async function fetchTodosAlunos() {
      try {
        const data = await fetchAlunos();
        setAlunos(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTodosAlunos();
  }, [showModal]);

  // Criar nova planilha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoSelecionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Selecione um aluno antes de salvar a planilha!',
        confirmButtonColor: '#f97316',
      });
      return;
    }

    const novaPlanilha = {
      cpf: alunoSelecionado.cpf,
      data_inicio: dataInicio,
      data_fim: dataFim,
      descricao,
    };

    try {
      const data = await createPlanilha(novaPlanilha);
      setPlanilhas((prev) => [...prev, data]);
      setShowModal(false);
      // reset
      setCpf('');
      setDataInicio('');
      setDataFim('');
      setDescricao('');
      setAlunoSelecionado(null);
      setNomeBusca('');
      Swal.fire({
        icon: 'success',
        title: 'Planilha criada com sucesso!',
        confirmButtonColor: '#ea580c',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao criar planilha',
        text: err.message || 'Não foi possível salvar a planilha. Tente novamente.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  // Abrir detalhes (carrega treinos)
  async function abrirDetalhes(planilha: Planilha) {
    setLoadingTreinos(true);
    setPlanilhaSelecionada(planilha);
    setDetalhesModal(true);

    try {
      const data = await getTreinosByPlanilha(planilha.id);
      setTreinos(data);
    } catch (err) {
      console.error(err);
      setTreinos([]);
    } finally {
      setLoadingTreinos(false);
    }
  }

  // Helpers visuais
  const getStatusColor = (dataFim: string | null) => {
    if (!dataFim) return 'bg-gray-100 text-gray-600';
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes < 0) return 'bg-gray-100 text-gray-600';
    if (diasRestantes < 7) return 'bg-red-100 text-red-600';
    if (diasRestantes < 30) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-600';
  };

  const getDiasRestantes = (dataFim: string | null) => {
    if (!dataFim) return 'Sem data final';
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes < 0) return 'Concluída';
    if (diasRestantes === 0) return 'Último dia';
    if (diasRestantes === 1) return '1 dia restante';
    return `${diasRestantes} dias restantes`;
  };

  // Abre modal de edição preenchendo o form
  function openEditModal(planilha: Planilha) {
    setEditId(planilha.id);
    setEditForm({
      descricao: planilha.descricao || '',
      data_inicio: planilha.data_inicio || '',
      data_fim: planilha.data_fim || '',
    });
    setEditModal(true);
  }

  // Atualizar planilha (chama serviço updatePlanilha)
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setUpdating(true);
    try {
      const updated = await updatePlanilha(editId, {
        descricao: editForm.descricao,
        data_inicio: editForm.data_inicio,
        data_fim: editForm.data_fim,
      });

      setPlanilhas((prev) => prev.map((p) => (p.id === editId ? { ...p, ...updated } : p)));
      setEditModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Planilha atualizada!',
        confirmButtonColor: '#ea580c',
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar planilha',
        text: err.message || 'Não foi possível salvar as alterações.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="text-gray-600">Carregando planilhas...</p>;
  if (error) return <p className="text-red-600">Erro: {error}</p>;

  return (
    <div className="space-y-6">
      {/* cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planilhas de Treino</h2>
          <p className="text-gray-600 mt-1">Gerencie os planos de treinamento</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nova Planilha
        </button>
      </div>

      {/* cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {planilhas.map((planilha) => (
          <div
            key={planilha.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 w-full border-gray-200 p-3 rounded-lg">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <ClipboardList size={24} className="text-orange-600" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {planilha.descricao || 'Sem descrição'}
                  </h3>
                </div>

                <button
                  type="button"
                  className="bg-orange-100 hover:bg-orange-200 p-2 rounded-lg cursor-pointer transition"
                  onClick={() => openEditModal(planilha)}
                >
                  <Edit size={18} className="text-orange-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} className="text-gray-400" />
                <span>Usuário: {planilha.user?.name}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  {new Date(planilha.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                  {planilha.data_fim ? new Date(planilha.data_fim).toLocaleDateString('pt-BR') : 'Sem data fim'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(planilha.data_fim)}`}>
                {getDiasRestantes(planilha.data_fim)}
              </span>
              <button
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                onClick={() => abrirDetalhes(planilha)}
              >
                Ver Detalhes →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal nova planilha */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nova Planilha</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
                <input
                  type="text"
                  placeholder="Digite o nome do aluno"
                  value={nomeBusca}
                  onChange={(e) => {
                    setNomeBusca(e.target.value);
                    setShowListaAlunos(true);
                    setAlunoSelecionado(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />

                {showListaAlunos && (
                  <ul className="border border-gray-200 rounded-lg mt-1 max-h-48 overflow-auto bg-white absolute w-full z-50">
                    {alunos
                      .filter((a) => a.user?.name.toLowerCase().includes(nomeBusca.toLowerCase()))
                      .map((a) => (
                        <li
                          key={a.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setAlunoSelecionado(a);
                            setNomeBusca(a.user?.name || '');
                            setShowListaAlunos(false);
                          }}
                        >
                          {a.user?.name} ({a.cpf})
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium">
                  Criar Planilha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalhes */}
      {detalhesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Treinos da Planilha #{planilhaSelecionada?.id}
              </h3>
              <button
                onClick={() => setDetalhesModal(false)}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {loadingTreinos ? (
              <p className="text-gray-600">Carregando treinos...</p>
            ) : treinos.length === 0 ? (
              <p className="text-gray-500">Nenhum treino encontrado.</p>
            ) : (
              <div className="space-y-4">
                {treinos.map((treino) => (
                  <div key={treino.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-orange-700 block">{treino.tipo}</span>
                        <span className="text-xs text-gray-500">{treino.dia_semana}</span>
                      </div>
                      <button
                        onClick={() => openEditTreinoModal(treino)}
                        className="p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
                        title="Editar treino"
                      >
                        <Edit size={16} className="text-orange-600" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      Data: {new Date(treino.data_treino).toLocaleDateString('pt-BR')}
                    </div>
                    {treino.distancia_prevista_km && (
                      <div className="text-sm text-gray-700">
                        Distância prevista: {treino.distancia_prevista_km} km
                      </div>
                    )}
                    {treino.tempo_previsto_min && (
                      <div className="text-sm text-gray-700">
                        Tempo previsto: {treino.tempo_previsto_min} min
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-2">
                      Observações: {treino.observacoes || 'Sem observações'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button onClick={() => setDetalhesModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Planilha</h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input type="text" value={editForm.descricao} onChange={(e) => setEditForm((prev) => ({ ...prev, descricao: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input type="date" value={editForm.data_inicio} onChange={(e) => setEditForm((prev) => ({ ...prev, data_inicio: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <input type="date" value={editForm.data_fim} onChange={(e) => setEditForm((prev) => ({ ...prev, data_fim: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={updating} className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50">
                  {updating ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      
      {/* Modal editar treino */}
      {editTreinoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Treino</h3>

            <form onSubmit={handleUpdateTreino} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <input
                  type="text"
                  value={treinoForm.tipo}
                  onChange={(e) => setTreinoForm((p) => ({ ...p, tipo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                <input
                  type="text"
                  value={treinoForm.dia_semana}
                  onChange={(e) => setTreinoForm((p) => ({ ...p, dia_semana: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={treinoForm.data_treino}
                  onChange={(e) => setTreinoForm((p) => ({ ...p, data_treino: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distância (km)</label>
                  <input
                    type="number"
                    value={treinoForm.distancia_prevista_km}
                    onChange={(e) => setTreinoForm((p) => ({ ...p, distancia_prevista_km: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (min)</label>
                  <input
                    type="number"
                    value={treinoForm.tempo_previsto_min}
                    onChange={(e) => setTreinoForm((p) => ({ ...p, tempo_previsto_min: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={treinoForm.observacoes}
                  onChange={(e) => setTreinoForm((p) => ({ ...p, observacoes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditTreinoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingTreino}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {updatingTreino ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

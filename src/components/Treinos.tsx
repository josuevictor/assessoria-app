import { useState, useEffect } from 'react';
import { Activity, Plus, Calendar, CheckCircle2, Edit } from 'lucide-react';
import type { Treino } from '../types';
import Swal from 'sweetalert2';
import { API_URL } from '../config';
import { getPlanilhas } from '../services/planilhaService';
import type { Aluno, Planilha } from '../types';
import { fetchAlunos } from "../services/AtletaService";

export default function Treinos() {
  const [treinos, setTreinos] = useState<Record<string, Treino[]>>({});
  const [selectedDay, setSelectedDay] = useState('segunda');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cpf, setCpf] = useState('');
  const [dataTreino, setDataTreino] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [tipo, setTipo] = useState('');
  const [distanciaPrevistaKm, setDistanciaPrevistaKm] = useState('');
  const [tempoPrevistoMin, setTempoPrevistoMin] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  const [planilhas, setPlanilhas] = useState<Planilha[]>([]);
  const [planilhaSelecionada, setPlanilhaSelecionada] = useState<number | "">("");

  const [nomeBusca, setNomeBusca] = useState('');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [showListaAlunos, setShowListaAlunos] = useState(false);

  const diasSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

  // Edição de treino
  const [editTreino, setEditTreino] = useState<Treino | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    data_treino: '',
    dia_semana: '',
    tipo: '',
    distancia_prevista_km: '',
    tempo_previsto_min: '',
    observacoes: '',
  });
  const [updating, setUpdating] = useState(false);

  function openEditModal(treino: Treino) {
    setEditTreino(treino);
    setEditForm({
      data_treino: treino.data_treino || '',
      dia_semana: treino.dia_semana || '',
      tipo: treino.tipo || '',
      distancia_prevista_km: treino.distancia_prevista_km?.toString() || '',
      tempo_previsto_min: treino.tempo_previsto_min?.toString() || '',
      observacoes: treino.observacoes || '',
    });
    setEditModal(true);
  }

  async function handleUpdateTreino(e: React.FormEvent) {
    e.preventDefault();
    if (!editTreino) return;
    setUpdating(true);

    try {
      const response = await fetch(`${API_URL}/treino/${editTreino.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_treino: editForm.data_treino,
          dia_semana: editForm.dia_semana,
          tipo: editForm.tipo,
          distancia_prevista_km: editForm.distancia_prevista_km ? parseFloat(editForm.distancia_prevista_km) : null,
          tempo_previsto_min: editForm.tempo_previsto_min ? parseInt(editForm.tempo_previsto_min) : null,
          observacoes: editForm.observacoes,
        }),
      });

      const updatedTreino = await response.json();

      if (!response.ok) throw new Error(updatedTreino.message || 'Erro ao atualizar treino');

      // Atualiza lista de treinos localmente
      setTreinos(prev => {
        const newTreinos = { ...prev };
        const dia = editForm.dia_semana;
        if (dia) {
          newTreinos[dia] = newTreinos[dia].map(t => t.id === updatedTreino.id ? updatedTreino : t);
        }
        return newTreinos;
      });

      Swal.fire({
        icon: 'success',
        title: 'Treino atualizado!',
        confirmButtonColor: '#ea580c',
      });

      setEditModal(false);
      setEditTreino(null);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar treino',
        text: err.message || 'Não foi possível salvar as alterações.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setUpdating(false);
    }
  }

  // Buscar alunos ao digitar nome
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

  // Buscar treinos ao montar
  useEffect(() => {
    async function fetchTreinos() {
      try {
        const response = await fetch(`${API_URL}/treino`);
        const data: Treino[] = await response.json();

        const agrupados: Record<string, Treino[]> = diasSemana.reduce((acc, dia) => {
          acc[dia] = data.filter((t) => t.dia_semana.toLowerCase() === dia);
          return acc;
        }, {} as Record<string, Treino[]>);

        setTreinos(agrupados);
      } catch (error) {
        console.error('Erro ao buscar treinos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTreinos();
  }, []);

  useEffect(() => {
    async function fetchPlanilhas() {
      try {
        const data = await getPlanilhas();
        setPlanilhas(data);
      } catch (error) {
        console.error("Erro ao buscar planilhas:", error);
      }
    }

    fetchPlanilhas();
  }, []);

  async function handleNovoTreino(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (!alunoSelecionado) {
      Swal.fire({
        icon: 'error',
        title: 'Selecione um aluno',
        text: 'Você precisa selecionar um aluno para cadastrar o treino.',
        confirmButtonColor: '#ea580c',
      });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/treino/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: alunoSelecionado.cpf,
          planilha_id: planilhaSelecionada,
          data_treino: dataTreino,
          dia_semana: diaSemana,
          tipo,
          distancia_prevista_km: distanciaPrevistaKm ? parseFloat(distanciaPrevistaKm) : null,
          tempo_previsto_min: tempoPrevistoMin ? parseInt(tempoPrevistoMin) : null,
          observacoes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao cadastrar treino',
          text: result.message || 'Não foi possível cadastrar o treino.',
          confirmButtonColor: '#ea580c',
        });
        setSaving(false);
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Treino cadastrado!',
        text: 'O treino foi cadastrado com sucesso.',
        confirmButtonColor: '#ea580c',
      });

      setShowModal(false);

      // Limpa o formulário
      setAlunoSelecionado(null);
      setNomeBusca('');
      setDataTreino('');
      setDiaSemana('');
      setTipo('');
      setDistanciaPrevistaKm('');
      setTempoPrevistoMin('');
      setObservacoes('');

      // Atualiza lista de treinos
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/treino`);
        const data: Treino[] = await response.json();

        const agrupados: Record<string, Treino[]> = diasSemana.reduce((acc, dia) => {
          acc[dia] = data.filter((t) => {
            const diaTreino = (t.dia_semana || '')
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .trim();
            const diaComparado = dia
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');
            return diaTreino === diaComparado;
          });
          return acc;
        }, {} as Record<string, Treino[]>);

        setTreinos(agrupados);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao cadastrar treino',
        text: 'Não foi possível cadastrar o treino.',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setSaving(false);
    }
  }

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      corrida: 'bg-blue-100 text-blue-700',
      fortalecimento: 'bg-purple-100 text-purple-700',
      intervalado: 'bg-red-100 text-red-700',
      longao: 'bg-orange-100 text-orange-700',
      rodagem: 'bg-green-100 text-green-700',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Activity size={32} className="mx-auto mb-3 animate-spin text-orange-500" />
        Carregando treinos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Treinos da Semana</h2>
          <p className="text-gray-600 mt-1">Visualize e gerencie seus treinos programados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Treino
        </button>
      </div>

      {/* Navegação de dias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {diasSemana.map((dia) => (
            <button
              key={dia}
              onClick={() => setSelectedDay(dia)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedDay === dia
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {dia.charAt(0).toUpperCase() + dia.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de treinos */}
        <div className="space-y-4">
          {treinos[selectedDay] && treinos[selectedDay].length > 0 ? (
            treinos[selectedDay].map((treino) => (
                <div
                  key={treino.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-lg text-white">
                        <Activity size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(
                              treino.tipo
                            )}`}
                          >
                            {treino.tipo}
                          </span>
                        </div>

                        {treino.planilha?.user?.name && (
                          <p className="text-sm text-orange-600 font-medium">
                            Aluno: {treino.planilha.user.name}
                          </p>
                        )}

                        <p className="text-sm text-gray-600 mt-2">{treino.observacoes}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Calendar size={16} />
                      <span>
                        {new Date(treino.data_treino + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                        onClick={() => openEditModal(treino)}
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <CheckCircle2 size={16} />
                        Marcar Realizado
                      </button>
                    </div>
                  </div>
                </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum treino programado para {selectedDay}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal novo treino*/}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Novo Treino</h3>

            <form className="space-y-4" onSubmit={handleNovoTreino}>
              {/* Formulário Novo Treino */}
              {/* ... seu código existente do modal de criação ... */}
            </form>
          </div>
        </div>
      )}

      {/* Modal editar treino */}
      {editModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Treino</h3>

            <form className="space-y-4" onSubmit={handleUpdateTreino}>
              {/* Formulário Edição */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data do Treino</label>
                  <input
                    type="date"
                    value={editForm.data_treino}
                    onChange={e => setEditForm(prev => ({ ...prev, data_treino: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                  <select
                    value={editForm.dia_semana}
                    onChange={e => setEditForm(prev => ({ ...prev, dia_semana: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Selecione</option>
                    {diasSemana.map(dia => (
                      <option key={dia} value={dia}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={editForm.tipo}
                    onChange={e => setEditForm(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="corrida">Corrida</option>
                    <option value="fortalecimento">Fortalecimento</option>
                    <option value="intervalado">Intervalado</option>
                    <option value="longao">Longão</option>
                    <option value="rodagem">Rodagem</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distância prevista (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.distancia_prevista_km}
                    onChange={e => setEditForm(prev => ({ ...prev, distancia_prevista_km: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo previsto (min)</label>
                  <input
                    type="number"
                    value={editForm.tempo_previsto_min}
                    onChange={e => setEditForm(prev => ({ ...prev, tempo_previsto_min: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={editForm.observacoes}
                  onChange={e => setEditForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {updating ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

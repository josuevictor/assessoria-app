import { useState, useEffect } from 'react';
import { Activity, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import type { Treino } from '../types';
import Swal from 'sweetalert2';

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

  const diasSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

  useEffect(() => {
    async function fetchTreinos() {
      try {
        const response = await fetch('https://assessoria-api.onrender.com/api/treino');
        const data: Treino[] = await response.json();

        // Agrupa os treinos por dia_semana
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

  async function handleNovoTreino(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('https://assessoria-api.onrender.com/api/treino/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf,
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
      setCpf('');
      setDataTreino('');
      setDiaSemana('');
      setTipo('');
      setDistanciaPrevistaKm('');
      setTempoPrevistoMin('');
      setObservacoes('');
      // Atualiza lista de treinos
      setLoading(true);
      // Recarrega os treinos
      try {
        const response = await fetch('https://assessoria-api.onrender.com/api/treino');
        const data: Treino[] = await response.json();
        const agrupados: Record<string, Treino[]> = diasSemana.reduce((acc, dia) => {
          acc[dia] = data.filter((t) => t.dia_semana.toLowerCase() === dia);
          return acc;
        }, {} as Record<string, Treino[]>);
        setTreinos(agrupados);
      } catch {}
      setLoading(false);
    } catch {
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
                          <h3 className="font-semibold text-gray-900 text-lg capitalize">
                            {treino.tipo}
                          </h3>
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
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <CheckCircle2 size={16} />
                      Marcar Realizado
                    </button>
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

      {/* Modal novo treino (mesmo que o seu atual) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Novo Treino</h3>
            <form className="space-y-4" onSubmit={handleNovoTreino}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF do Atleta</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Treino</label>
                <input
                  type="date"
                  value={dataTreino}
                  onChange={e => setDataTreino(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                <select
                  value={diaSemana}
                  onChange={e => setDiaSemana(e.target.value)}
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
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distância prevista (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={distanciaPrevistaKm}
                  onChange={e => setDistanciaPrevistaKm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo previsto (min)</label>
                <input
                  type="number"
                  value={tempoPrevistoMin}
                  onChange={e => setTempoPrevistoMin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                  disabled={saving}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Calendar, User } from 'lucide-react';
import type { Planilha } from '../types';

export default function Planilhas() {
  const [showModal, setShowModal] = useState(false);
  const [planilhas, setPlanilhas] = useState<Planilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Campos do formulário
  const [cpf, setCpf] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [descricao, setDescricao] = useState('');

  const [detalhesModal, setDetalhesModal] = useState(false);
  const [treinos, setTreinos] = useState<any[]>([]);
  const [planilhaSelecionada, setPlanilhaSelecionada] = useState<Planilha | null>(null);
  const [loadingTreinos, setLoadingTreinos] = useState(false);

  useEffect(() => {
    async function carregarPlanilhas() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/planilhas');
        if (!response.ok) {
          throw new Error(`Erro ao buscar planilhas (${response.status})`);
        }
        const data = await response.json();
        setPlanilhas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    carregarPlanilhas();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const novaPlanilha = {
      cpf,
      data_inicio: dataInicio,
      data_fim: dataFim,
      descricao,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/planilhas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaPlanilha),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar planilha (${response.status})`);
      }

      const data = await response.json();
      setPlanilhas([...planilhas, data]);
      setShowModal(false);

      // Limpar formulário
      setCpf('');
      setDataInicio('');
      setDataFim('');
      setDescricao('');
    } catch (err: any) {
      alert('Erro ao salvar planilha: ' + err.message);
    }
  };

  async function abrirDetalhes(planilha: Planilha) {
    setLoadingTreinos(true);
    setPlanilhaSelecionada(planilha);
    setDetalhesModal(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/treino/${planilha.id}`);
      if (!response.ok) throw new Error('Erro ao buscar treinos');
      const data = await response.json();
      setTreinos(data);
    } catch (err) {
      setTreinos([]);
    } finally {
      setLoadingTreinos(false);
    }
  }

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

  if (loading) {
    return <p className="text-gray-600">Carregando planilhas...</p>;
  }

  if (error) {
    return <p className="text-red-600">Erro: {error}</p>;
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {planilhas.map((planilha) => (
          <div
            key={planilha.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <ClipboardList size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {planilha.descricao || 'Sem descrição'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {planilha.id} — Usuário #{planilha.user_id}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} className="text-gray-400" />
                <span>Usuário ID: {planilha.user_id}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  {new Date(planilha.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                  {planilha.data_fim
                    ? new Date(planilha.data_fim).toLocaleDateString('pt-BR')
                    : 'Sem data fim'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(planilha.data_fim)}`}
              >
                {getDiasRestantes(planilha.data_fim)}
              </span>
              <button className="text-orange-600 hover:text-orange-700 text-sm font-medium" onClick={() => abrirDetalhes(planilha)}>
                Ver Detalhes →
              </button>
            </div>
          </div>
        ))}
      </div>

        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nova Planilha</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Criar Planilha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detalhesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Treinos da Planilha #{planilhaSelecionada?.id}
            </h3>
            {loadingTreinos ? (
              <p className="text-gray-600">Carregando treinos...</p>
            ) : treinos.length === 0 ? (
              <p className="text-gray-500">Nenhum treino encontrado.</p>
            ) : (
              <div className="space-y-4">
                {treinos.map((treino) => (
                  <div key={treino.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-orange-700">{treino.tipo}</span>
                      <span className="text-xs text-gray-500">{treino.dia_semana}</span>
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
                      Observações: {treino.observacoes}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setDetalhesModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

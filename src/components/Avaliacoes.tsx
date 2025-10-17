import { useState, useEffect } from 'react';
import { TrendingUp, Plus, User, Calendar, Weight, Ruler, Search } from 'lucide-react';
import type { AvaliacaoFisica } from '../types';

export default function Avaliacoes() {
  const [showModal, setShowModal] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFisica[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Buscar avaliações da API
  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/avaliacoes-fisicas/');
        const data = await response.json();
        setAvaliacoes(data);
      } catch (error) {
        setAvaliacoes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAvaliacoes();
  }, []);

  // Filtro de pesquisa
  const filteredAvaliacoes = avaliacoes.filter((avaliacao) =>
    (avaliacao.user_id?.toString().includes(searchTerm) ||
      avaliacao.observacoes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avaliacao.id?.toString().includes(searchTerm) ||
      avaliacao.data_avaliacao?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginação
  const totalPages = Math.ceil(filteredAvaliacoes.length / ITEMS_PER_PAGE);
  const paginatedAvaliacoes = filteredAvaliacoes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getIMCStatus = (imc?: string | number) => {
    const imcValue = typeof imc === 'string' ? parseFloat(imc) : imc;
    if (!imcValue) return { label: 'N/A', color: 'bg-gray-100 text-gray-600' };
    if (imcValue < 18.5) return { label: 'Abaixo', color: 'bg-blue-100 text-blue-700' };
    if (imcValue < 25) return { label: 'Normal', color: 'bg-green-100 text-green-700' };
    if (imcValue < 30) return { label: 'Sobrepeso', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Obesidade', color: 'bg-red-100 text-red-700' };
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Carregando avaliações...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avaliações</h2>
          <p className="text-gray-600 mt-1">Gerencie as avaliações</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nova Avaliação
        </button>
      </div>

      {/* Filtro de pesquisa */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por ID, atleta ou observação..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // volta para página 1 ao pesquisar
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedAvaliacoes.map((avaliacao) => {
          const imcStatus = getIMCStatus(avaliacao.imc);
          return (
            <div key={avaliacao.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* ...card de avaliação... */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-full p-3 text-white">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-900">Atleta ID: {avaliacao.user_id}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${imcStatus.color}`}>
                  IMC {imcStatus.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Weight size={16} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">PESO</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{avaliacao.peso} kg</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler size={16} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">ALTURA</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{avaliacao.altura ? `${avaliacao.altura} cm` : '-'}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">IMC</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{avaliacao.imc ?? '-'}</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-orange-700">% GORDURA</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{avaliacao.percentual_gordura ?? '-'}%</p>
                </div>
              </div>

              {avaliacao.observacoes && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <p className="text-sm font-medium text-gray-900 mb-1">Observações</p>
                  <p className="text-sm text-gray-600">{avaliacao.observacoes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-medium disabled:opacity-50"
          >
            Anterior
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded font-medium ${
                currentPage === idx + 1
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-medium disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}

      {filteredAvaliacoes.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhuma avaliação encontrada</p>
        </div>
      )}

      {/* ...modal de avaliação física... */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nova Avaliação Física</h3>
            <form className="space-y-4">
              {/* ...campos do formulário... */}
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
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nova Planilha</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Planilha</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Atleta</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option>Selecione um atleta</option>
                  <option>João Silva</option>
                  <option>Maria Santos</option>
                  <option>Pedro Costa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
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

    </div>
  );
}
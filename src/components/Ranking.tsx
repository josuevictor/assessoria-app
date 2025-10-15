import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface RankingAtleta {
  posicao: number;
  nome: string;
  pontuacao: number;
  km_mes: number;
  treinos_concluidos: number;
  evolucao: number;
}

export default function Ranking() {
  const ranking: RankingAtleta[] = [
    {
      posicao: 1,
      nome: 'Maria Santos',
      pontuacao: 2850,
      km_mes: 245,
      treinos_concluidos: 28,
      evolucao: 12,
    },
    {
      posicao: 2,
      nome: 'João Silva',
      pontuacao: 2720,
      km_mes: 232,
      treinos_concluidos: 26,
      evolucao: 8,
    },
    {
      posicao: 3,
      nome: 'Pedro Costa',
      pontuacao: 2640,
      km_mes: 218,
      treinos_concluidos: 25,
      evolucao: 15,
    },
    {
      posicao: 4,
      nome: 'Ana Paula',
      pontuacao: 2480,
      km_mes: 205,
      treinos_concluidos: 24,
      evolucao: 5,
    },
    {
      posicao: 5,
      nome: 'Carlos Mendes',
      pontuacao: 2350,
      km_mes: 198,
      treinos_concluidos: 23,
      evolucao: -2,
    },
    {
      posicao: 6,
      nome: 'Juliana Alves',
      pontuacao: 2290,
      km_mes: 187,
      treinos_concluidos: 22,
      evolucao: 3,
    },
    {
      posicao: 7,
      nome: 'Roberto Lima',
      pontuacao: 2180,
      km_mes: 175,
      treinos_concluidos: 21,
      evolucao: 7,
    },
    {
      posicao: 8,
      nome: 'Fernanda Cruz',
      pontuacao: 2050,
      km_mes: 168,
      treinos_concluidos: 20,
      evolucao: 1,
    },
  ];

  const getMedalIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy size={24} className="text-yellow-500" />;
    if (posicao === 2) return <Medal size={24} className="text-gray-400" />;
    if (posicao === 3) return <Award size={24} className="text-amber-600" />;
    return null;
  };

  const getPosicaoClass = (posicao: number) => {
    if (posicao === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    if (posicao === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (posicao === 3) return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
    return 'bg-gray-50 text-gray-900';
  };

  const getEvolucaoColor = (evolucao: number) => {
    if (evolucao > 0) return 'text-green-600';
    if (evolucao < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ranking de Atletas</h2>
        <p className="text-gray-600 mt-1">Classificação baseada em desempenho mensal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-100">Total de KM</h3>
            <TrendingUp size={20} className="text-blue-200" />
          </div>
          <p className="text-3xl font-bold">1.847 km</p>
          <p className="text-sm text-blue-100 mt-1">Este mês</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-100">Treinos Realizados</h3>
            <Trophy size={20} className="text-green-200" />
          </div>
          <p className="text-3xl font-bold">234</p>
          <p className="text-sm text-green-100 mt-1">Este mês</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-100">Média por Atleta</h3>
            <Award size={20} className="text-orange-200" />
          </div>
          <p className="text-3xl font-bold">38.5 km</p>
          <p className="text-sm text-orange-100 mt-1">Por semana</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Atleta
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pontuação
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  KM/Mês
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Treinos
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Evolução
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ranking.map((atleta) => (
                <tr
                  key={atleta.posicao}
                  className={`transition-colors ${
                    atleta.posicao <= 3 ? getPosicaoClass(atleta.posicao) : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getMedalIcon(atleta.posicao) || (
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-600">
                          {atleta.posicao}º
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        atleta.posicao <= 3 ? 'bg-white bg-opacity-20' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {atleta.nome.charAt(0)}
                      </div>
                      <span className="font-medium">{atleta.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold">{atleta.pontuacao.toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium">{atleta.km_mes} km</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium">{atleta.treinos_concluidos}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`flex items-center justify-center gap-1 font-semibold ${getEvolucaoColor(atleta.evolucao)}`}>
                      {atleta.evolucao > 0 ? '↑' : atleta.evolucao < 0 ? '↓' : '→'}
                      <span>{Math.abs(atleta.evolucao)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Destaque do Mês</h3>
            <p className="text-purple-100 mb-4">Maria Santos liderou o ranking com 245 km percorridos!</p>
            <div className="flex items-center gap-2">
              <Trophy size={20} />
              <span className="font-medium">+12% de evolução</span>
            </div>
          </div>
          <div className="text-6xl opacity-20">
            <Trophy size={80} />
          </div>
        </div>
      </div>
    </div>
  );
}

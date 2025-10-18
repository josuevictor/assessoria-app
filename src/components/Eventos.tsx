import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Trophy } from 'lucide-react';
import type { EventoCorrida } from '../types';

export default function Eventos() {
  const [showModal, setShowModal] = useState(false);
  const [eventos, setEventos] = useState<EventoCorrida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarEventos() {
      try {
        const response = await fetch('https://assessoria-api.onrender.com/api/eventos-corrida');
        if (!response.ok) {
          throw new Error(`Erro ao buscar eventos (${response.status})`);
        }
        const data = await response.json();
        setEventos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    carregarEventos();
  }, []);

  const getDistanciaText = (km: number) => {
    if (km >= 42) return 'Maratona';
    if (km >= 21) return 'Meia Maratona';
    return `${km}km`;
  };

  const getDiasAteEvento = (data: string) => {
    const hoje = new Date();
    const dataEvento = new Date(data);
    const dias = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (dias < 0) return 'Evento realizado';
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Amanhã';
    if (dias < 7) return `Em ${dias} dias`;
    if (dias < 30) return `Em ${Math.ceil(dias / 7)} semanas`;
    return `Em ${Math.ceil(dias / 30)} meses`;
  };

  const getEventoStatus = (data: string) => {
    const hoje = new Date();
    const dataEvento = new Date(data);
    const dias = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (dias < 0) return 'bg-gray-100 text-gray-600';
    if (dias < 7) return 'bg-red-100 text-red-600';
    if (dias < 30) return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-600';
  };

  if (loading) {
    return <p className="text-gray-600">Carregando eventos...</p>;
  }

  if (error) {
    return <p className="text-red-600">Erro: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Eventos de Corrida</h2>
          <p className="text-gray-600 mt-1">Provas e competições cadastradas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">{evento.nome_evento}</h3>
                  <div className="flex items-center gap-2 text-orange-100">
                    <Trophy size={16} />
                    <span className="text-sm font-medium">
                      {getDistanciaText(evento.distancia_km)}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getEventoStatus(evento.data_evento)} bg-white bg-opacity-90`}
                >
                  {getDiasAteEvento(evento.data_evento)}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-400 mt-0.5" />
                <p className="text-sm font-medium text-gray-900">
                  {new Date(evento.data_evento).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Usuário ID: {evento.user_id}
                </p>
              </div>

              <div className="flex flex-col gap-1 text-sm text-gray-600">
                <span>Tempo final: {evento.tempo_final_min} min</span>
                <span>Colocação: {evento.colocacao}º lugar</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  <span>Atleta #{evento.user_id}</span>
                </div>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Ver Detalhes →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Novo Evento</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Evento</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distância (km)</label>
                <input type="number" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Final (min)</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colocação</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
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
                  Criar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

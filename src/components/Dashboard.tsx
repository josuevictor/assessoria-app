import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Activity,
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [kmTotais, setKmTotais] = useState(0);

  const API_BASE = "http://127.0.0.1:8000/api";

  async function loadDashboardData() {
    try {
      const [alunosRes, treinosRes, eventosRes] = await Promise.all([
        axios.get(`${API_BASE}/alunos`),
        axios.get(`${API_BASE}/treino-realizado`),
        axios.get(`${API_BASE}/eventos-corrida`),
      ]);

      const alunos = alunosRes.data;
      const treinos = treinosRes.data;
      const eventos = eventosRes.data;

      // Estatísticas
      const atletasAtivos = alunos.filter((a: any) => a.ativo === 1).length;
      const totalTreinos = treinos.length;
      const eventosFuturos = eventos.filter(
        (e: any) => new Date(e.data_evento) > new Date()
      ).length;
      const km = treinos
        .map((t: any) => t.distancia_prevista_km || 0)
        .reduce((a: number, b: number) => a + b, 0);

      setKmTotais(km);

      const updatedStats: StatCard[] = [
        {
          title: "Atletas Ativos",
          value: atletasAtivos,
          change: "+12% este mês",
          icon: <Users size={24} />,
          color: "bg-blue-500",
        },
        {
          title: "Treinos Realizados",
          value: totalTreinos,
          change: "+8% esta semana",
          icon: <Activity size={24} />,
          color: "bg-green-500",
        },
        {
          title: "Eventos Futuros",
          value: eventosFuturos,
          change: "Próximos 30 dias",
          icon: <Calendar size={24} />,
          color: "bg-orange-500",
        },
        {
          title: "KM Totais",
          value: km.toFixed(1),
          change: "+15% este mês",
          icon: <TrendingUp size={24} />,
          color: "bg-purple-500",
        },
      ];

      // Atividades Recentes
      const atividades = treinos
        .slice(-5)
        .reverse()
        .map((t: any) => ({
          athlete: "Atleta " + t.planilha_id,
          activity: t.tipo,
          time: t.tempo_previsto_min + " min",
          distance: (t.distancia_prevista_km || 0) + " km",
          date: new Date(t.data_treino).toLocaleDateString("pt-BR"),
        }));

      // Próximos Eventos
      const proximosEventos = eventos
        .filter((e: any) => new Date(e.data_evento) > new Date())
        .sort(
          (a: any, b: any) =>
            new Date(a.data_evento).getTime() -
            new Date(b.data_evento).getTime()
        )
        .slice(0, 5)
        .map((e: any) => ({
          name: e.nome_evento,
          date: new Date(e.data_evento).toLocaleDateString("pt-BR"),
          participants: alunos.length,
        }));

      setStats(updatedStats);
      setRecentActivities(atividades);
      setUpcomingEvents(proximosEventos);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // refresh a cada 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Visão geral da assessoria esportiva</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Atividades Recentes + Próximos Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividades Recentes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Ver todas
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Activity size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.athlete}</p>
                  <p className="text-sm text-gray-600">{activity.activity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{activity.distance}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock size={14} />
                  <span className="text-xs">{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
            <Calendar size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
              >
                <p className="font-medium text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{event.participants} atletas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meta do Mês */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Meta do Mês</h3>
            <p className="text-orange-100">2.500 km acumulados pelos atletas</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progresso</span>
                <span className="font-medium">{((kmTotais / 2500) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-orange-400 bg-opacity-30 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3"
                  style={{ width: `${Math.min((kmTotais / 2500) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <Trophy size={64} className="opacity-20" />
        </div>
      </div>
    </div>
  );
}
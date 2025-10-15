import { Users, Activity, Calendar, Trophy, TrendingUp, Clock } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const stats: StatCard[] = [
    {
      title: 'Atletas Ativos',
      value: '48',
      change: '+12% este mês',
      icon: <Users size={24} />,
      color: 'bg-blue-500',
    },
    {
      title: 'Treinos Realizados',
      value: '234',
      change: '+8% esta semana',
      icon: <Activity size={24} />,
      color: 'bg-green-500',
    },
    {
      title: 'Eventos Futuros',
      value: '5',
      change: 'Próximos 30 dias',
      icon: <Calendar size={24} />,
      color: 'bg-orange-500',
    },
    {
      title: 'KM Totais',
      value: '1.847',
      change: '+15% este mês',
      icon: <TrendingUp size={24} />,
      color: 'bg-purple-500',
    },
  ];

  const recentActivities = [
    { athlete: 'João Silva', activity: 'Treino Intervalado', time: '5:30/km', distance: '10 km', date: 'Hoje, 06:00' },
    { athlete: 'Maria Santos', activity: 'Long Run', time: '6:00/km', distance: '21 km', date: 'Hoje, 05:30' },
    { athlete: 'Pedro Costa', activity: 'Treino Regenerativo', time: '6:30/km', distance: '5 km', date: 'Ontem, 18:00' },
    { athlete: 'Ana Paula', activity: 'Fartlek', time: '5:45/km', distance: '12 km', date: 'Ontem, 07:00' },
  ];

  const upcomingEvents = [
    { name: 'Meia Maratona São Paulo', date: '15 Out 2025', participants: 12 },
    { name: 'Corrida 10K Ibirapuera', date: '22 Out 2025', participants: 8 },
    { name: 'Maratona Rio de Janeiro', date: '05 Nov 2025', participants: 5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Visão geral da assessoria esportiva</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Ver todas
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
            <Calendar size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
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

      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Meta do Mês</h3>
            <p className="text-orange-100">2.500 km acumulados pelos atletas</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progresso</span>
                <span className="font-medium">73.9%</span>
              </div>
              <div className="w-full bg-orange-400 bg-opacity-30 rounded-full h-3">
                <div className="bg-white rounded-full h-3" style={{ width: '73.9%' }}></div>
              </div>
            </div>
          </div>
          <Trophy size={64} className="opacity-20" />
        </div>
      </div>
    </div>
  );
}

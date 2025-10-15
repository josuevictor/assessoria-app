import { ReactNode, useState } from 'react';
import {
  Home,
  Users,
  ClipboardList,
  Calendar,
  Trophy,
  Activity,
  Menu,
  X,
  TrendingUp
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onNavigate: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
  { id: 'alunos', label: 'Atletas', icon: <Users size={20} /> },
  { id: 'planilhas', label: 'Planilhas', icon: <ClipboardList size={20} /> },
  { id: 'treinos', label: 'Treinos', icon: <Activity size={20} /> },
  { id: 'eventos', label: 'Eventos', icon: <Calendar size={20} /> },
  { id: 'ranking', label: 'Ranking', icon: <Trophy size={20} /> },
  { id: 'avaliacoes', label: 'Avaliações', icon: <TrendingUp size={20} /> },
];

export default function Layout({ children, onNavigate }: LayoutProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (viewId: string) => {
    setActiveView(viewId);
    setSidebarOpen(false);
    onNavigate(viewId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <Activity size={28} className="text-orange-600" />
              <h1 className="text-xl font-bold text-gray-900">Assessoria Esportiva</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">Assessoria Esportiva</p>
              <p className="text-xs text-gray-500">Corridas de Rua</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeView === item.id
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="pt-16 lg:pl-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

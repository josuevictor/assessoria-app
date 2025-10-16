import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Users, ClipboardList, Calendar, Trophy, Activity, Menu, X, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: JSX.Element;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: <Home size={20} /> },
  { id: 'alunos', label: 'Atletas', path: '/alunos', icon: <Users size={20} /> },
  { id: 'planilhas', label: 'Planilhas', path: '/planilhas', icon: <ClipboardList size={20} /> },
  { id: 'treinos', label: 'Treinos', path: '/treinos', icon: <Activity size={20} /> },
  { id: 'eventos', label: 'Eventos', path: '/eventos', icon: <Calendar size={20} /> },
  { id: 'ranking', label: 'Ranking', path: '/ranking', icon: <Trophy size={20} /> },
  { id: 'avaliacoes', label: 'Avaliações', path: '/avaliacoes', icon: <TrendingUp size={20} /> },
  { id: 'sair', label: 'Sair', path: '/logout', icon: <LogOut size={20} /> }
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();

  // Verificação extra de autenticação
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate, isAuthenticated]);

  const handleNavigation = async (path: string) => {
    if (path === "/logout") {
      await logout();
      navigate("/login", { replace: true });
      return;
    }
    navigate(path);
    setSidebarOpen(false);
  };

  // Se não estiver autenticado, não renderiza o layout
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
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
        </div>
      </div>

      {/* Overlay para mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path
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

      {/* Conteúdo principal */}
      <main className="pt-16 lg:pl-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
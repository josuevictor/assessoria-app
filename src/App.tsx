import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Atletas from "./components/Atletas";
import Planilhas from "./components/Planilhas";
import Treinos from "./components/Treinos";
import Eventos from "./components/Eventos";
import Ranking from "./components/Ranking";
import Avaliacoes from "./components/Avaliacoes";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Rotas protegidas com Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="alunos" element={<Atletas />} />
          <Route path="planilhas" element={<Planilhas />} />
          <Route path="treinos" element={<Treinos />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="avaliacoes" element={<Avaliacoes />} />
        </Route>

        {/* Redirecionar rotas desconhecidas */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Listener para sincronizar entre abas/componentes
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Listener customizado para logout em outras partes do app
    const handleLogoutEvent = () => {
      checkAuth();
    };

    window.addEventListener('logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    // Verifica se o token existe e não está vazio
    const authStatus = !!(token && token.length > 0);
    setIsAuthenticated(authStatus);
    setLoading(false);
  };

  const login = (token: string, remember: boolean) => {
    // Limpa ambos antes de definir novo token
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    
    if (remember) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    
    // Dispara eventos para sincronizar entre abas/componentes
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('logout'));
  };

  return { isAuthenticated, loading, login, logout };
}
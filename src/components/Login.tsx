import { useState, useEffect } from "react";
import { Activity, X } from "lucide-react";

// Hook para autenticação
function useAuth() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const user = localStorage.getItem("user");
  return { token, user: user ? JSON.parse(user) : null, isAuthenticated: !!token };
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState(localStorage.getItem("tenant") || "");
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

 //URL da API definida na variável de ambiente
 //const API_URL = import.meta.env.VITE_API_URL; 

  // URL da API (local para testes)
  const API_URL = "http://127.0.0.1:8000/api";


  // Dados do cadastro
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "aluno",
  });

  // Redireciona automaticamente se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!tenant.trim()) {
      setMessage("⚠️ Informe o nome da assessoria antes de continuar.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant": tenant.trim().toLowerCase(), // 👈 Nome do schema/tenant
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("tenant", tenant.trim().toLowerCase());
        } else {
          sessionStorage.setItem("token", data.access_token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("tenant", tenant.trim().toLowerCase());
        }

        setMessage("✅ Login realizado com sucesso!");
        window.location.href = "/";
      } else {
        setMessage(data.message || "❌ Usuário ou senha incorretos.");
      }
    } catch (err) {
      setMessage("⚠️ Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Registro
  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("As senhas não conferem!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Cadastro realizado com sucesso!");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "aluno",
        });
        setShowRegister(false);
      } else {
        setMessage(data.message || "❌ Erro ao cadastrar.");
      }
    } catch (err) {
      setMessage("⚠️ Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Lado esquerdo (banner / marca) */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-orange-500 to-red-500 text-white p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg">
            <Activity className="text-orange-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">StrideRun</h1>
        </div>
        <p className="text-orange-100 text-lg max-w-md text-center leading-relaxed">
          Gerencie atletas, treinos e eventos com praticidade.
          Tudo em um único painel moderno e intuitivo.
        </p>
      </div>

      {/* Lado direito (formulário de login) */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="bg-white shadow-md rounded-2xl border border-gray-200 w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo!</h2>
          <p className="text-gray-600 mb-6">
            Faça login para acessar o painel da sua assessoria.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input para o nome da assessoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Assessoria
              </label>
              <input
                type="text"
                placeholder="ex: cliente6 ou eliteRun"
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Esse será o nome do esquema no banco de dados.
              </p>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none transition"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none transition"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                Lembrar-me
              </label>
              <a
                href="#"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {message && (
              <p className="text-sm text-center text-gray-700 bg-gray-100 py-2 rounded">
                {message}
              </p>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Ainda não tem uma conta?{" "}
            <button
              onClick={() => setShowRegister(true)}
              className="text-orange-600 font-medium hover:text-orange-700"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>

      {/* Modal de cadastro */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative">
            <button
              onClick={() => setShowRegister(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Criar conta
            </h2>
            <p className="text-gray-600 mb-6">
              Escolha se você é aluno ou assessor e preencha seus dados.
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleRegisterChange}
                  placeholder="Seu nome"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleRegisterChange}
                  placeholder="seuemail@exemplo.com"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 text-gray-700 text-sm">
                  <input
                    type="radio"
                    name="role"
                    value="aluno"
                    checked={formData.role === "aluno"}
                    onChange={handleRegisterChange}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  Aluno
                </label>

                <label className="flex items-center gap-2 text-gray-700 text-sm">
                  <input
                    type="radio"
                    name="role"
                    value="assessor"
                    checked={formData.role === "assessor"}
                    onChange={handleRegisterChange}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  Assessor
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleRegisterChange}
                  placeholder="••••••••"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="••••••••"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              {message && (
                <p className="text-sm text-center text-gray-700 bg-gray-100 py-2 rounded">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

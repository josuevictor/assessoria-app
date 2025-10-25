import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, Calendar, Edit, Trash2, User } from 'lucide-react';
import type { Aluno } from '../types';
import { fetchAlunos, createAluno, updateAluno, checkUserEmail, registerUser, inativarAluno, ativarAluno } from '../services/AtletaService';
import { buscarEnderecoPorCep } from '../utils/cep';
import { formatCPF } from '../utils/formatters';
import { formatTelefone } from '../utils/formatters';
import Swal from 'sweetalert2';

export default function Atletas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [atletas, setAtletas] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const ITEMS_PER_PAGE = 9;

  const [form, setForm] = useState({
    user_email: '',
    cpf: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: '',
  });

  const [editForm, setEditForm] = useState({
    cpf: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: '',
    ativo: true,
  });

  useEffect(() => {
    fetchAlunos()
      .then(setAtletas)
      .finally(() => setLoading(false));
  }, []);

  const filteredAtletas = atletas.filter(
    (atleta) =>
      (atleta?.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atleta?.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atleta?.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atleta?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atleta?.cidade?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
  );

  const totalPages = Math.ceil(filteredAtletas.length / ITEMS_PER_PAGE);
  const paginatedAtletas = filteredAtletas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

async function handleCep(e: React.ChangeEvent<HTMLInputElement>) {
  // Remove tudo que não é número
  const somenteNumeros = e.target.value.replace(/\D/g, '');

  // Atualiza o estado do input apenas com números
  handleChange({
    ...e,
    target: {
      ...e.target,
      value: somenteNumeros,
      name: e.target.name,
    },
  });

  // Quando tiver 8 dígitos, faz a busca no ViaCEP
  if (somenteNumeros.length === 8) {
    const endereco = await buscarEnderecoPorCep(somenteNumeros);
    if (endereco) {
      setForm((prev) => ({
        ...prev,
        ...endereco,
      }));
    }
  }
}


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const userExists = await checkUserEmail(form.user_email);

      if (!userExists) {
        const { value: userInfo } = await Swal.fire({
          title: 'Cadastrar usuário para o atleta',
          html: `
            <p style="font-size: 0.875rem; color: #555; margin-bottom: 1rem; text-align: center;">
              Este aluno ainda não possui cadastro de usuário. Um novo usuário será criado ao clicar em "OK".<br/>
              ⚠️ <small>Obs: A senha temporária será o CPF do aluno.</small>
            </p>
            <input id="swal-name" class="swal2-input" placeholder="Nome do Aluno" />
          `,
          focusConfirm: false,
          preConfirm: () => {
            const name = (document.getElementById('swal-name') as HTMLInputElement).value;
            if (!name) {
              Swal.showValidationMessage('Por favor, preencha o nome do aluno');
              return null;
            }
            return { name };
          },
          confirmButtonColor: '#ea580c',
        });

        if (!userInfo) {
          setLoading(false);
          return;
        }

        const userResult = await registerUser({
          email: form.user_email,
          name: userInfo.name,
          cpf: form.cpf,
        });

        if (!userResult.ok) {
          Swal.fire({
            icon: 'error',
            title: 'Erro ao cadastrar usuário',
            text: userResult.message || 'Não foi possível cadastrar o usuário',
          });
          setLoading(false);
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Usuário cadastrado!',
          text: 'O usuário foi cadastrado com sucesso.',
        });
      }

      const { ok, result } = await createAluno(form);
      if (!ok) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao cadastrar aluno',
          text: traduzirErroApi(result.message || ''),
        });
        setLoading(false);
        return;
      }

      setShowModal(false);
      setForm({
        user_email: '',
        cpf: '',
        data_nascimento: '',
        sexo: '',
        telefone: '',
        cep: '',
        endereco: '',
        cidade: '',
        estado: '',
      });

      const alunos = await fetchAlunos();
      setAtletas(alunos);

      Swal.fire({
        icon: 'success',
        title: 'Aluno cadastrado!',
        text: 'O aluno foi cadastrado com sucesso.',
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível cadastrar.',
      });
    } finally {
      setLoading(false);
    }
  }

  function traduzirErroApi(mensagem: string) {
    if (mensagem.includes('user email')) return 'O e-mail informado é inválido ou já está em uso.';
    if (mensagem.includes('cpf')) return 'O CPF informado é inválido ou já está cadastrado.';
    if (mensagem.includes('data_nascimento')) return 'A data de nascimento é inválida.';
    if (mensagem.includes('telefone')) return 'O telefone informado é inválido.';
    if (mensagem.includes('cep')) return 'O CEP informado é inválido.';
    return 'Não foi possível cadastrar/editar o aluno. Verifique os dados e tente novamente.';
  }

  function openEditModal(atleta: Aluno) {
    setEditId(atleta.id);
    setEditForm({
      cpf: atleta.cpf || '',
      data_nascimento: atleta.data_nascimento || '',
      sexo: atleta.sexo || '',
      telefone: atleta.telefone || '',
      cep: atleta.cep || '',
      endereco: atleta.endereco || '',
      cidade: atleta.cidade || '',
      estado: atleta.estado || '',
      ativo: atleta.ativo ?? true,
    });
    setEditModal(true);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, type, value } = e.target;
    let newValue: any = value;

    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      newValue = e.target.checked;
      setEditForm({ ...editForm, [name]: newValue });
      if (name === 'ativo' && editId) {
        newValue ? handleAtivarAluno(editId) : handleInativarAluno(editId);
      }
      return;
    }

    setEditForm({ ...editForm, [name]: newValue });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      const { ok, result } = await updateAluno(editId, editForm);
      if (!ok) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao editar',
          text: traduzirErroApi(result.message || ''),
          confirmButtonColor: '#ea580c',
        });
        setLoading(false);
        return;
      }
      setEditModal(false);
      const alunos = await fetchAlunos();
      setAtletas(alunos);
      Swal.fire({
        icon: 'success',
        title: 'Aluno atualizado!',
        text: 'Os dados do aluno foram atualizados com sucesso.',
        confirmButtonColor: '#ea580c',
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao editar',
        text: 'Não foi possível editar o aluno.',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleInativarAluno(id: number) {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'Inativar aluno?',
      text: 'Tem certeza que deseja inativar este aluno?',
      showCancelButton: true,
      confirmButtonText: 'Sim, inativar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ea580c',
    });
    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const { ok, result } = await inativarAluno(id);
        if (!ok) {
          Swal.fire({
            icon: 'error',
            title: 'Erro ao inativar',
            text: result.message || 'Não foi possível inativar o aluno.',
            confirmButtonColor: '#ea580c',
          });
        } else {
          const alunos = await fetchAlunos();
          setAtletas(alunos);
          Swal.fire({
            icon: 'success',
            title: 'Aluno inativado!',
            text: 'O aluno foi inativado com sucesso.',
            confirmButtonColor: '#ea580c',
          });
        }
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao inativar',
          text: 'Não foi possível inativar o aluno.',
          confirmButtonColor: '#ea580c',
        });
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleAtivarAluno(id: number) {
    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Ativar aluno?',
      text: 'Tem certeza que deseja ativar este aluno?',
      showCancelButton: true,
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ea580c',
    });
    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const { ok, result } = await ativarAluno(id);
        if (!ok) {
          Swal.fire({
            icon: 'error',
            title: 'Erro ao ativar',
            text: result.message || 'Não foi possível ativar o aluno.',
            confirmButtonColor: '#ea580c',
          });
        } else {
          const alunos = await fetchAlunos();
          setAtletas(alunos);
          Swal.fire({
            icon: 'success',
            title: 'Aluno ativado!',
            text: 'O aluno foi ativado com sucesso.',
            confirmButtonColor: '#ea580c',
          });
        }
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao ativar',
          text: 'Não foi possível ativar o aluno.',
          confirmButtonColor: '#ea580c',
        });
      } finally {
        setLoading(false);
      }
    }
  }

function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
  setForm({ ...form, cpf: formatCPF(e.target.value) });
}

function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
  setForm({ ...form, telefone: formatTelefone(e.target.value) });
}

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Carregando atletas...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header e botão novo atleta */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Atletas</h2>
          <p className="text-gray-600 mt-1">Gerencie seus atletas cadastrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Atleta
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar atleta..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Lista de atletas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAtletas.map((atleta) => (
            <div
              key={atleta.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-full p-3 text-white">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{atleta.user?.name}</h3>
                    <p className="text-sm text-gray-500">{atleta.cpf}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {atleta.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    {atleta.telefone}
                  </div>
                )}
                {atleta.data_nascimento && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    {new Date(atleta.data_nascimento).toLocaleDateString('pt-BR')}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {atleta.cidade}, {atleta.estado}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => openEditModal(atleta)}
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  onClick={() => handleInativarAluno(atleta.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
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
                  currentPage === idx + 1 ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'
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

        {filteredAtletas.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum atleta encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 mt-16">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Novo Atleta</h3>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* DADOS PESSOAIS */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Dados Pessoais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="user_email"
                      type="email"
                      value={form.user_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input
                      name="cpf"
                      type="text"
                      value={form.cpf}
                      onChange={handleCpfChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                      name="data_nascimento"
                      type="date"
                      value={form.data_nascimento}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                    <select
                      name="sexo"
                      value={form.sexo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CONTATO */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      name="telefone"
                      type="text"
                      value={form.telefone}
                      onChange={handleTelefoneChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      name="cep"
                      type="text"
                      value={form.cep}
                      onChange={handleCep}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      maxLength={9}
                      placeholder="Digite o CEP"
                    />
                  </div>
                </div>
              </div>

              {/* ENDEREÇO */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <input
                      name="endereco"
                      type="text"
                      disabled
                      value={form.endereco}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      name="cidade"
                      type="text"
                      disabled
                      value={form.cidade}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <input
                      name="estado"
                      type="text"
                      disabled
                      value={form.estado}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* BOTÕES */}
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal de edição */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 mt-20">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Editar Atleta
            </h3>

            <form className="space-y-6" onSubmit={handleEditSubmit}>
              {/* Dados pessoais */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3 border-b pb-1">Dados Pessoais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input
                      name="cpf"
                      type="text"
                      value={editForm.cpf}
                      onChange={handleCpfChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                      name="data_nascimento"
                      type="date"
                      value={editForm.data_nascimento}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                    <select
                      name="sexo"
                      value={editForm.sexo}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      name="ativo"
                      type="checkbox"
                      checked={editForm.ativo}
                      onChange={handleEditChange}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Ativo</label>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3 border-b pb-1">Contato</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      name="telefone"
                      type="text"
                      value={editForm.telefone}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>

                  {/* Endereço */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      name="cep"
                      type="text"
                      value={editForm.cep}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3 border-b pb-1">Endereço</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <input
                      name="endereco"
                      type="text"
                      value={editForm.endereco}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      name="cidade"
                      type="text"
                      value={editForm.cidade}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <input
                      name="estado"
                      type="text"
                      value={editForm.estado}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

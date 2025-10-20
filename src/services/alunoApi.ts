import type { Aluno } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

export async function checkUserEmail(email: string) {
  try {
    const res = await fetch(`${API_URL}/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return data.exists; // true se existir, false se não
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function registerUser(userData: { email: string, name: string, password: string }) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function fetchAlunos(): Promise<Aluno[]> {
  const response = await fetch(`${API_URL}/alunos/`);
  return response.json();
}

export async function createAluno(data: any): Promise<any> {
  const response = await fetch(`${API_URL}/alunos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}


export async function updateAluno(id: number, data: any): Promise<any> {
  const response = await fetch(`${API_URL}/alunos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}

// Função para inativar um aluno (definir ativo como false)
export async function inativarAluno(id: number): Promise<any> {
  const response = await fetch(`${API_URL}/alunos/inativar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ativo: "0" }),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}

// ativar aluno (definir ativo como true)
export async function ativarAluno(id: number): Promise<any> {
  const response = await fetch(`${API_URL}/alunos/ativar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ativo: "1" }),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}
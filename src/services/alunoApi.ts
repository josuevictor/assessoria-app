import type { Aluno } from '../types';

const API_URL = 'https://assessoria-api.onrender.com/api/alunos';

export async function fetchAlunos(): Promise<Aluno[]> {
  const response = await fetch(API_URL);
  return response.json();
}

export async function createAluno(data: any): Promise<any> {
  const response = await fetch('https://assessoria-api.onrender.com/api/alunos/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}


export async function updateAluno(id: number, data: any): Promise<any> {
  const response = await fetch(`https://assessoria-api.onrender.com/api/alunos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}

// Função para inativar um aluno (definir ativo como false)
export async function inativarAluno(id: number): Promise<any> {
  const response = await fetch(`https://assessoria-api.onrender.com/api/alunos/inativar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ativo: "0" }),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}

// ativar aluno (definir ativo como true)
export async function ativarAluno(id: number): Promise<any> {
  const response = await fetch(`https://assessoria-api.onrender.com/api/alunos/ativar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ativo: "1" }),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}
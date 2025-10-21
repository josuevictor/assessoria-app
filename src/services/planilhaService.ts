import { API_URL } from '../config';
import type { Planilha } from '../types';

// Buscar todas as planilhas
export async function getPlanilhas(): Promise<Planilha[]> {
  const response = await fetch(`${API_URL}/planilhas`);
  if (!response.ok) throw new Error(`Erro ao buscar planilhas (${response.status})`);
  return await response.json();
}

// Criar nova planilha
export async function createPlanilha(planilha: {
  cpf: string;
  data_inicio: string;
  data_fim: string;
  descricao: string;
}): Promise<Planilha> {
  const response = await fetch(`${API_URL}/planilhas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planilha),
  });

  if (!response.ok) throw new Error(`Erro ao criar planilha (${response.status})`);
  return await response.json();
}

// Buscar treinos de uma planilha
export async function getTreinosByPlanilha(id: number) {
  const response = await fetch(`${API_URL}/treino/${id}`);
  if (!response.ok) throw new Error('Erro ao buscar treinos');
  return await response.json();
}

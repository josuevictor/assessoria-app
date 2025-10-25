import { API_URL } from '../config';

export async function updateTreino(id: number, data: any) {
  const res = await fetch(`${API_URL}/treino/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar treino');
  return res.json();
}
// src/services/avaliacaoService.ts
import { API_URL } from '../config';
import type { AvaliacaoFisica } from '../types';

// Buscar todas as avaliações
export const getAvaliacoes = async (): Promise<AvaliacaoFisica[]> => {
  try {
    const response = await fetch(`${API_URL}/avaliacoes-fisicas/`);
    if (!response.ok) throw new Error('Erro ao buscar avaliações');
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
    return [];
  }
};

// Criar nova avaliação física
export const createAvaliacao = async (dados: {
  cpf: string;
  data_avaliacao: string;
  peso: number;
  percentual_gordura: number;
  vo2max: number;
  massa_magra: number;
  massa_gorda: number;
  imc: number;
  frequencia_cardiaca_repouso: number;
  circunferencia_abdomen: number;
  observacoes?: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/avaliacoes-fisicas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar avaliação');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    throw error;
  }
};

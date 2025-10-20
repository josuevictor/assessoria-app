export interface Aluno {
  id: number;
  user_id: number;
  matricula: string;
  cpf: string;
  data_nascimento: string;
  sexo: string | null;
  telefone: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  ativo: boolean;
  created_at: string | null;
  updated_at: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

export interface Planilha {
  id: number;
  user_id: number;
  data_inicio: string;
  data_fim: string | null;
  descricao: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Treino {
  id: number;
  planilha_id: number;
  nome: string;
  tipo: string;
  descricao?: string;
  data: string;
  observacoes?: string;
  data_treino: string;
  dia_semana: string;
  planilha?: Planilha;
}

export interface TreinoRealizado {
  id: number;
  treino_id: number;
  aluno_id: number;
  data_realizacao: string;
  distancia?: number;
  tempo?: string;
  ritmo?: string;
  observacoes?: string;
  planilha: {
    id: number;
    user: {
      id: number;
      name: string;
    };
  };
}

export interface EventoCorrida {
  id: number;
  user_id: number;
  nome_evento: string;
  data_evento: string;
  distancia_km: number;
  tempo_final_min: number;
  colocacao: number;
  created_at: string;
  updated_at: string;
}

export interface Ranking {
  id: number;
  aluno_id: number;
  posicao: number;
  pontuacao: number;
  periodo: string;
}

export interface AvaliacaoFisica {
  id: number;
  user_id: number;
  aluno_id: number;
  data: string;
  peso?: number;
  altura?: number;
  imc?: number;
  percentual_gordura?: number;
  observacoes?: string;
  created_at: string | null;
  updated_at: string | null;
  data_avaliacao: string;

}

export interface AtividadeStrava {
  id: number;
  aluno_id: number;
  strava_id: string;
  nome: string;
  distancia: number;
  tempo: number;
  data: string;
}

export interface Exercicio {
  id: number;
  nome: string;
  descricao?: string;
  tipo: string;
  duracao?: number;
}
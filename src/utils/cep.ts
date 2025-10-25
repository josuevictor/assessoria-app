export async function buscarEnderecoPorCep(cep: string) {
  // Remove tudo que não é número
  const cepLimpo = cep.replace(/\D/g, '');

  // Se não tiver 8 dígitos, retorna null
  if (cepLimpo.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  const data = await response.json();

  if (data.erro) return null;

  return {
    endereco: data.logradouro || '',
    cidade: data.localidade || '',
    estado: data.uf || '',
  };
}

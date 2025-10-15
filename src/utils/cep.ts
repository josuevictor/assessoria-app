export async function buscarEnderecoPorCep(cep: string) {
  if (cep.replace(/\D/g, '').length !== 8) return null;
  const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
  const data = await response.json();
  if (data.erro) return null;
  return {
    endereco: data.logradouro || '',
    cidade: data.localidade || '',
    estado: data.uf || '',
  };
}
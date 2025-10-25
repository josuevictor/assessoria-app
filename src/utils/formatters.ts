 
 export function formatCPF(value: string) {
  
  value = value.replace(/\D/g, '');

  // Aplica a máscara de CPF: 000.000.000-00
  if (value.length > 3) value = value.replace(/(\d{3})(\d)/, '$1.$2');
  if (value.length > 6) value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  if (value.length > 9) value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

  if (value.length > 14) value = value.slice(0, 14);

  return value;
}

// Formata número de telefone no padrão (00) 00000-0000 ou (00) 0000-0000
export function formatTelefone(value: string) {

  const digits = value.replace(/\D/g, '');

  if (!digits) return '';

  const limited = digits.slice(0, 11);

  if (limited.length <= 2) {
    return `(${limited}`;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
}

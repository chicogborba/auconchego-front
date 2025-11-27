/**
 * Funções de máscara para formatação de inputs
 */

/**
 * Aplica máscara de telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function maskPhone(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Aplica a máscara conforme o tamanho
  if (numbers.length <= 2) {
    return numbers.length > 0 ? `(${numbers}` : numbers
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  } else {
    // Telefone com 11 dígitos (celular)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

/**
 * Remove a máscara do telefone, retornando apenas números
 */
export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Aplica máscara de CPF: XXX.XXX.XXX-XX
 */
export function maskCPF(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11)
  
  // Aplica a máscara
  if (limited.length <= 3) {
    return limited
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9, 11)}`
  }
}

/**
 * Remove a máscara do CPF, retornando apenas números
 */
export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Aplica máscara de CNPJ: XX.XXX.XXX/XXXX-XX
 */
export function maskCNPJ(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 14 dígitos
  const limited = numbers.slice(0, 14)
  
  // Aplica a máscara
  if (limited.length <= 2) {
    return limited
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 2)}.${limited.slice(2)}`
  } else if (limited.length <= 8) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`
  } else if (limited.length <= 12) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`
  } else {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12, 14)}`
  }
}

/**
 * Remove a máscara do CNPJ, retornando apenas números
 */
export function unmaskCNPJ(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Aplica máscara de CEP: XXXXX-XXX
 */
export function maskCEP(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 8 dígitos
  const limited = numbers.slice(0, 8)
  
  // Aplica a máscara
  if (limited.length <= 5) {
    return limited
  } else {
    return `${limited.slice(0, 5)}-${limited.slice(5, 8)}`
  }
}

/**
 * Remove a máscara do CEP, retornando apenas números
 */
export function unmaskCEP(value: string): string {
  return value.replace(/\D/g, '')
}



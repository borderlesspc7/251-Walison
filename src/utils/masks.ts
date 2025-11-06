/**
 * Utilitários de máscara para formatação de inputs
 */

export type MaskType =
  | "cpf"
  | "cnpj"
  | "cep"
  | "phone"
  | "currency"
  | "percentage"
  | "bankAgency"
  | "bankAccount"
  | "date"
  | "none";

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export const maskCPF = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6)
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export const maskCNPJ = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5)
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

/**
 * Aplica máscara de CEP: 00000-000
 */
export const maskCEP = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const maskPhone = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length === 0) return "";
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Aplica máscara de moeda: R$ 0.000,00
 */
export const maskCurrency = (value: string): string => {
  // Remove tudo exceto números
  const numbers = removeNonNumeric(value);
  if (numbers.length === 0) return "";

  // Converte para número e divide por 100 para ter centavos
  const amount = parseInt(numbers, 10) / 100;

  // Formata como moeda brasileira
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Remove máscara de moeda e retorna apenas números
 */
export const unmaskCurrency = (value: string): string => {
  return removeNonNumeric(value);
};

/**
 * Converte valor de moeda mascarada para número
 */
export const currencyToNumber = (value: string): number => {
  const numbers = removeNonNumeric(value);
  if (numbers.length === 0) return 0;
  return parseInt(numbers, 10) / 100;
};

/**
 * Aplica máscara de porcentagem: 00,00%
 */
export const maskPercentage = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length === 0) return "";
  
  // Divide por 100 para ter decimais
  const percentage = parseInt(numbers, 10) / 100;
  
  // Formata com 2 casas decimais
  return `${percentage.toFixed(2).replace(".", ",")}%`;
};

/**
 * Remove máscara de porcentagem e retorna apenas números
 */
export const unmaskPercentage = (value: string): string => {
  return removeNonNumeric(value);
};

/**
 * Converte valor de porcentagem mascarada para número
 */
export const percentageToNumber = (value: string): number => {
  const numbers = removeNonNumeric(value);
  if (numbers.length === 0) return 0;
  return parseFloat(numbers) / 100;
};

/**
 * Aplica máscara de agência bancária: 0000
 */
export const maskBankAgency = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers.slice(0, 4);
};

/**
 * Aplica máscara de conta bancária: 00000-0
 */
export const maskBankAccount = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 6)}`;
};

/**
 * Aplica a máscara apropriada baseada no tipo
 */
export const applyMask = (value: string, maskType: MaskType): string => {
  if (!value) return "";

  switch (maskType) {
    case "cpf":
      return maskCPF(value);
    case "cnpj":
      return maskCNPJ(value);
    case "cep":
      return maskCEP(value);
    case "phone":
      return maskPhone(value);
    case "currency":
      return maskCurrency(value);
    case "percentage":
      return maskPercentage(value);
    case "bankAgency":
      return maskBankAgency(value);
    case "bankAccount":
      return maskBankAccount(value);
    case "date":
      return value; // Date inputs já têm sua própria formatação
    case "none":
    default:
      return value;
  }
};

/**
 * Remove a máscara e retorna apenas os números
 */
export const removeMask = (value: string, maskType: MaskType): string => {
  if (!value) return "";

  switch (maskType) {
    case "currency":
      return unmaskCurrency(value);
    case "percentage":
      return unmaskPercentage(value);
    default:
      return removeNonNumeric(value);
  }
};

/**
 * Converte valor mascarado para número (para currency e percentage)
 */
export const maskedToNumber = (value: string, maskType: MaskType): number => {
  if (!value) return 0;

  switch (maskType) {
    case "currency":
      return currencyToNumber(value);
    case "percentage":
      return percentageToNumber(value);
    default:
      const numbers = removeNonNumeric(value);
      return numbers ? parseFloat(numbers) : 0;
  }
};


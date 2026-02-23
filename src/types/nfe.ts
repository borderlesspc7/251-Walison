// Tipos para o módulo de Notas Fiscais Eletrônicas (NFe)

export interface NFe {
  id: string;
  number: number; // Número sequencial da NF-e
  series: string; // Série da NF-e
  code: string; // Código gerado automaticamente (série + número)
  
  // Informações da empresa emitente
  company: "exclusive" | "giogio" | "direta";
  companyName: string;
  companyCnpj: string;
  
  // Informações do cliente (destinatário)
  clientId: string;
  clientName: string;
  clientCpf: string;
  clientEmail?: string;
  
  // Informações da venda/contrato
  saleId: string;
  saleCode: string;
  houseId: string;
  houseName: string;
  
  // Valores
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  
  dailyRateValue: number; // Valor das diárias
  conciergeValue: number; // Serviços concierge
  additionalServicesValue: number; // Serviços adicionais
  discountValue: number; // Descontos
  
  subtotal: number; // Subtotal (diárias + concierge + adicionais - descontos)
  taxValue: number; // Valor do imposto
  totalValue: number; // Total com imposto
  
  // NFe específico
  issueDate: Date;
  status: NFeStatus;
  nfeNumber?: string; // Número da NF-e retornado pela SEFAZ
  nfeKey?: string; // Chave de acesso da NF-e
  xmlContent?: string; // XML da NF-e assinada
  pdfUrl?: string; // URL do DANFE (PDF)
  
  // Rastreamento
  emissionError?: string; // Erro na emissão (se houver)
  failureAttempts: number; // Número de tentativas falhas
  lastAttemptDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type NFeStatus = 
  | "pending" // Aguardando emissão
  | "processing" // Sendo processada
  | "authorized" // Autorizada pela SEFAZ
  | "cancelled" // Cancelada
  | "rejected" // Rejeitada pela SEFAZ
  | "error"; // Erro na emissão

export interface CreateNFeData {
  saleId: string;
  company: "exclusive" | "giogio" | "direta";
  issueDate?: Date;
}

export interface UpdateNFeData {
  id?: string;
  status?: NFeStatus;
  nfeNumber?: string;
  nfeKey?: string;
  xmlContent?: string;
  pdfUrl?: string;
  emissionError?: string;
  failureAttempts?: number;
}

export interface NFeFilters {
  search?: string;
  company?: "exclusive" | "giogio" | "direta" | "all";
  status?: NFeStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  series?: string;
}

export interface NFeTableRow extends NFe {
  _searchText: string;
}

export interface NFeSequenceConfig {
  company: "exclusive" | "giogio" | "direta";
  series: string;
  lastNumber: number;
  lastIssueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyNFeConfig {
  company: "exclusive" | "giogio" | "direta";
  companyName: string;
  cnpj: string;
  stateRegistration: string; // Inscrição Estadual
  series: string; // Série padrão
  autoIssue: boolean; // Emitir automaticamente ao confirmar venda
  sefazEnvironment: "production" | "sandbox"; // Ambiente SEFAZ
  certificatePath?: string; // Caminho do certificado digital
  createdAt: Date;
  updatedAt: Date;
}

// Interface para dados de emissão da NF-e na API SEFAZ
export interface NFeEmissionRequest {
  company: "exclusive" | "giogio" | "direta";
  series: string;
  number: number;
  
  // Emitente
  emitterCnpj: string;
  emitterName: string;
  
  // Destinatário
  recipientCpf: string;
  recipientName: string;
  
  // Produto/Serviço
  description: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  
  // Impostos
  icmsRate: number;
  icmsValue: number;
  
  issueDate: string; // ISO format
  
  // Informações adicionais
  clientEmail?: string;
  clientPhone?: string;
}

export interface NFeEmissionResponse {
  success: boolean;
  nfeNumber?: string;
  nfeKey?: string;
  xmlContent?: string;
  pdfUrl?: string;
  error?: string;
  timestamp: Date;
}

// Relatório de NFes emitidas
export interface NFeReport {
  company: "exclusive" | "giogio" | "direta";
  period: string;
  totalIssued: number;
  totalAuthorized: number;
  totalRejected: number;
  totalCancelled: number;
  totalValue: number;
  taxCollected: number;
  successRate: number; // percentual
}

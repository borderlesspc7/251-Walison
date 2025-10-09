export interface Sale {
  id: string;
  code: string; // Número da venda gerado automaticamente

  // Informações da empresa
  company: CompanyType;

  // Informações do cliente
  clientId: string;
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  clientEmail: string;
  clientGender: string;

  // Origem da venda
  saleOrigin: SaleOrigin;

  // Informações da casa
  houseId: string;
  houseName: string;
  houseAddress: string;

  // Informações de estadia
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  numberOfGuests: number;

  // Valores financeiros
  contractValue: number; // Valor base do contrato
  discount: number; // Desconto aplicado
  netValue: number; // Valor líquido (contrato - desconto)
  salesCommission: number; // 10% do valor líquido
  housekeeperValue: number; // Valor da governanta

  // Serviços de concierge
  conciergeValue: number;

  // Vendas adicionais (comissões de fornecedores)
  additionalSales: {
    supermarket: number;
    seafood: number;
    seafoodMeat: number;
    transfer: number;
    vegetables: number;
    coconuts: number;
  };

  // Cálculos automáticos
  totalAdditionalSales: number; // Soma de todas as vendas adicionais
  totalRevenue: number; // Faturamento total
  contributionMargin: number; // Margem de contribuição

  // Status e datas
  status: SaleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CompanyType = "exclusive" | "giogio" | "direta";
export type SaleOrigin =
  | "instagram"
  | "facebook"
  | "google"
  | "indicacao"
  | "whatsapp"
  | "site"
  | "outros";

export type SaleStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface CreateSaleData {
  company: CompanyType;
  clientId: string;
  saleOrigin: SaleOrigin;
  houseId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  contractValue: number;
  discount?: number;
  housekeeperValue?: number;
  conciergeValue?: number;
  additionalSales?: {
    supermarket?: number;
    seafood?: number;
    seafoodMeat?: number;
    transfer?: number;
    vegetables?: number;
    coconuts?: number;
  };
  status?: SaleStatus;
}

export interface UpdateSaleData extends Partial<CreateSaleData> {
  id: string;
}

export interface SaleFilters {
  search?: string;
  company?: CompanyType;
  status?: SaleStatus;
  saleOrigin?: SaleOrigin;
  dateRange?: {
    start: Date;
    end: Date;
  };
  clientName?: string;
  houseName?: string;
}

export interface SaleTableRow extends Sale {
  _searchText: string;
}

// Interface para cálculos automáticos
export interface SaleCalculations {
  numberOfNights: number;
  netValue: number;
  salesCommission: number;
  totalAdditionalSales: number;
  totalRevenue: number;
  contributionMargin: number;
}

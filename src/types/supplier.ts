export interface Supplier {
  id: string;
  code: string;
  establishmentName: string;
  serviceType: string;
  bankData: {
    bank: string;
    agency: string;
    account: string;
    accountType: AccountType;
  };
  pix: string;
  commissionPercentage: number;
  status: SupplierStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type SupplierStatus = "active" | "inactive" | "suspended";
export type AccountType = "checking" | "savings" | "business";

export interface CreateSupplierData {
  establishmentName: string;
  serviceType: string;
  bankData: {
    bank: string;
    agency: string;
    account: string;
    accountType: AccountType;
  };
  pix: string;
  commissionPercentage: number;
  status: SupplierStatus;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id: string;
}

export interface SupplierFilters {
  search?: string;
  status?: SupplierStatus;
  serviceType?: string;
  bank?: string;
}

export interface SupplierTableRow extends Supplier {
  _searchText: string; // Campo para facilitar a busca
}

export interface Owner {
  id: string;
  code: string;
  name: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  profession: string;
  maritalStatus: MaritalStatus;
  phone: string;
  bankData: {
    bank: string;
    agency: string;
    account: string;
    accountType: AccountType;
  };
  pix: string;
  commission: number;
  status: OwnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OwnerStatus = "active" | "inactive" | "suspended";
export type AccountType = "checking" | "savings" | "business";
export type MaritalStatus =
  | "single"
  | "married"
  | "divorced"
  | "widowed"
  | "separated";

export interface CreateOwnerData {
  name: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  profession: string;
  maritalStatus: MaritalStatus;
  phone: string;
  bankData: {
    bank: string;
    agency: string;
    account: string;
    accountType: AccountType;
  };
  pix: string;
  commission: number;
  status: OwnerStatus;
}

export interface UpdateOwnerData extends Partial<CreateOwnerData> {
  id: string;
}

export interface OwnerFilters {
  search?: string;
  status?: OwnerStatus;
  city?: string;
  state?: string;
  profession?: string;
  maritalStatus?: MaritalStatus;
  bank?: string;
}

export interface OwnerTableRow extends Owner {
  _searchText: string; // Campo para facilitar a busca
}

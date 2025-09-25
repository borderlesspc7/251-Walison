export interface Client {
  id: string;
  code: string; // Código gerado automaticamente
  name: string;
  cpf: string;
  birthDate: Date;
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
  email: string;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientStatus = "active" | "inactive" | "prospect";
export type MaritalStatus =
  | "single"
  | "married"
  | "divorced"
  | "widowed"
  | "separated";

export interface CreateClientData {
  name: string;
  cpf: string;
  birthDate: Date;
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
  email: string;
  status: ClientStatus;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
  city?: string;
  state?: string;
  profession?: string;
  maritalStatus?: MaritalStatus;
}

export interface ClientTableRow extends Client {
  _searchText: string; // Campo para facilitar a busca
}

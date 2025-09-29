export interface Employee {
  id: string;
  name: string;
  rentalCommissionPercentage: number; // 10% do líquido (faturamento - despesas)
  supplierCommissionPercentage: number; // 10% do líquido (faturamento - impostos)
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type EmployeeStatus = "active" | "inactive" | "suspended";

export interface CreateEmployeeData {
  name: string;
  rentalCommissionPercentage: number;
  supplierCommissionPercentage: number;
  status: EmployeeStatus;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  id: string;
}

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
}

export interface EmployeeTableRow extends Employee {
  _searchText: string; // Campo para facilitar a busca
}

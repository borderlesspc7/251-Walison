import React, { useState } from "react";
import type { Employee } from "../../../types/employee";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../../components/ui/Button/Button";
import { FiFileText, FiEye, FiEdit3, FiTrash2 } from "react-icons/fi";
import "./EmployeeList.css";

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  loading,
  onEdit,
  onView,
  onDelete,
}) => {
  const [sortField, setSortField] = useState<keyof Employee>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    const aValue: unknown = a[sortField];
    const bValue: unknown = b[sortField];

    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // Handle numbers
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Ativo", class: "status-active" },
      inactive: { label: "Inativo", class: "status-inactive" },
      suspended: { label: "Suspenso", class: "status-suspended" },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      class: "status-default",
    };

    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: keyof Employee;
    children: React.ReactNode;
  }) => (
    <button
      className={`sort-button ${sortField === field ? "active" : ""}`}
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field && (
        <span className="sort-indicator">
          {sortDirection === "asc" ? "▲" : "▼"}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="employee-list-loading">
        <LoadingSpinner text="Carregando colaboradores..." />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="employee-list-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <FiFileText size={48} />
          </div>
          <h3>Nenhum colaborador encontrado</h3>
          <p>
            Não há colaboradores cadastrados ou que correspondam aos filtros
            aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-list">
      <div className="employee-list-header">
        <h3>Lista de Colaboradores ({employees.length})</h3>
      </div>

      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>
                <SortButton field="name">Nome</SortButton>
              </th>
              <th>
                <SortButton field="rentalCommissionPercentage">
                  Comissão Locações
                </SortButton>
              </th>
              <th>
                <SortButton field="supplierCommissionPercentage">
                  Comissão Fornecedores
                </SortButton>
              </th>
              <th>
                <SortButton field="status">Status</SortButton>
              </th>
              <th>
                <SortButton field="createdAt">Data Cadastro</SortButton>
              </th>
              <th className="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((employee) => (
              <tr key={employee.id} className="employee-row">
                <td className="employee-name">
                  <span className="name">{employee.name}</span>
                </td>
                <td className="employee-commission">
                  <div className="commission-info">
                    <span className="commission-value">
                      {formatPercentage(employee.rentalCommissionPercentage)}
                    </span>
                    <span className="commission-label">do líquido</span>
                    <span className="commission-description">
                      (Faturamento - Despesas)
                    </span>
                  </div>
                </td>
                <td className="employee-commission">
                  <div className="commission-info">
                    <span className="commission-value">
                      {formatPercentage(employee.supplierCommissionPercentage)}
                    </span>
                    <span className="commission-label">do líquido</span>
                    <span className="commission-description">
                      (Faturamento - Impostos)
                    </span>
                  </div>
                </td>
                <td className="employee-status">
                  {getStatusBadge(employee.status)}
                </td>
                <td className="employee-date">
                  {formatDate(employee.createdAt)}
                </td>
                <td className="employee-actions">
                  <div className="action-buttons">
                    <Button
                      onClick={() => onView(employee)}
                      variant="secondary"
                      size="small"
                      className="action-btn view-btn"
                    >
                      <FiEye size={16} />
                    </Button>
                    <Button
                      onClick={() => onEdit(employee)}
                      variant="secondary"
                      size="small"
                      className="action-btn edit-btn"
                    >
                      <FiEdit3 size={16} />
                    </Button>
                    <Button
                      onClick={() => onDelete(employee.id)}
                      variant="secondary"
                      size="small"
                      className="action-btn delete-btn"
                    >
                      <FiTrash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

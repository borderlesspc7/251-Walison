import React, { useState } from "react";
import type { Supplier } from "../../../types/supplier";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../../components/ui/Button/Button";
import {
  FiFileText,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiDollarSign,
} from "react-icons/fi";
import "./SupplierList.css";

interface SupplierListProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onView: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export const SupplierList: React.FC<SupplierListProps> = ({
  suppliers,
  loading,
  onEdit,
  onView,
  onDelete,
}) => {
  const [sortField, setSortField] =
    useState<keyof Supplier>("establishmentName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    let aValue: unknown = a[sortField];
    let bValue: unknown = b[sortField];

    // Handle nested bankData fields
    if (sortField === "bankData") {
      aValue = a.bankData.bank;
      bValue = b.bankData.bank;
    }

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

  const getServiceTypeLabel = (type: string) => {
    const typeMap = {
      catering: "Buffet/Catering",
      decoration: "Decoração",
      photography: "Fotografia",
      music: "Música/Som",
      transport: "Transporte",
      cleaning: "Limpeza",
      security: "Segurança",
      flowers: "Flores",
      other: "Outros",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getAccountTypeLabel = (type: string) => {
    const typeMap = {
      checking: "Conta Corrente",
      savings: "Poupança",
      business: "Empresarial",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: keyof Supplier;
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
      <div className="supplier-list-loading">
        <LoadingSpinner text="Carregando fornecedores..." />
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="supplier-list-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <FiFileText size={48} />
          </div>
          <h3>Nenhum fornecedor encontrado</h3>
          <p>
            Não há fornecedores cadastrados ou que correspondam aos filtros
            aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-list">
      <div className="supplier-list-header">
        <h3>Lista de Fornecedores ({suppliers.length})</h3>
      </div>

      <div className="supplier-table-container">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>
                <SortButton field="establishmentName">
                  Nome do Estabelecimento
                </SortButton>
              </th>
              <th>
                <SortButton field="serviceType">Tipo de Serviço</SortButton>
              </th>
              <th>
                <SortButton field="status">Status</SortButton>
              </th>
              <th>
                <SortButton field="commissionPercentage">Comissão</SortButton>
              </th>
              <th>
                <SortButton field="bankData">Banco</SortButton>
              </th>
              <th>
                <SortButton field="createdAt">Data Cadastro</SortButton>
              </th>
              <th className="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedSuppliers.map((supplier) => (
              <tr key={supplier.id} className="supplier-row">
                <td className="supplier-name">
                  <div className="name-info">
                    <span className="name">{supplier.establishmentName}</span>
                    <span className="code">Código: {supplier.code}</span>
                  </div>
                </td>
                <td className="supplier-service">
                  <span className="service-type">
                    {getServiceTypeLabel(supplier.serviceType)}
                  </span>
                </td>
                <td className="supplier-status">
                  {getStatusBadge(supplier.status)}
                </td>
                <td className="supplier-commission">
                  <div className="commission-info">
                    <span className="commission-value">
                      {formatPercentage(supplier.commissionPercentage)}
                    </span>
                    <span className="commission-label">comissão</span>
                  </div>
                </td>
                <td className="supplier-bank">
                  <div className="bank-info">
                    <span className="bank-name">{supplier.bankData.bank}</span>
                    <span className="account-type">
                      {getAccountTypeLabel(supplier.bankData.accountType)}
                    </span>
                  </div>
                </td>
                <td className="supplier-date">
                  {formatDate(supplier.createdAt)}
                </td>
                <td className="supplier-actions">
                  <div className="action-buttons">
                    <Button
                      onClick={() => onView(supplier)}
                      variant="secondary"
                      size="small"
                      className="action-btn view-btn"
                    >
                      <FiEye size={16} />
                    </Button>
                    <Button
                      onClick={() => onEdit(supplier)}
                      variant="secondary"
                      size="small"
                      className="action-btn edit-btn"
                    >
                      <FiEdit3 size={16} />
                    </Button>
                    <Button
                      onClick={() => onDelete(supplier.id)}
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

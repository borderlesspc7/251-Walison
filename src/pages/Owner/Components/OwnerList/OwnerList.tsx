import React, { useState } from "react";
import type { Owner } from "../../../../types/owner";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../../../components/ui/Button/Button";
import { FiFileText, FiEye, FiEdit3, FiTrash2 } from "react-icons/fi";
import "./OwnerList.css";

interface OwnerListProps {
  owners: Owner[];
  loading: boolean;
  onEdit: (owner: Owner) => void;
  onView: (owner: Owner) => void;
  onDelete: (id: string) => void;
}

export const OwnerList: React.FC<OwnerListProps> = ({
  owners,
  loading,
  onEdit,
  onView,
  onDelete,
}) => {
  const [sortField, setSortField] = useState<keyof Owner>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof Owner) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedOwners = [...owners].sort((a, b) => {
    let aValue: unknown = a[sortField];
    let bValue: unknown = b[sortField];

    // Handle nested address fields
    if (sortField === "address") {
      aValue = a.address.city;
      bValue = b.address.city;
    }

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

  const formatPhone = (phone: string) => {
    // Formatar telefone brasileiro
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7
      )}`;
    }
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`;
    }
    return phone;
  };

  const formatCPF = (cpf: string) => {
    // Formatar CPF
    const numbers = cpf.replace(/\D/g, "");
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6,
        9
      )}-${numbers.slice(9)}`;
    }
    return cpf;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
    field: keyof Owner;
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
      <div className="owner-list-loading">
        <LoadingSpinner text="Carregando proprietários..." />
      </div>
    );
  }

  if (owners.length === 0) {
    return (
      <div className="owner-list-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <FiFileText size={48} />
          </div>
          <h3>Nenhum proprietário encontrado</h3>
          <p>
            Não há proprietários cadastrados ou que correspondam aos filtros
            aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-list">
      <div className="owner-list-header">
        <h3>Lista de Proprietários ({owners.length})</h3>
      </div>

      <div className="owner-table-container">
        <table className="owner-table">
          <thead>
            <tr>
              <th>
                <SortButton field="name">Nome</SortButton>
              </th>
              <th>
                <SortButton field="phone">Contato</SortButton>
              </th>
              <th>
                <SortButton field="profession">Profissão</SortButton>
              </th>
              <th>
                <SortButton field="status">Status</SortButton>
              </th>
              <th>
                <SortButton field="address">Cidade</SortButton>
              </th>
              <th>
                <SortButton field="commission">Comissão</SortButton>
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
            {sortedOwners.map((owner) => (
              <tr key={owner.id} className="owner-row">
                <td className="owner-name">
                  <div className="name-info">
                    <span className="name">{owner.name}</span>
                    <span className="code">Código: {owner.code}</span>
                  </div>
                </td>
                <td className="owner-contact">
                  <div className="contact-info">
                    <span className="phone">{formatPhone(owner.phone)}</span>
                    <span className="cpf">CPF: {formatCPF(owner.cpf)}</span>
                  </div>
                </td>
                <td className="owner-profession">
                  <span className="profession">{owner.profession}</span>
                </td>
                <td className="owner-status">{getStatusBadge(owner.status)}</td>
                <td className="owner-location">
                  <div className="location-info">
                    <span className="city">{owner.address.city}</span>
                    <span className="state">{owner.address.state}</span>
                  </div>
                </td>
                <td className="owner-commission">
                  <div className="commission-info">
                    <span className="commission-value">
                      {formatCurrency(owner.commission)}
                    </span>
                    <span className="commission-label">por venda</span>
                  </div>
                </td>
                <td className="owner-bank">
                  <div className="bank-info">
                    <span className="bank-name">{owner.bankData.bank}</span>
                    <span className="account-type">
                      {getAccountTypeLabel(owner.bankData.accountType)}
                    </span>
                  </div>
                </td>
                <td className="owner-date">{formatDate(owner.createdAt)}</td>
                <td className="owner-actions">
                  <div className="action-buttons">
                    <Button
                      onClick={() => onView(owner)}
                      variant="secondary"
                      size="small"
                      className="action-btn view-btn"
                    >
                      <FiEye size={16} />
                    </Button>
                    <Button
                      onClick={() => onEdit(owner)}
                      variant="secondary"
                      size="small"
                      className="action-btn edit-btn"
                    >
                      <FiEdit3 size={16} />
                    </Button>
                    <Button
                      onClick={() => onDelete(owner.id)}
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

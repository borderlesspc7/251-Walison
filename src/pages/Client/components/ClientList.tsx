import React, { useState } from "react";
import type { Client } from "../../../types/client";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../../components/ui/Button/Button";
import { FiFileText, FiEye, FiEdit3, FiTrash2 } from "react-icons/fi";
import "./ClientList.css";

interface ClientListProps {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
  onDelete: (id: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  loading,
  onEdit,
  onView,
  onDelete,
}) => {
  const [sortField, setSortField] = useState<keyof Client>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    let aValue: unknown = a[sortField];
    let bValue: unknown = b[sortField];

    // Handle nested address fields
    if (sortField === "address") {
      aValue = a.address.city;
      bValue = b.address.city;
    }

    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Ativo", class: "status-active" },
      inactive: { label: "Inativo", class: "status-inactive" },
      prospect: { label: "Prospect", class: "status-prospect" },
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
    field: keyof Client;
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
      <div className="client-list-loading">
        <LoadingSpinner text="Carregando clientes..." />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="client-list-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <FiFileText size={48} />
          </div>
          <h3>Nenhum cliente encontrado</h3>
          <p>
            Não há clientes cadastrados ou que correspondam aos filtros
            aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-list">
      <div className="client-list-header">
        <h3>Lista de Clientes ({clients.length})</h3>
      </div>

      <div className="client-table-container">
        <table className="client-table">
          <thead>
            <tr>
              <th>
                <SortButton field="name">Nome</SortButton>
              </th>
              <th>
                <SortButton field="email">Contato</SortButton>
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
                <SortButton field="createdAt">Data Cadastro</SortButton>
              </th>
              <th className="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.map((client) => (
              <tr key={client.id} className="client-row">
                <td className="client-name">
                  <div className="name-info">
                    <span className="name">{client.name}</span>
                    <span className="code">Código: {client.code}</span>
                  </div>
                </td>
                <td className="client-contact">
                  <div className="contact-info">
                    <span className="email">{client.email}</span>
                    <span className="phone">{formatPhone(client.phone)}</span>
                  </div>
                </td>
                <td className="client-profession">
                  <span className="profession">{client.profession}</span>
                </td>
                <td className="client-status">
                  {getStatusBadge(client.status)}
                </td>
                <td className="client-location">
                  <div className="location-info">
                    <span className="city">{client.address.city}</span>
                    <span className="state">{client.address.state}</span>
                  </div>
                </td>
                <td className="client-date">{formatDate(client.createdAt)}</td>
                <td className="client-actions">
                  <div className="action-buttons">
                    <Button
                      onClick={() => onView(client)}
                      variant="secondary"
                      size="small"
                      className="action-btn view-btn"
                    >
                      <FiEye size={16} />
                    </Button>
                    <Button
                      onClick={() => onEdit(client)}
                      variant="secondary"
                      size="small"
                      className="action-btn edit-btn"
                    >
                      <FiEdit3 size={16} />
                    </Button>
                    <Button
                      onClick={() => onDelete(client.id)}
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

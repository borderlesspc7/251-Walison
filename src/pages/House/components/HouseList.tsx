import React, { useState } from "react";
import type { House } from "../../../types/house";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../../components/ui/Button/Button";
import { FiHome, FiEye, FiEdit3, FiTrash2 } from "react-icons/fi";
import "./HouseList.css";

interface HouseListProps {
  houses: House[];
  loading: boolean;
  onEdit: (house: House) => void;
  onDelete: (id: string) => void;
  onView: (house: House) => void;
}

export const HouseList: React.FC<HouseListProps> = ({
  houses,
  loading,
  onEdit,
  onDelete,
  onView,
}) => {
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof House) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedHouses = [...houses].sort((a, b) => {
    let aValue: unknown = a[sortField as keyof House];
    let bValue: unknown = b[sortField as keyof House];

    // Handle nested address fields
    if (sortField === "address") {
      aValue = a.address.city;
      bValue = b.address.city;
    }

    // Handle nested pricing fields
    if (sortField === "pricing") {
      aValue = a.pricing.lowSeason;
      bValue = b.pricing.lowSeason;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: "Disponível", class: "status-available" },
      occupied: { label: "Ocupada", class: "status-occupied" },
      maintenance: { label: "Manutenção", class: "status-maintenance" },
      inactive: { label: "Inativa", class: "status-inactive" },
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
    field: keyof House;
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
      <div className="house-list-loading">
        <LoadingSpinner text="Carregando casas..." />
      </div>
    );
  }

  if (houses.length === 0) {
    return (
      <div className="house-list-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <FiHome size={48} />
          </div>
          <h3>Nenhuma casa encontrada</h3>
          <p>
            Não há casas cadastradas ou que correspondam aos filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="house-list">
      <div className="house-list-header">
        <h3>Lista de Casas ({houses.length})</h3>
      </div>

      <div className="house-table-container">
        <table className="house-table">
          <thead>
            <tr>
              <th>
                <SortButton field="houseName">Nome da Casa</SortButton>
              </th>
              <th>
                <SortButton field="address">Localização</SortButton>
              </th>
              <th>
                <SortButton field="status">Status</SortButton>
              </th>
              <th>
                <SortButton field="pricing">Preço (Baixa temporada)</SortButton>
              </th>
              <th>
                <SortButton field="createdAt">Data Cadastro</SortButton>
              </th>
              <th className="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedHouses.map((house) => (
              <tr key={house.id} className="house-row">
                <td className="house-name">
                  <div className="name-info">
                    <span className="name">{house.houseName}</span>
                    <span className="code">Código: {house.code}</span>
                  </div>
                </td>

                <td className="house-location">
                  <div className="location-info">
                    <span className="neighborhood">
                      {house.address.neighborhood}
                    </span>
                    <span className="city-state">
                      {house.address.city} - {house.address.state}
                    </span>
                  </div>
                </td>

                <td className="house-status">{getStatusBadge(house.status)}</td>

                <td className="house-pricing">
                  <div className="pricing-info">
                    <span className="main-price">
                      {formatCurrency(house.pricing.lowSeason)}
                    </span>
                    <span className="price-label">baixa temporada</span>
                  </div>
                </td>
                <td className="house-date">{formatDate(house.createdAt)}</td>
                <td className="house-actions">
                  <div className="action-buttons">
                    <Button
                      onClick={() => onView(house)}
                      variant="secondary"
                      size="small"
                      className="action-btn view-btn"
                    >
                      <FiEye size={16} />
                    </Button>
                    <Button
                      onClick={() => onEdit(house)}
                      variant="secondary"
                      size="small"
                      className="action-btn edit-btn"
                    >
                      <FiEdit3 size={16} />
                    </Button>
                    <Button
                      onClick={() => onDelete(house.id)}
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

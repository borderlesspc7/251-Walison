import React, { useState } from "react";
import type { Sale, SaleFilters } from "../../../types/sale";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../../components/ui/Button/Button";
import {
  FiEye,
  FiEdit3,
  FiTrash2,
  FiFilter,
  FiX,
  FiCalendar,
  FiHome,
  FiFileText,
} from "react-icons/fi";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import InputField from "../../../components/ui/InputField/InputField";
import "./SaleList.css";

interface SaleListProps {
  sales: Sale[];
  loading: boolean;
  onEdit: (sale: Sale) => void;
  onView: (sale: Sale) => void;
  onDelete: (id: string) => void;
  onCreateNFe?: (sale: Sale) => void;
  filters: SaleFilters;
  onFiltersChange: (filters: SaleFilters) => void;
  onClearFilters: () => void;
}

export const SaleList: React.FC<SaleListProps> = ({
  sales,
  loading,
  onEdit,
  onView,
  onDelete,
  onCreateNFe,
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [sortField, setSortField] = useState<keyof Sale>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: keyof Sale) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedSales = [...sales].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
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

  const getStatusBadge = (status: Sale["status"]) => {
    const statusMap = {
      pending: { label: "Pendente", class: "status-pending" },
      confirmed: { label: "Confirmada", class: "status-confirmed" },
      cancelled: { label: "Cancelada", class: "status-cancelled" },
      completed: { label: "Concluída", class: "status-completed" },
    };

    const statusInfo = statusMap[status];
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getCompanyBadge = (company: Sale["company"]) => {
    const companyMap = {
      exclusive: { label: "Exclusive", class: "company-exclusive" },
      giogio: { label: "Giogio", class: "company-giogio" },
      direta: { label: "Direta", class: "company-direta" },
    };

    const companyInfo = companyMap[company];
    return (
      <span className={`company-badge ${companyInfo.class}`}>
        {companyInfo.label}
      </span>
    );
  };

  const handleFilterChange = (field: keyof SaleFilters, value: string) => {
    onFiltersChange({ ...filters, [field]: value || undefined });
  };

  const companyOptions = [
    { value: "", label: "Todas" },
    { value: "exclusive", label: "Exclusive" },
    { value: "giogio", label: "Giogio" },
    { value: "direta", label: "Direta" },
  ];

  const statusOptions = [
    { value: "", label: "Todos" },
    { value: "pending", label: "Pendente" },
    { value: "confirmed", label: "Confirmada" },
    { value: "completed", label: "Concluída" },
    { value: "cancelled", label: "Cancelada" },
  ];

  const saleOriginOptions = [
    { value: "", label: "Todas" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "google", label: "Google" },
    { value: "indicacao", label: "Indicação" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "site", label: "Site" },
    { value: "outros", label: "Outros" },
  ];

  if (loading && sales.length === 0) {
    return <LoadingSpinner text="Carregando vendas..." />;
  }

  return (
    <div className="sale-list">
      <div className="sale-list-header">
        <div className="list-info">
          <h2>Lista de Vendas</h2>
          <span className="list-count">
            {sales.length} {sales.length === 1 ? "venda" : "vendas"}
          </span>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-toggle-btn"
        >
          <FiFilter size={16} />
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>
      </div>

      {showFilters && (
        <div className="sale-filters">
          <InputField
            label="Buscar"
            type="text"
            placeholder="Buscar por código, cliente, casa..."
            value={filters.search || ""}
            onChange={(value) => handleFilterChange("search", value)}
          />

          <SelectField
            label="Empresa"
            value={filters.company || ""}
            onChange={(value) => handleFilterChange("company", value)}
            options={companyOptions}
          />

          <SelectField
            label="Status"
            value={filters.status || ""}
            onChange={(value) => handleFilterChange("status", value)}
            options={statusOptions}
          />

          <SelectField
            label="Origem da Venda"
            value={filters.saleOrigin || ""}
            onChange={(value) => handleFilterChange("saleOrigin", value)}
            options={saleOriginOptions}
          />

          <Button onClick={onClearFilters} className="clear-filters-btn">
            <FiX size={16} />
            Limpar Filtros
          </Button>
        </div>
      )}

      {sales.length === 0 ? (
        <div className="empty-state">
          <FiCalendar size={48} />
          <h3>Nenhuma venda encontrada</h3>
          <p>Comece criando sua primeira venda ou ajuste os filtros.</p>
        </div>
      ) : (
        <div className="sale-table-container">
          <table className="sale-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("code")}>
                  Código{" "}
                  {sortField === "code" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("company")}>
                  Empresa{" "}
                  {sortField === "company" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("clientName")}>
                  Cliente{" "}
                  {sortField === "clientName" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("employeeName")}>
                  Vendedor/Colaborador{" "}
                  {sortField === "employeeName" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("houseName")}>
                  Casa{" "}
                  {sortField === "houseName" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("checkInDate")}>
                  Check-in{" "}
                  {sortField === "checkInDate" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("numberOfNights")}>
                  Noites{" "}
                  {sortField === "numberOfNights" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("totalRevenue")}>
                  Faturamento{" "}
                  {sortField === "totalRevenue" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("status")}>
                  Status{" "}
                  {sortField === "status" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <strong>{sale.code}</strong>
                  </td>
                  <td>{getCompanyBadge(sale.company)}</td>
                  <td>
                    <div className="client-info">
                      <span className="client-name">{sale.clientName}</span>
                      <span className="client-details">{sale.clientPhone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="employee-info">
                      <span className="employee-name">{sale.employeeName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="house-info">
                      <FiHome size={14} />
                      <span>{sale.houseName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <FiCalendar size={14} />
                      <span>{formatDate(sale.checkInDate)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="nights-badge">
                      {sale.numberOfNights} noites
                    </span>
                  </td>
                  <td>
                    <strong className="revenue-value">
                      {formatCurrency(sale.totalRevenue)}
                    </strong>
                  </td>
                  <td>{getStatusBadge(sale.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        onClick={() => onView(sale)}
                        title="Visualizar"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => onEdit(sale)}
                        title="Editar"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      {onCreateNFe && (
                        <button
                          className="action-btn nfe-btn"
                          onClick={() => onCreateNFe(sale)}
                          title="Criar NFe"
                        >
                          <FiFileText size={16} />
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => onDelete(sale.id)}
                        title="Excluir"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && sales.length > 0 && (
        <div className="loading-overlay">
          <LoadingSpinner text="Atualizando..." />
        </div>
      )}
    </div>
  );
};

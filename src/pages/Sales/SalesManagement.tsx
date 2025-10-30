import React, { useState, useEffect, useMemo } from "react";
import type { Sale, SaleFilters } from "../../types/sale";
import { saleService } from "../../services/saleService";
import { SaleList } from "./components/SaleList";
import { SaleModal } from "./components/SaleModal";
import { SaleStats } from "./components/SaleStats";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../components/ui/Button/Button";
import { FiShoppingCart } from "react-icons/fi";
import { ErrorMessage } from "../../components/ui/ErrorMessage/ErrorMessage";
import "./SalesManagement.css";

export const SalesManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [filters, setFilters] = useState<SaleFilters>({});
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    averageTicket: 0,
    totalCommissions: 0,
    totalMargin: 0,
  });

  // Carregar vendas
  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await saleService.getAll(filters);
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const statsData = await saleService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  // Filtrar vendas localmente
  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.code.toLowerCase().includes(searchLower) ||
          sale.clientName.toLowerCase().includes(searchLower) ||
          sale.houseName.toLowerCase().includes(searchLower) ||
          sale.clientCpf.includes(searchLower)
      );
    }

    if (filters.company) {
      filtered = filtered.filter((sale) => sale.company === filters.company);
    }

    if (filters.status) {
      filtered = filtered.filter((sale) => sale.status === filters.status);
    }

    if (filters.saleOrigin) {
      filtered = filtered.filter(
        (sale) => sale.saleOrigin === filters.saleOrigin
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(
        (sale) =>
          sale.checkInDate >= filters.dateRange!.start &&
          sale.checkInDate <= filters.dateRange!.end
      );
    }

    return filtered;
  }, [sales, filters]);

  // Efeitos
  useEffect(() => {
    loadSales();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadSales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Handlers
  const handleCreateSale = () => {
    setSelectedSale(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) {
      return;
    }

    try {
      await saleService.delete(id);
      setSales(sales.filter((sale) => sale.id !== id));
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir venda");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSale(null);
  };

  const handleSaleSaved = () => {
    loadSales();
    loadStats();
    handleModalClose();
  };

  const handleFiltersChange = (newFilters: SaleFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading && sales.length === 0) {
    return <LoadingSpinner text="Carregando vendas..." fullScreen />;
  }

  return (
    <div className="sales-management">
      <div className="sales-header">
        <div className="sales-header-content">
          <div className="sales-header-left">
            <div className="sales-header-icon">
              <FiShoppingCart />
            </div>
            <div className="sales-header-text">
              <h1 className="sales-header-title">Gestão de Vendas e Contratos</h1>
              <p className="sales-header-subtitle">Gerencie vendas, contratos e desempenho comercial</p>
            </div>
          </div>
          <Button onClick={handleCreateSale} className="create-sale-btn">
            + Nova Venda
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <SaleStats stats={stats} />

      <div className="sales-management-content">
        <SaleList
          sales={filteredSales}
          loading={loading}
          onEdit={handleEditSale}
          onView={handleViewSale}
          onDelete={handleDeleteSale}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      <SaleModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaleSaved}
        sale={selectedSale}
        mode={modalMode}
      />
    </div>
  );
};

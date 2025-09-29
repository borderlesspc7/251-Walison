import React, { useState, useEffect, useMemo } from "react";
import type { Supplier, SupplierFilters } from "../../types/supplier";
import { supplierService } from "../../services/supplierService";
import { SupplierList } from "./components/SupplierList";
import { SupplierModal } from "./components/SupplierModal";
import { SupplierFiltersComponent } from "./components/SupplierFilters";
import { SupplierStats } from "./components/SupplierStats";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../components/ui/Button/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage/ErrorMessage";
import "./SupplierManagement.css";

export const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [filters, setFilters] = useState<SupplierFilters>({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });

  // Carregar fornecedores
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getAll(filters);
      setSuppliers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar fornecedores"
      );
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const statsData = await supplierService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  // Filtrar fornecedores localmente
  const filteredSuppliers = useMemo(() => {
    let filtered = [...suppliers];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (supplier) =>
          supplier.establishmentName.toLowerCase().includes(searchLower) ||
          supplier.serviceType.toLowerCase().includes(searchLower) ||
          supplier.bankData.bank.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (supplier) => supplier.status === filters.status
      );
    }

    if (filters.serviceType) {
      filtered = filtered.filter(
        (supplier) => supplier.serviceType === filters.serviceType
      );
    }

    if (filters.bank) {
      filtered = filtered.filter((supplier) =>
        supplier.bankData.bank
          .toLowerCase()
          .includes(filters.bank!.toLowerCase())
      );
    }

    return filtered;
  }, [suppliers, filters]);

  // Efeitos
  useEffect(() => {
    loadSuppliers();
    loadStats();
  }, []); // Intencionalmente sem dependências - carregamento inicial

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadSuppliers();
    }
  }, [filters]); // Intencionalmente sem loadSuppliers nas dependências

  // Handlers
  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) {
      return;
    }

    try {
      await supplierService.delete(id);
      setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
      loadStats();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir fornecedor"
      );
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleSupplierSaved = () => {
    loadSuppliers();
    loadStats();
    handleModalClose();
  };

  const handleFiltersChange = (newFilters: SupplierFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading && suppliers.length === 0) {
    return <LoadingSpinner text="Carregando fornecedores..." fullScreen />;
  }

  return (
    <div className="supplier-management">
      <div className="supplier-management-header">
        <div className="header-content">
          <h1>Gestão de Fornecedores</h1>
          <Button
            onClick={handleCreateSupplier}
            className="create-supplier-btn"
          >
            + Novo Fornecedor
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <SupplierStats stats={stats} />

      <div className="supplier-management-content">
        <SupplierFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          supplierCount={filteredSuppliers.length}
          totalCount={suppliers.length}
        />

        <SupplierList
          suppliers={filteredSuppliers}
          loading={loading}
          onEdit={handleEditSupplier}
          onView={handleViewSupplier}
          onDelete={handleDeleteSupplier}
        />
      </div>

      <SupplierModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSupplierSaved}
        supplier={selectedSupplier}
        mode={modalMode}
      />
    </div>
  );
};

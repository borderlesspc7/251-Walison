// src/pages/Owner/OwnerManagement.tsx
import React, { useState, useEffect, useMemo } from "react";
import type { Owner, OwnerFilters } from "../../types/owner";
import { ownerService } from "../../services/ownerService";
import { OwnerList } from "./Components/OwnerList/OwnerList";
import { OwnerModal } from "./Components/OwnerModal/OwnerModal";
import { OwnerFiltersComponent } from "./Components/OwnerFiltersComponent/OwnerFiltersComponent";
import { OwnerStats } from "./Components/OwnerStats/OwnerStats";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../components/ui/Button/Button";
import { useToast } from "../../hooks/useToast";
import "./OwnerManagement.css";

export const OwnerManagement: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [filters, setFilters] = useState<OwnerFilters>({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });
  const { showError, showSuccess, showWarning } = useToast();

  // Carregar proprietários
  const loadOwners = async () => {
    try {
      setLoading(true);
      const data = await ownerService.getAll(filters);
      setOwners(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar proprietários";
      showError("Erro ao carregar proprietários", message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const statsData = await ownerService.getStats();
      setStats(statsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar estatísticas";
      showWarning("Estatísticas indisponíveis", message);
    }
  };

  // Filtrar proprietários localmente
  const filteredOwners = useMemo(() => {
    let filtered = [...owners];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (owner) =>
          owner.name.toLowerCase().includes(searchLower) ||
          owner.cpf.includes(searchLower) ||
          owner.phone.includes(searchLower) ||
          owner.bankData.bank.toLowerCase().includes(searchLower) ||
          owner.profession.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((owner) => owner.status === filters.status);
    }

    if (filters.profession) {
      filtered = filtered.filter((owner) =>
        owner.profession
          .toLowerCase()
          .includes(filters.profession!.toLowerCase())
      );
    }

    if (filters.maritalStatus) {
      filtered = filtered.filter(
        (owner) => owner.maritalStatus === filters.maritalStatus
      );
    }

    if (filters.city) {
      filtered = filtered.filter((owner) =>
        owner.address.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.state) {
      filtered = filtered.filter((owner) =>
        owner.address.state.toLowerCase().includes(filters.state!.toLowerCase())
      );
    }

    if (filters.bank) {
      filtered = filtered.filter((owner) =>
        owner.bankData.bank.toLowerCase().includes(filters.bank!.toLowerCase())
      );
    }

    return filtered;
  }, [owners, filters]);

  // Efeitos
  useEffect(() => {
    loadOwners();
    loadStats();
  }, []);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadOwners();
    }
  }, [filters]);

  // Handlers
  const handleCreateOwner = () => {
    setSelectedOwner(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteOwner = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este proprietário?")) {
      return;
    }

    try {
      await ownerService.delete(id);
      setOwners(owners.filter((owner) => owner.id !== id));
      loadStats();
      showSuccess(
        "Proprietário excluído",
        "O proprietário foi excluído com sucesso."
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir proprietário";
      showError("Erro ao excluir proprietário", message);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOwner(null);
  };

  const handleOwnerSaved = (action: "create" | "edit") => {
    loadOwners();
    loadStats();
    handleModalClose();
    showSuccess(
      action === "create" ? "Proprietário criado" : "Proprietário atualizado",
      action === "create"
        ? "O proprietário foi cadastrado com sucesso."
        : "As informações do proprietário foram atualizadas."
    );
  };

  const handleFiltersChange = (newFilters: OwnerFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading && owners.length === 0) {
    return <LoadingSpinner text="Carregando proprietários..." fullScreen />;
  }

  return (
    <div className="owner-management">
      <div className="owner-management-header">
        <div className="header-content">
          <h1>Gestão de Proprietários</h1>
          <Button onClick={handleCreateOwner} className="create-owner-btn">
            + Novo Proprietário
          </Button>
        </div>
      </div>

      <OwnerStats stats={stats} />

      <div className="owner-management-content">
        <OwnerFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          ownerCount={filteredOwners.length}
          totalCount={owners.length}
        />

        <OwnerList
          owners={filteredOwners}
          loading={loading}
          onEdit={handleEditOwner}
          onView={handleViewOwner}
          onDelete={handleDeleteOwner}
        />
      </div>

      <OwnerModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleOwnerSaved}
        onDelete={() => handleDeleteOwner(selectedOwner?.id || "")}
        owner={selectedOwner || undefined}
        mode={modalMode}
      />
    </div>
  );
};

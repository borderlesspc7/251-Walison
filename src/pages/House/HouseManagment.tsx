import React, { useState, useEffect, useMemo } from "react";
import type { House, Filters } from "../../types/house";
import { houseService } from "../../services/houseService";
import { HouseList } from "./components/HouseList";
import { HouseModal } from "./components/HouseModal";
import { HouseFilters } from "./components/HouseFilters";
import { HouseStats } from "./components/HouseStats";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../components/ui/Button/Button";
import { useToast } from "../../hooks/useToast";
import "./HouseManagment.css";

export const HouseManagement: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    inactive: 0,
  });
  const { showError, showSuccess, showWarning } = useToast();

  const loadHouses = async () => {
    try {
      setLoading(true);
      const data = await houseService.getAll(filters);
      setHouses(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar casas";
      showError("Erro ao carregar casas", message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await houseService.getStats();
      setStats(statsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar estatísticas";
      showWarning("Estatísticas indisponíveis", message);
    }
  };

  const filteredHouses = useMemo(() => {
    let filtered = [...houses];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (house) =>
          house.houseName.toLowerCase().includes(searchLower) ||
          house.address.neighborhood.toLowerCase().includes(searchLower) ||
          house.address.city.toLowerCase().includes(searchLower) ||
          house.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((house) => house.status === filters.status);
    }

    if (filters.city) {
      filtered = filtered.filter((house) =>
        house.address.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.state) {
      filtered = filtered.filter((house) =>
        house.address.state.toLowerCase().includes(filters.state!.toLowerCase())
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter((house) => {
        const minPrice = filters.priceRange!.min;
        const maxPrice = filters.priceRange!.max;
        return (
          house.pricing.lowSeason >= minPrice &&
          house.pricing.lowSeason <= maxPrice
        );
      });
    }

    return filtered;
  }, [houses, filters]);

  useEffect(() => {
    loadHouses();
    loadStats();
  }, []);

  useEffect(() => {
    loadHouses();
  }, [filters]);

  const handleCreateHouse = () => {
    setSelectedHouse(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditHouse = (house: House) => {
    setSelectedHouse(house);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewHouse = (house: House) => {
    setSelectedHouse(house);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteHouse = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta casa?")) {
      return;
    }

    try {
      await houseService.delete(id);
      setHouses(houses.filter((house) => house.id !== id));
      loadStats();
      showSuccess("Casa excluída", "A casa foi excluída com sucesso.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir casa";
      showError("Erro ao excluir casa", message);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedHouse(null);
  };

  const handleHouseSaved = (action: "create" | "edit") => {
    loadHouses();
    loadStats();
    handleModalClose();
    showSuccess(
      action === "create" ? "Casa criada" : "Casa atualizada",
      action === "create"
        ? "A casa foi cadastrada com sucesso."
        : "As informações da casa foram atualizadas."
    );
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading && houses.length === 0) {
    return <LoadingSpinner text="Carregando casas..." fullScreen />;
  }

  return (
    <div className="house-management">
      <div className="house-management-header">
        <div className="header-content">
          <h1>Gestão de Casas</h1>
          <Button onClick={handleCreateHouse} className="create-house-btn">
            + Nova Casa
          </Button>
        </div>
      </div>

      <HouseStats stats={stats} />

      <div className="house-management-content">
        <HouseFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          houseCount={filteredHouses.length}
          totalCount={houses.length}
        />
        <HouseList
          houses={filteredHouses}
          loading={loading}
          onEdit={handleEditHouse}
          onView={handleViewHouse}
          onDelete={handleDeleteHouse}
        />
      </div>

      <HouseModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleHouseSaved}
        house={selectedHouse}
        mode={modalMode}
      />
    </div>
  );
};

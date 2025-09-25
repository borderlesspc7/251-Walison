import React, { useState, useEffect, useMemo } from "react";
import type { Client, ClientFilters } from "../../types/client";
import { clientService } from "../../services/clientService";
import { ClientList } from "./components/ClientList";
import { ClientModal } from "./components/ClientModal";
import { ClientFiltersComponent } from "./components/ClientFilters";
import { ClientStats } from "./components/ClientStats";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../components/ui/Button/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage/ErrorMessage";
import "./ClientManagement.css";

export const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [filters, setFilters] = useState<ClientFilters>({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    prospects: 0,
  });

  // Carregar clientes
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getAll(filters);
      setClients(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar clientes"
      );
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const statsData = await clientService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  // Filtrar clientes localmente
  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.includes(searchLower) ||
          client.cpf.includes(searchLower) ||
          client.profession.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((client) => client.status === filters.status);
    }

    if (filters.profession) {
      filtered = filtered.filter((client) =>
        client.profession
          .toLowerCase()
          .includes(filters.profession!.toLowerCase())
      );
    }

    if (filters.maritalStatus) {
      filtered = filtered.filter(
        (client) => client.maritalStatus === filters.maritalStatus
      );
    }

    if (filters.city) {
      filtered = filtered.filter((client) =>
        client.address.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.state) {
      filtered = filtered.filter((client) =>
        client.address.state
          .toLowerCase()
          .includes(filters.state!.toLowerCase())
      );
    }

    return filtered;
  }, [clients, filters]);

  // Efeitos
  useEffect(() => {
    loadClients();
    loadStats();
  }, []); // Intencionalmente sem dependências - carregamento inicial

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadClients();
    }
  }, [filters]); // Intencionalmente sem loadClients nas dependências

  // Handlers
  const handleCreateClient = () => {
    setSelectedClient(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }

    try {
      await clientService.delete(id);
      setClients(clients.filter((client) => client.id !== id));
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir cliente");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  const handleClientSaved = () => {
    loadClients();
    loadStats();
    handleModalClose();
  };

  const handleFiltersChange = (newFilters: ClientFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading && clients.length === 0) {
    return <LoadingSpinner text="Carregando clientes..." fullScreen />;
  }

  return (
    <div className="client-management">
      <div className="client-management-header">
        <div className="header-content">
          <h1>Gestão de Clientes</h1>
          <Button onClick={handleCreateClient} className="create-client-btn">
            + Novo Cliente
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <ClientStats stats={stats} />

      <div className="client-management-content">
        <ClientFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          clientCount={filteredClients.length}
          totalCount={clients.length}
        />

        <ClientList
          clients={filteredClients}
          loading={loading}
          onEdit={handleEditClient}
          onView={handleViewClient}
          onDelete={handleDeleteClient}
        />
      </div>

      <ClientModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleClientSaved}
        client={selectedClient}
        mode={modalMode}
      />
    </div>
  );
};

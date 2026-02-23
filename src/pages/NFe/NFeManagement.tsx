import React, { useState, useEffect } from "react";
import "./NFeManagement.css";
import { nfeService } from "../../services/nfeService";
import type { NFe, NFeFilters } from "../../types/nfe";
import { useToast } from "../../hooks/useToast";
import NFeModal from "./components/NFeModal";
import NFeStats from "./components/NFeStats";
import NFeList from "./components/NFeList";

const NFeManagement: React.FC = () => {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [filteredNfes, setFilteredNfes] = useState<NFe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNfe, setSelectedNfe] = useState<NFe | null>(null);
  const [filters, setFilters] = useState<NFeFilters>({});
  const { showSuccess, showError } = useToast();

  // Carregar NFes ao montar componente
  useEffect(() => {
    loadNFes();
  }, []);

  // Aplicar filtros quando mudar
  useEffect(() => {
    applyFilters();
  }, [nfes, filters]);

  const loadNFes = async () => {
    setLoading(true);
    try {
      const data = await nfeService.getNFes();
      setNfes(data);
    } catch (error) {
      showError("Erro ao Carregar", "Erro ao carregar NFes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...nfes];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (nfe) =>
          nfe.code.toLowerCase().includes(searchLower) ||
          nfe.clientName.toLowerCase().includes(searchLower) ||
          nfe.houseName.toLowerCase().includes(searchLower)
      );
    }

    if (filters.company && filters.company !== "all") {
      filtered = filtered.filter((nfe) => nfe.company === filters.company);
    }

    if (filters.status) {
      filtered = filtered.filter((nfe) => nfe.status === filters.status);
    }

    setFilteredNfes(filtered);
  };

  const handleIssueNFe = async (nfeId: string) => {
    try {
      setLoading(true);
      const response = await nfeService.issueNFe(nfeId);
      if (response.success) {
        showSuccess("Sucesso", "NF-e emitida com sucesso!");
        await loadNFes();
      } else {
        showError("Erro na Emissão", "Erro na emissão: " + response.error);
      }
    } catch (error) {
      showError("Erro ao Emitir", "Erro ao emitir NF-e: " + String(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNFe = async (nfeId: string, reason: string) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta NF-e?")) {
      return;
    }

    try {
      setLoading(true);
      await nfeService.cancelNFe(nfeId, reason);
      showSuccess("Sucesso", "NF-e cancelada com sucesso!");
      await loadNFes();
    } catch (error) {
      showError("Erro ao Cancelar", "Erro ao cancelar NF-e: " + String(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (nfe: NFe) => {
    setSelectedNfe(nfe);
    setShowModal(true);
  };

  return (
    <div className="nfe-container">
      {/* Header */}
      <div className="nfe-header">
        <h1 className="nfe-header-title">Gestão de Notas Fiscais (NFe)</h1>
        <p className="nfe-header-subtitle">
          Emita, controle e acompanhe notas fiscais eletrônicas
        </p>
      </div>

      {/* Estatísticas */}
      {!loading && <NFeStats nfes={nfes} />}

      {/* Filtros */}
      <div className="nfe-filters">
        <input
          type="text"
          placeholder="Buscar por código, cliente ou casa..."
          value={filters.search || ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <select
          value={filters.company || "all"}
          onChange={(e) =>
            setFilters({
              ...filters,
              company: e.target.value as any,
            })
          }
        >
          <option value="all">Todas as Empresas</option>
          <option value="exclusive">Exclusive Imóveis</option>
          <option value="giogio">Gio Gio Temporadas</option>
          <option value="direta">Venda Direta</option>
        </select>

        <select
          value={filters.status || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: (e.target.value as any) || undefined,
            })
          }
        >
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="processing">Processando</option>
          <option value="authorized">Autorizada</option>
          <option value="cancelled">Cancelada</option>
          <option value="rejected">Rejeitada</option>
          <option value="error">Erro</option>
        </select>
      </div>

      {/* Lista de NFes */}
      {loading ? (
        <div className="nfe-loading">Carregando...</div>
      ) : filteredNfes.length === 0 ? (
        <div className="nfe-empty">
          Nenhuma NF-e encontrada. Crie uma nova NF-e através do módulo de
          Vendas.
        </div>
      ) : (
        <NFeList
          nfes={filteredNfes}
          onViewDetails={handleViewDetails}
          onIssueNFe={handleIssueNFe}
          onCancelNFe={handleCancelNFe}
          loading={loading}
        />
      )}

      {/* Modal de Detalhes */}
      {showModal && selectedNfe && (
        <NFeModal
          nfe={selectedNfe}
          onClose={() => {
            setShowModal(false);
            setSelectedNfe(null);
          }}
          onIssueNFe={handleIssueNFe}
        />
      )}
    </div>
  );
};

export default NFeManagement;

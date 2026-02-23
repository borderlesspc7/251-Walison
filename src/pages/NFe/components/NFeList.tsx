import React from "react";
import type { NFe } from "../../../types/nfe";

interface NFeListProps {
  nfes: NFe[];
  onViewDetails: (nfe: NFe) => void;
  onIssueNFe: (nfeId: string) => void;
  onCancelNFe: (nfeId: string, reason: string) => void;
  loading: boolean;
}

const NFeList: React.FC<NFeListProps> = ({
  nfes,
  onViewDetails,
  onIssueNFe,
  onCancelNFe,
  loading,
}) => {
  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      pending: "Pendente",
      processing: "Processando",
      authorized: "Autorizada",
      cancelled: "Cancelada",
      rejected: "Rejeitada",
      error: "Erro",
    };
    return statusLabels[status] || status;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const handleDownloadPDF = (nfe: NFe) => {
    if (nfe.pdfUrl) {
      window.open(nfe.pdfUrl, "_blank");
    } else {
      alert("DANFE ainda não está disponível para esta NF-e");
    }
  };

  const handleDownloadXML = (nfe: NFe) => {
    if (nfe.xmlContent) {
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/xml;charset=utf-8," + encodeURIComponent(nfe.xmlContent)
      );
      element.setAttribute("download", `${nfe.code}.xml`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      alert("XML ainda não está disponível para esta NF-e");
    }
  };

  return (
    <div className="nfe-table">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Casa</th>
            <th>Data Emissão</th>
            <th>Valor Total</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {nfes.map((nfe) => (
            <tr key={nfe.id}>
              <td>
                <strong>{nfe.code}</strong>
                {nfe.nfeNumber && <div>NF-e: {nfe.nfeNumber}</div>}
              </td>
              <td>{nfe.clientName}</td>
              <td>{nfe.houseName}</td>
              <td>{formatDate(nfe.issueDate)}</td>
              <td className="text-right">
                <strong>{formatCurrency(nfe.totalValue)}</strong>
              </td>
              <td>
                <span className={`nfe-status ${nfe.status}`}>
                  {getStatusLabel(nfe.status)}
                </span>
              </td>
              <td>
                <div className="nfe-actions-cell">
                  <button
                    className="view"
                    onClick={() => onViewDetails(nfe)}
                    title="Ver detalhes"
                  >
                    Ver
                  </button>

                  {nfe.status === "pending" && (
                    <button
                      className="issue"
                      onClick={() => onIssueNFe(nfe.id)}
                      disabled={loading}
                      title="Emitir NF-e"
                    >
                      Emitir
                    </button>
                  )}

                  {(nfe.status === "authorized" ||
                    nfe.status === "processing") && (
                    <>
                      <button
                        className="download"
                        onClick={() => handleDownloadPDF(nfe)}
                        title="Baixar DANFE"
                      >
                        DANFE
                      </button>
                      <button
                        className="download"
                        onClick={() => handleDownloadXML(nfe)}
                        title="Baixar XML"
                      >
                        XML
                      </button>
                    </>
                  )}

                  {nfe.status !== "cancelled" &&
                    nfe.status !== "rejected" &&
                    nfe.status !== "error" && (
                      <button
                        className="cancel"
                        onClick={() => {
                          const reason = prompt("Motivo do cancelamento:");
                          if (reason) {
                            onCancelNFe(nfe.id, reason);
                          }
                        }}
                        disabled={loading}
                        title="Cancelar NF-e"
                      >
                        Cancelar
                      </button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NFeList;

import React, { useState } from "react";
import type { NFe } from "../../../types/nfe";

interface NFeModalProps {
  nfe: NFe;
  onClose: () => void;
  onIssueNFe: (nfeId: string) => void;
}

const NFeModal: React.FC<NFeModalProps> = ({ nfe, onClose, onIssueNFe }) => {
  const [isIssuing, setIsIssuing] = useState(false);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const handleIssue = async () => {
    setIsIssuing(true);
    try {
      await onIssueNFe(nfe.id);
      // Fechar modal após emissão bem-sucedida
      setTimeout(onClose, 1500);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleDownloadXML = () => {
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
    }
  };

  const handleDownloadPDF = () => {
    if (nfe.pdfUrl) {
      window.open(nfe.pdfUrl, "_blank");
    }
  };

  return (
    <div className="nfe-modal" onClick={onClose}>
      <div className="nfe-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="nfe-modal-header">
          <h2 className="nfe-modal-title">Detalhes da NF-e</h2>
          <button className="nfe-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="nfe-modal-body">
          {/* Informações Básicas */}
          <div className="nfe-form-group">
            <h3 style={{ marginTop: 0 }}>Informações da NF-e</h3>
            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Código</label>
                <div>{nfe.code}</div>
              </div>
              <div>
                <label className="nfe-form-label">Status</label>
                <div>
                  <span className={`nfe-status ${nfe.status}`}>
                    {getStatusLabel(nfe.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Data de Emissão</label>
                <div>{formatDate(nfe.issueDate)}</div>
              </div>
              <div>
                <label className="nfe-form-label">Número NF-e</label>
                <div>{nfe.nfeNumber || "—"}</div>
              </div>
            </div>

            {nfe.nfeKey && (
              <div>
                <label className="nfe-form-label">Chave de Acesso</label>
                <div style={{ fontSize: "0.875rem", wordBreak: "break-all" }}>
                  {nfe.nfeKey}
                </div>
              </div>
            )}
          </div>

          {/* Informações do Cliente */}
          <div className="nfe-form-group">
            <h3>Cliente</h3>
            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Nome</label>
                <div>{nfe.clientName}</div>
              </div>
              <div>
                <label className="nfe-form-label">CPF</label>
                <div>{nfe.clientCpf}</div>
              </div>
            </div>

            {nfe.clientEmail && (
              <div>
                <label className="nfe-form-label">Email</label>
                <div>{nfe.clientEmail}</div>
              </div>
            )}
          </div>

          {/* Informações da Venda */}
          <div className="nfe-form-group">
            <h3>Venda/Contrato</h3>
            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Código Venda</label>
                <div>{nfe.saleCode}</div>
              </div>
              <div>
                <label className="nfe-form-label">Casa</label>
                <div>{nfe.houseName}</div>
              </div>
            </div>

            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Check-in</label>
                <div>
                  {new Date(nfe.checkInDate).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div>
                <label className="nfe-form-label">Check-out</label>
                <div>
                  {new Date(nfe.checkOutDate).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </div>

            <div>
              <label className="nfe-form-label">Noites</label>
              <div>{nfe.numberOfNights}</div>
            </div>
          </div>

          {/* Valores */}
          <div className="nfe-form-group">
            <h3>Valores</h3>
            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Diárias</label>
                <div>{formatCurrency(nfe.dailyRateValue)}</div>
              </div>
              <div>
                <label className="nfe-form-label">Concierge</label>
                <div>{formatCurrency(nfe.conciergeValue)}</div>
              </div>
            </div>

            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Serviços Adicionais</label>
                <div>{formatCurrency(nfe.additionalServicesValue)}</div>
              </div>
              <div>
                <label className="nfe-form-label">Descontos</label>
                <div>-{formatCurrency(nfe.discountValue)}</div>
              </div>
            </div>

            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Subtotal</label>
                <div style={{ fontSize: "1.1em", fontWeight: "600" }}>
                  {formatCurrency(nfe.subtotal)}
                </div>
              </div>
              <div>
                <label className="nfe-form-label">Impostos</label>
                <div style={{ fontSize: "1.1em", fontWeight: "600" }}>
                  {formatCurrency(nfe.taxValue)}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#f0f0f0",
                padding: "1rem",
                borderRadius: "0.5rem",
                marginTop: "1rem",
              }}
            >
              <label className="nfe-form-label">TOTAL</label>
              <div style={{ fontSize: "1.5em", fontWeight: "700", color: "#007bff" }}>
                {formatCurrency(nfe.totalValue)}
              </div>
            </div>
          </div>

          {/* Empresa */}
          <div className="nfe-form-group">
            <h3>Empresa Emitente</h3>
            <div className="nfe-form-row">
              <div>
                <label className="nfe-form-label">Razão Social</label>
                <div>{nfe.companyName}</div>
              </div>
              <div>
                <label className="nfe-form-label">CNPJ</label>
                <div>{nfe.companyCnpj}</div>
              </div>
            </div>
          </div>

          {/* Erros (se houver) */}
          {nfe.emissionError && (
            <div className="nfe-error-message">
              <strong>Erro na Emissão:</strong> {nfe.emissionError}
              {nfe.failureAttempts > 0 && (
                <div style={{ fontSize: "0.9em", marginTop: "0.5rem" }}>
                  Tentativas falhas: {nfe.failureAttempts}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="nfe-modal-footer">
          {nfe.status === "pending" && (
            <button
              className="primary"
              onClick={handleIssue}
              disabled={isIssuing}
            >
              {isIssuing ? "Emitindo..." : "Emitir NF-e"}
            </button>
          )}

          {nfe.status === "authorized" && (
            <>
              {nfe.xmlContent && (
                <button className="primary" onClick={handleDownloadXML}>
                  Baixar XML
                </button>
              )}
              {nfe.pdfUrl && (
                <button className="primary" onClick={handleDownloadPDF}>
                  Baixar DANFE (PDF)
                </button>
              )}
            </>
          )}

          <button className="secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFeModal;

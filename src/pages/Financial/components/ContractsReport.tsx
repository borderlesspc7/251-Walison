import React from "react";
import "./ContractsReport.css";
import { FiCheckCircle, FiFlag, FiClock, FiXCircle } from "react-icons/fi";
import type { ContractsReport as ContractsReportType } from "../../../types/financial";

interface ContractsReportProps {
  data: ContractsReportType;
}

const ContractsReport: React.FC<ContractsReportProps> = ({ data }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalContracts =
    data.active.count + data.completed.count + data.pending.count;
  const totalRevenue =
    data.active.totalRevenue +
    data.completed.totalRevenue +
    data.pending.totalRevenue;

  return (
    <div className="contracts-report">
      <h2>Relatório de Contratos</h2>
      <p className="report-subtitle">
        Análise de contratos ativos, concluídos, pendentes e cancelados
      </p>

      {/* Cards de Status */}
      <div className="contracts-grid">
        {/* Ativos */}
        <div className="contract-card active">
          <div className="card-header">
            <span className="card-icon">
              <FiCheckCircle size={28} />
            </span>
            <h3>Ativos/Confirmados</h3>
          </div>
          <div className="card-body">
            <div className="metric">
              <span className="metric-label">Quantidade</span>
              <span className="metric-value">{data.active.count}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Receita Total</span>
              <span className="metric-value">
                {formatCurrency(data.active.totalRevenue)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Ticket Médio</span>
              <span className="metric-value">
                {formatCurrency(data.active.averageValue)}
              </span>
            </div>
          </div>
          <div className="card-footer">
            <div className="percentage-bar">
              <div
                className="percentage-fill active-fill"
                style={{
                  width: `${
                    totalContracts > 0
                      ? (data.active.count / totalContracts) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <span className="percentage-text">
              {totalContracts > 0
                ? ((data.active.count / totalContracts) * 100).toFixed(1)
                : 0}
              % do total
            </span>
          </div>
        </div>

        {/* Concluídos */}
        <div className="contract-card completed">
          <div className="card-header">
            <span className="card-icon">
              <FiFlag size={28} />
            </span>
            <h3>Concluídos</h3>
          </div>
          <div className="card-body">
            <div className="metric">
              <span className="metric-label">Quantidade</span>
              <span className="metric-value">{data.completed.count}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Receita Total</span>
              <span className="metric-value">
                {formatCurrency(data.completed.totalRevenue)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Ticket Médio</span>
              <span className="metric-value">
                {formatCurrency(data.completed.averageValue)}
              </span>
            </div>
          </div>
          <div className="card-footer">
            <div className="percentage-bar">
              <div
                className="percentage-fill completed-fill"
                style={{
                  width: `${
                    totalContracts > 0
                      ? (data.completed.count / totalContracts) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <span className="percentage-text">
              {totalContracts > 0
                ? ((data.completed.count / totalContracts) * 100).toFixed(1)
                : 0}
              % do total
            </span>
          </div>
        </div>

        {/* Pendentes */}
        <div className="contract-card pending">
          <div className="card-header">
            <span className="card-icon">
              <FiClock size={28} />
            </span>
            <h3>Pendentes</h3>
          </div>
          <div className="card-body">
            <div className="metric">
              <span className="metric-label">Quantidade</span>
              <span className="metric-value">{data.pending.count}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Receita Potencial</span>
              <span className="metric-value">
                {formatCurrency(data.pending.totalRevenue)}
              </span>
            </div>
          </div>
          <div className="card-footer">
            <div className="percentage-bar">
              <div
                className="percentage-fill pending-fill"
                style={{
                  width: `${
                    totalContracts > 0
                      ? (data.pending.count / totalContracts) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <span className="percentage-text">
              {totalContracts > 0
                ? ((data.pending.count / totalContracts) * 100).toFixed(1)
                : 0}
              % do total
            </span>
          </div>
        </div>

        {/* Cancelados */}
        <div className="contract-card cancelled">
          <div className="card-header">
            <span className="card-icon">
              <FiXCircle size={28} />
            </span>
            <h3>Cancelados</h3>
          </div>
          <div className="card-body">
            <div className="metric">
              <span className="metric-label">Quantidade</span>
              <span className="metric-value">{data.cancelled.count}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Receita Perdida</span>
              <span className="metric-value">
                {formatCurrency(data.cancelled.lostRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="contracts-summary">
        <h3>Resumo Geral</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total de Contratos</span>
            <span className="summary-value">{totalContracts}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Receita Total (Efetiva)</span>
            <span className="summary-value">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Taxa de Cancelamento</span>
            <span className="summary-value">
              {totalContracts + data.cancelled.count > 0
                ? (
                    (data.cancelled.count /
                      (totalContracts + data.cancelled.count)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Taxa de Conclusão</span>
            <span className="summary-value">
              {totalContracts > 0
                ? ((data.completed.count / totalContracts) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsReport;

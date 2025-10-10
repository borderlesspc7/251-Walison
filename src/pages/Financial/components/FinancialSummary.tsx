import React from "react";
import "./FinancialSummary.css";
import {
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
  FiPieChart,
  FiHome,
  FiBell,
  FiUsers,
} from "react-icons/fi";
import type { FinancialSummary as FinancialSummaryType } from "../../../types/financial";

interface FinancialSummaryProps {
  data: FinancialSummaryType;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ data }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="financial-summary">
      <h2>Resumo Financeiro</h2>

      <div className="summary-cards">
        {/* Card Principal - Receita Total */}
        <div className="summary-card main-card">
          <div className="card-icon">
            <FiDollarSign size={40} style={{ color: "#667eea" }} />
          </div>
          <div className="card-content">
            <h3>Receita Total</h3>
            <p className="card-value">{formatCurrency(data.totalRevenue)}</p>
          </div>
        </div>

        {/* Card - Despesas */}
        <div className="summary-card expense-card">
          <div className="card-icon">
            <FiTrendingDown size={40} style={{ color: "#667eea" }} />
          </div>
          <div className="card-content">
            <h3>Despesas Totais</h3>
            <p className="card-value">{formatCurrency(data.totalExpenses)}</p>
          </div>
        </div>

        {/* Card - Lucro Líquido */}
        <div className="summary-card profit-card">
          <div className="card-icon">
            <FiTrendingUp size={40} style={{ color: "#667eea" }} />
          </div>
          <div className="card-content">
            <h3>Lucro Líquido</h3>
            <p className="card-value profit">
              {formatCurrency(data.netProfit)}
            </p>
          </div>
        </div>

        {/* Card - Margem de Lucro */}
        <div className="summary-card margin-card">
          <div className="card-icon">
            <FiPieChart size={40} style={{ color: "#667eea" }} />
          </div>
          <div className="card-content">
            <h3>Margem de Lucro</h3>
            <p className="card-value">{formatPercentage(data.profitMargin)}</p>
          </div>
        </div>
      </div>

      {/* Breakdown de Receitas */}
      <div className="revenue-breakdown">
        <h3>Breakdown de Receitas (Três Fontes)</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon">
                <FiHome size={28} style={{ color: "#667eea" }} />
              </span>
              <h4>Diárias</h4>
            </div>
            <p className="breakdown-value">
              {formatCurrency(data.dailyRatesRevenue)}
            </p>
            <p className="breakdown-percentage">
              {((data.dailyRatesRevenue / data.totalRevenue) * 100).toFixed(1)}%
              do total
            </p>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon">
                <FiBell size={28} />
              </span>
              <h4>Concierge</h4>
            </div>
            <p className="breakdown-value">
              {formatCurrency(data.conciergeRevenue)}
            </p>
            <p className="breakdown-percentage">
              {((data.conciergeRevenue / data.totalRevenue) * 100).toFixed(1)}%
              do total
            </p>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-icon">
                <FiUsers size={28} />
              </span>
              <h4>Comissões Fornecedores</h4>
            </div>
            <p className="breakdown-value">
              {formatCurrency(data.suppliersCommissionRevenue)}
            </p>
            <p className="breakdown-percentage">
              {(
                (data.suppliersCommissionRevenue / data.totalRevenue) *
                100
              ).toFixed(1)}
              % do total
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Adicionais */}
      <div className="additional-metrics">
        <div className="metric-item">
          <span className="metric-label">Número de Vendas</span>
          <span className="metric-value">{data.numberOfSales}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Ticket Médio</span>
          <span className="metric-value">
            {formatCurrency(data.averageTicket)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;

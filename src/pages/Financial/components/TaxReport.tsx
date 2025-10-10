import React from "react";
import "./TaxReport.css";
import {
  FiDollarSign,
  FiFileText,
  FiPieChart,
  FiAlertCircle,
} from "react-icons/fi";
import type { TaxReport as TaxReportType } from "../../../types/financial";

interface TaxReportProps {
  data: TaxReportType[];
}

const TaxReport: React.FC<TaxReportProps> = ({ data }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const totalGrossRevenue = data.reduce(
    (sum, item) => sum + item.grossRevenue,
    0
  );
  const totalTaxAmount = data.reduce((sum, item) => sum + item.taxAmount, 0);
  const totalNetRevenue = data.reduce((sum, item) => sum + item.netRevenue, 0);

  return (
    <div className="tax-report">
      <h2>
        <FiDollarSign
          size={28}
          style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
        />
        Relatório de Impostos por Empresa
      </h2>
      <p className="report-subtitle">
        Análise de impostos pagos e receita líquida por empresa
      </p>

      {/* Cards por Empresa */}
      <div className="companies-grid">
        {data.map((company, index) => (
          <div key={index} className="company-card">
            <div className="company-header">
              <h3>{company.companyName}</h3>
              <span className="company-period">{company.period}</span>
            </div>

            <div className="company-metrics">
              <div className="metric-row">
                <span className="metric-label">Receita Bruta</span>
                <span className="metric-value gross">
                  {formatCurrency(company.grossRevenue)}
                </span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Receita Tributável</span>
                <span className="metric-value">
                  {formatCurrency(company.taxableRevenue)}
                </span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Alíquota</span>
                <span className="metric-value tax-rate">
                  {formatPercentage(company.taxRate)}
                </span>
              </div>

              <div className="metric-row highlight">
                <span className="metric-label">Valor do Imposto</span>
                <span className="metric-value tax">
                  {formatCurrency(company.taxAmount)}
                </span>
              </div>

              <div className="metric-row highlight">
                <span className="metric-label">Receita Líquida</span>
                <span className="metric-value net">
                  {formatCurrency(company.netRevenue)}
                </span>
              </div>
            </div>

            {/* Barra Visual de Imposto */}
            <div className="tax-visualization">
              <div className="tax-bar">
                <div
                  className="tax-portion"
                  style={{
                    width: `${
                      (company.taxAmount / company.grossRevenue) * 100
                    }%`,
                  }}
                  title={`Imposto: ${formatPercentage(
                    (company.taxAmount / company.grossRevenue) * 100
                  )}`}
                ></div>
                <div
                  className="net-portion"
                  style={{
                    width: `${
                      (company.netRevenue / company.grossRevenue) * 100
                    }%`,
                  }}
                  title={`Líquido: ${formatPercentage(
                    (company.netRevenue / company.grossRevenue) * 100
                  )}`}
                ></div>
              </div>
              <div className="tax-legend">
                <span className="legend-item">
                  <span className="legend-color tax-color"></span>
                  Imposto
                </span>
                <span className="legend-item">
                  <span className="legend-color net-color"></span>
                  Líquido
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo Total */}
      <div className="tax-summary">
        <h3>Resumo Consolidado</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign size={32} />
            </div>
            <div className="summary-content">
              <span className="summary-label">Receita Bruta Total</span>
              <span className="summary-value">
                {formatCurrency(totalGrossRevenue)}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <FiFileText size={32} />
            </div>
            <div className="summary-content">
              <span className="summary-label">Total de Impostos Pagos</span>
              <span className="summary-value tax">
                {formatCurrency(totalTaxAmount)}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign size={32} />
            </div>
            <div className="summary-content">
              <span className="summary-label">Receita Líquida Total</span>
              <span className="summary-value net">
                {formatCurrency(totalNetRevenue)}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <FiPieChart size={32} />
            </div>
            <div className="summary-content">
              <span className="summary-label">Carga Tributária Média</span>
              <span className="summary-value">
                {formatPercentage(
                  totalGrossRevenue > 0
                    ? (totalTaxAmount / totalGrossRevenue) * 100
                    : 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="tax-notes">
        <h4>
          <FiAlertCircle
            size={20}
            style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
          />
          Observações
        </h4>
        <ul>
          <li>
            Os valores de impostos são calculados com base na alíquota
            configurada para cada empresa
          </li>
          <li>
            A alíquota padrão é de 6% (Simples Nacional), mas pode ser ajustada
            no código conforme necessário
          </li>
          <li>Valores consideram apenas vendas não canceladas no período</li>
          <li>
            Para relatórios fiscais oficiais, consulte sempre um contador
            certificado
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TaxReport;

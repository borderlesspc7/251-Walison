import React from "react";
import "./DemographicReport.css";
import {
  FiHome,
  FiUsers,
  FiMapPin,
  FiTarget,
  FiAward,
  FiBarChart2,
  FiDollarSign,
} from "react-icons/fi";
import type { DemographicReport as DemographicReportType } from "../../../types/financial";

interface DemographicReportProps {
  data: DemographicReportType[];
  type: "house" | "gender" | "location" | "origin";
}

const DemographicReport: React.FC<DemographicReportProps> = ({
  data,
  type,
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTypeLabel = (): string => {
    const labels = {
      house: "Casa",
      gender: "Gênero",
      location: "Localidade",
      origin: "Origem da Venda",
    };
    return labels[type];
  };

  const getTypeIcon = () => {
    const icons = {
      house: <FiHome size={24} />,
      gender: <FiUsers size={24} />,
      location: <FiMapPin size={24} />,
      origin: <FiTarget size={24} />,
    };
    return icons[type];
  };

  if (data.length === 0) {
    return (
      <div className="demographic-report">
        <h2>Análise Demográfica - {getTypeLabel()}</h2>
        <div className="no-data">
          <p>Nenhum dado encontrado para o período selecionado.</p>
        </div>
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalSales = data.reduce((sum, item) => sum + item.numberOfSales, 0);

  return (
    <div className="demographic-report">
      <div className="report-header">
        <div>
          <h2>
            {getTypeIcon()} Análise Demográfica - {getTypeLabel()}
          </h2>
          <p className="report-subtitle">
            Vendas e receitas segmentadas por {getTypeLabel().toLowerCase()}
          </p>
        </div>
        <div className="totals-card">
          <div className="total-item">
            <span className="total-label">Total de Vendas</span>
            <span className="total-value">{totalSales}</span>
          </div>
          <div className="total-item">
            <span className="total-label">Receita Total</span>
            <span className="total-value">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="demographic-table">
          <thead>
            <tr>
              <th>{getTypeLabel()}</th>
              <th>Nº de Vendas</th>
              <th>Receita Total</th>
              <th>% do Total</th>
              <th>Ticket Médio</th>
              <th>Participação</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>
                  <strong>{item.value}</strong>
                </td>
                <td className="text-center">{item.numberOfSales}</td>
                <td className="text-right revenue">
                  {formatCurrency(item.totalRevenue)}
                </td>
                <td className="text-center percentage">
                  {item.percentage.toFixed(1)}%
                </td>
                <td className="text-right">
                  {formatCurrency(item.averageTicket)}
                </td>
                <td>
                  <div className="participation-bar">
                    <div
                      className="participation-fill"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards de Destaque */}
      <div className="highlights">
        <h3>Destaques</h3>
        <div className="highlights-grid">
          {/* Maior Receita */}
          {data.length > 0 && (
            <div className="highlight-card top-revenue">
              <div className="highlight-icon">
                <FiAward size={40} />
              </div>
              <div className="highlight-content">
                <span className="highlight-label">Maior Receita</span>
                <span className="highlight-title">{data[0].value}</span>
                <span className="highlight-value">
                  {formatCurrency(data[0].totalRevenue)}
                </span>
              </div>
            </div>
          )}

          {/* Maior Volume */}
          {data.length > 0 && (
            <div className="highlight-card top-volume">
              <div className="highlight-icon">
                <FiBarChart2 size={40} />
              </div>
              <div className="highlight-content">
                <span className="highlight-label">Maior Volume</span>
                <span className="highlight-title">
                  {
                    [...data].sort(
                      (a, b) => b.numberOfSales - a.numberOfSales
                    )[0].value
                  }
                </span>
                <span className="highlight-value">
                  {
                    [...data].sort(
                      (a, b) => b.numberOfSales - a.numberOfSales
                    )[0].numberOfSales
                  }{" "}
                  vendas
                </span>
              </div>
            </div>
          )}

          {/* Maior Ticket Médio */}
          {data.length > 0 && (
            <div className="highlight-card top-ticket">
              <div className="highlight-icon">
                <FiDollarSign size={40} />
              </div>
              <div className="highlight-content">
                <span className="highlight-label">Maior Ticket Médio</span>
                <span className="highlight-title">
                  {
                    [...data].sort(
                      (a, b) => b.averageTicket - a.averageTicket
                    )[0].value
                  }
                </span>
                <span className="highlight-value">
                  {formatCurrency(
                    [...data].sort(
                      (a, b) => b.averageTicket - a.averageTicket
                    )[0].averageTicket
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemographicReport;

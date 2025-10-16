import React from "react";
import "./TopIndicators.css";
import {
  FiCheckCircle,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
} from "react-icons/fi";
import type { TopIndicators as TopIndicatorsType } from "../../../types/dashboardConsolidation";

export interface TopIndicatorsProps {
  data: TopIndicatorsType;
  loading?: boolean;
}

const TopIndicators: React.FC<TopIndicatorsProps> = ({
  data,
  loading = false,
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Formatar porcentagem
  const formatPercentage = (value: number): string => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  // Obter ícone de tendência
  const getTrendIcon = (variation: number) => {
    if (variation > 0) return <FiTrendingUp size={16} className="trend-up" />;
    if (variation < 0)
      return <FiTrendingDown size={16} className="trend-down" />;
    return <FiMinus size={16} className="trend-neutral" />;
  };

  // Obter classe CSS para tendência
  const getTrendClass = (variation: number): string => {
    if (variation > 0) return "trend-up";
    if (variation < 0) return "trend-down";
    return "trend-neutral";
  };

  if (loading) {
    return (
      <div className="top-indicator">
        <h2>Indicadores Principais</h2>
        <div className="indicators-grid">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="indicator-card loading">
              <div className="card-skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-value"></div>
                  <div className="skeleton-variation"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="top-indicator">
      <h2>Indicadores Principais</h2>
      <p className="indicators-subtitle">
        Métricas-chave com comparação ao período anterior
      </p>

      <div className="indicators-grid">
        <div className="indicator-card contracts-active">
          <div className="card-header">
            <div className="card-icon">
              <FiCheckCircle size={24} />
            </div>
            <div className="card-trend">
              {getTrendIcon(data.activeContracts.variation)}
              <span
                className={`trend-value ${getTrendClass(
                  data.activeContracts.variation
                )}`}
              >
                {formatPercentage(data.activeContracts.variation)}
              </span>
            </div>
          </div>
          x
          <div className="card-content">
            <h3>Contratos Ativos</h3>
            <p className="card-value"> {data.activeContracts.count}</p>
            <p className="card-description">
              Contratos confirmado e pendente no momento
            </p>
          </div>
        </div>

        <div className="indicator-card future-reservations">
          <div className="card-header">
            <div className="card-icon">
              <FiCalendar size={32} />
            </div>
            <div className="card-trend">
              <span className="trend-value neutral">
                {data.futureReservations.count} reservas
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3>Reservas Futuras</h3>
            <p className="card-value">{data.futureReservations.count}</p>
            <p className="card-description">Próximas reservas agendadas</p>
          </div>
          {data.futureReservations.reservations.length > 0 && (
            <div className="card-details">
              <h4>Próximas Reservas:</h4>
              <div className="reservations-list">
                {data.futureReservations.reservations
                  .slice(0, 3)
                  .map((reservation) => (
                    <div key={reservation.id} className="reservation-item">
                      <div className="reservation-info">
                        <strong>{reservation.clientName}</strong>
                        <span>{reservation.houseName}</span>
                      </div>
                      <div className="reservation-dates">
                        <span>
                          {reservation.checkInDate.toLocaleDateString("pt-BR")}{" "}
                          -{" "}
                          {reservation.checkOutDate.toLocaleDateString("pt-BR")}
                        </span>
                        <span className="reservation-value">
                          {formatCurrency(reservation.contractValue)}
                        </span>
                      </div>
                    </div>
                  ))}
                {data.futureReservations.reservations.length > 3 && (
                  <div className="more-reservations">
                    +{data.futureReservations.reservations.length - 3} mais
                    reservas
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="indicator-card daily-rates-month">
          <div className="card-header">
            <div className="card-icon">
              <FiDollarSign size={32} />
            </div>
            <div className="card-trend">
              {getTrendIcon(data.totalDailyRates.month.variation)}
              <span
                className={`trend-value ${getTrendClass(
                  data.totalDailyRates.month.variation
                )}`}
              >
                {formatPercentage(data.totalDailyRates.month.variation)}
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3>Diárias Fechadas (Mês)</h3>
            <p className="card-value">
              {formatCurrency(data.totalDailyRates.month.value)}
            </p>
            <p className="card-description">Receita de diárias no mês atual</p>
          </div>
        </div>

        {/* Diárias Fechadas - Ano */}
        <div className="indicator-card daily-rates-year">
          <div className="card-header">
            <div className="card-icon">
              <FiDollarSign size={32} />
            </div>
            <div className="card-trend">
              {getTrendIcon(data.totalDailyRates.year.variation)}
              <span
                className={`trend-value ${getTrendClass(
                  data.totalDailyRates.year.variation
                )}`}
              >
                {formatPercentage(data.totalDailyRates.year.variation)}
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3>Diárias Fechadas (Ano)</h3>
            <p className="card-value">
              {formatCurrency(data.totalDailyRates.year.value)}
            </p>
            <p className="card-description">Receita de diárias no ano atual</p>
          </div>
        </div>

        {/* Contratos Fechados - Mês */}
        <div className="indicator-card contracts-month">
          <div className="card-header">
            <div className="card-icon">
              <FiFileText size={32} />
            </div>
            <div className="card-trend">
              {getTrendIcon(data.totalContracts.month.variation)}
              <span
                className={`trend-value ${getTrendClass(
                  data.totalContracts.month.variation
                )}`}
              >
                {formatPercentage(data.totalContracts.month.variation)}
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3>Contratos Fechados (Mês)</h3>
            <p className="card-value">{data.totalContracts.month.count}</p>
            <p className="card-description">
              Contratos concluídos no mês atual
            </p>
          </div>
        </div>

        <div className="indicator-card contracts-year">
          <div className="card-header">
            <div className="card-icon">
              <FiFileText size={32} />
            </div>
            <div className="card-trend">
              {getTrendIcon(data.totalContracts.year.variation)}
              <span
                className={`trend-value ${getTrendClass(
                  data.totalContracts.year.variation
                )}`}
              >
                {formatPercentage(data.totalContracts.year.variation)}
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3>Contratos Fechados (Ano)</h3>
            <p className="card-value">{data.totalContracts.year.count}</p>
            <p className="card-description">
              Contratos concluídos no ano atual
            </p>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="indicator-card average-ticket">
          <div className="card-header">
            <div className="card-icon">
              <FiDollarSign size={32} />
            </div>
            <div className="card-trend">
              <span className="trend-value neutral">Ticket médio</span>
            </div>
          </div>
          <div className="card-content">
            <h3>Ticket Médio</h3>
            <p className="card-value">
              {formatCurrency(data.averageTicket.total)}
            </p>
            <p className="card-description">Valor médio por contrato</p>
          </div>
          <div className="card-details">
            <div className="ticket-breakdown">
              <div className="breakdown-item">
                <span>Por Casa:</span>
                <span>{formatCurrency(data.averageTicket.byHouse)}</span>
              </div>
              <div className="breakdown-item">
                <span>Por Fornecedor:</span>
                <span>{formatCurrency(data.averageTicket.bySupplier)}</span>
              </div>
              <div className="breakdown-item">
                <span>Por Concierge:</span>
                <span>{formatCurrency(data.averageTicket.byConcierge)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopIndicators;

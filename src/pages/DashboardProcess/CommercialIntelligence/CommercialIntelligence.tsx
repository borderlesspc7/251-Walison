import React, { useState } from "react";
import "./CommercialIntelligence.css";
import {
  FiTarget,
  FiUsers,
  FiTrendingUp,
  FiPieChart,
  FiBarChart,
  FiCalendar,
  FiInstagram,
  FiFacebook,
  FiGlobe,
  FiMessageCircle,
  FiUser,
  FiUserCheck,
  FiZap,
  FiActivity,
} from "react-icons/fi";
import type { CommercialIntelligence as CommercialIntelligenceType } from "../../../types/dashboardProcess";

export interface CommercialIntelligenceProps {
  data: CommercialIntelligenceType;
  loading?: boolean;
}

const CommercialIntelligence: React.FC<CommercialIntelligenceProps> = ({
  data,
  loading = false,
}) => {
  const [selectedView, setSelectedView] = useState<
    "media" | "gender" | "occupancy"
  >("media");

  // Formatar porcentagem
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Obter ícone da mídia
  const getMediaIcon = (source: string) => {
    switch (source) {
      case "instagram":
        return <FiInstagram size={20} />;
      case "facebook":
        return <FiFacebook size={20} />;
      case "google":
        return <FiGlobe size={20} />;
      case "indicacao":
        return <FiMessageCircle size={20} />;
      case "whatsapp":
        return <FiMessageCircle size={20} />;
      case "site":
        return <FiGlobe size={20} />;
      case "outros":
        return <FiTarget size={20} />;
      default:
        return <FiTarget size={20} />;
    }
  };

  // Obter cor da mídia
  const getMediaColor = (source: string): string => {
    switch (source) {
      case "instagram":
        return "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)";
      case "facebook":
        return "linear-gradient(135deg, #1877f2, #42a5f5)";
      case "google":
        return "linear-gradient(135deg, #3b82f6, #1d4ed8)";
      case "indicacao":
        return "linear-gradient(135deg, #10b981, #059669)";
      case "whatsapp":
        return "linear-gradient(135deg, #25d366, #128c7e)";
      case "site":
        return "linear-gradient(135deg, #8b5cf6, #7c3aed)";
      case "outros":
        return "linear-gradient(135deg, #f59e0b, #d97706)";
      default:
        return "linear-gradient(135deg, #6b7280, #4b5563)";
    }
  };

  // Obter ícone do gênero
  const getGenderIcon = (gender: string) => {
    return gender === "male" ? <FiUser size={20} /> : <FiUserCheck size={20} />;
  };

  if (loading) {
    return (
      <div className="commercial-intelligence">
        <div className="block-header">
          <h2>
            <FiZap
              size={24}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Bloco de Inteligência Comercial
          </h2>
          <div className="view-selector loading">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
        <div className="intelligence-content">
          <div className="intelligence-cards loading">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="intelligence-card loading">
                <div className="card-skeleton">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-value"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-container loading">
            <div className="skeleton-chart"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="commercial-intelligence">
      <div className="block-header">
        <h2>
          <FiZap
            size={24}
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          />
          Bloco de Inteligência Comercial
        </h2>
        <p className="block-subtitle">
          Análise de vendas por origem, perfil demográfico e ocupação
        </p>
        <div className="view-selector">
          <button
            className={`view-btn ${selectedView === "media" ? "active" : ""}`}
            onClick={() => setSelectedView("media")}
          >
            <FiPieChart size={16} />
            Vendas por Mídia
          </button>
          <button
            className={`view-btn ${selectedView === "gender" ? "active" : ""}`}
            onClick={() => setSelectedView("gender")}
          >
            <FiUsers size={16} />
            Vendas por Gênero
          </button>
          <button
            className={`view-btn ${
              selectedView === "occupancy" ? "active" : ""
            }`}
            onClick={() => setSelectedView("occupancy")}
          >
            <FiTrendingUp size={16} />
            Taxa de Ocupação
          </button>
        </div>
      </div>

      <div className="intelligence-content">
        {/* Cards de Resumo */}
        <div className="intelligence-cards">
          {/* Card de Vendas por Mídia */}
          <div className="intelligence-card media-card">
            <div className="card-header">
              <div className="card-icon">
                <FiTarget size={24} />
              </div>
              <div className="card-info">
                <h3>Vendas por Mídia</h3>
                <p className="card-subtitle">Origem das vendas</p>
              </div>
            </div>
            <div className="card-content">
              <div className="top-media">
                {data.salesByMedia.slice(0, 2).map((media, index) => (
                  <div key={index} className="media-item">
                    <div className="media-info">
                      <div
                        className="media-icon"
                        style={{ background: getMediaColor(media.source) }}
                      >
                        {getMediaIcon(media.source)}
                      </div>
                      <div className="media-details">
                        <span className="media-name">{media.sourceLabel}</span>
                        <span className="media-percentage">
                          {formatPercentage(media.percentage)}
                        </span>
                      </div>
                    </div>
                    <div className="media-bar">
                      <div
                        className="media-progress"
                        style={{
                          width: `${media.percentage}%`,
                          background: getMediaColor(media.source),
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card de Vendas por Gênero */}
          <div className="intelligence-card gender-card">
            <div className="card-header">
              <div className="card-icon">
                <FiUsers size={24} />
              </div>
              <div className="card-info">
                <h3>Vendas por Gênero</h3>
                <p className="card-subtitle">Perfil demográfico</p>
              </div>
            </div>
            <div className="card-content">
              <div className="gender-stats">
                {data.salesByGender.map((gender, index) => (
                  <div key={index} className="gender-item">
                    <div className="gender-icon">
                      {getGenderIcon(gender.gender)}
                    </div>
                    <div className="gender-details">
                      <span className="gender-name">
                        {gender.gender === "male" ? "Masculino" : "Feminino"}
                      </span>
                      <span className="gender-percentage">
                        {formatPercentage(gender.percentage)}
                      </span>
                    </div>
                    <div className="gender-value">
                      {formatCurrency(gender.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card de Taxa de Ocupação */}
          <div className="intelligence-card occupancy-card">
            <div className="card-header">
              <div className="card-icon">
                <FiTrendingUp size={24} />
              </div>
              <div className="card-info">
                <h3>Taxa de Ocupação</h3>
                <p className="card-subtitle">Eficiência operacional</p>
              </div>
            </div>
            <div className="card-content">
              <div className="occupancy-stats">
                <div className="occupancy-average">
                  <span className="average-label">Média Geral:</span>
                  <span className="average-value">
                    {formatPercentage(
                      data.occupancyRate.reduce(
                        (acc, curr) => acc + curr.rate,
                        0
                      ) / data.occupancyRate.length
                    )}
                  </span>
                </div>
                <div className="occupancy-trend">
                  <span className="trend-label">Tendência:</span>
                  <span className="trend-value positive">
                    <FiActivity size={14} />
                    +5.2%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container de Gráficos */}
        <div className="chart-container">
          {/* Gráfico de Vendas por Mídia */}
          {selectedView === "media" && (
            <div className="chart-section">
              <div className="chart-header">
                <h3>
                  <FiPieChart size={20} />
                  Distribuição de Vendas por Mídia
                </h3>
                <div className="chart-info">
                  <span>Baseado no total de vendas do período</span>
                </div>
              </div>
              <div className="chart-content">
                <div className="media-chart">
                  <div className="chart-legend">
                    {data.salesByMedia.map((media, index) => (
                      <div key={index} className="legend-item">
                        <div
                          className="legend-color"
                          style={{ background: getMediaColor(media.source) }}
                        ></div>
                        <div className="legend-info">
                          <span className="legend-name">
                            {media.sourceLabel}
                          </span>
                          <span className="legend-stats">
                            {formatPercentage(media.percentage)} •{" "}
                            {formatCurrency(media.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-visual">
                    <div className="pie-chart">
                      {data.salesByMedia.map((media, index) => {
                        const startAngle = data.salesByMedia
                          .slice(0, index)
                          .reduce(
                            (acc, curr) => acc + curr.percentage * 3.6,
                            0
                          );
                        const endAngle = startAngle + media.percentage * 3.6;
                        return (
                          <div
                            key={index}
                            className="pie-segment"
                            style={{
                              background: `conic-gradient(${getMediaColor(
                                media.source
                              )} ${startAngle}deg ${endAngle}deg)`,
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de Vendas por Gênero */}
          {selectedView === "gender" && (
            <div className="chart-section">
              <div className="chart-header">
                <h3>
                  <FiBarChart size={20} />
                  Vendas por Gênero - Comparativo
                </h3>
                <div className="chart-info">
                  <span>Análise demográfica dos clientes</span>
                </div>
              </div>
              <div className="chart-content">
                <div className="gender-chart">
                  <div className="gender-bars">
                    {data.salesByGender.map((gender, index) => (
                      <div key={index} className="gender-bar-container">
                        <div className="gender-bar-wrapper">
                          <div
                            className="gender-bar"
                            style={{
                              height: `${gender.percentage}%`,
                              background:
                                gender.gender === "male"
                                  ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                                  : "linear-gradient(135deg, #ec4899, #be185d)",
                            }}
                          ></div>
                          <div className="bar-value">
                            {formatPercentage(gender.percentage)}
                          </div>
                        </div>
                        <div className="bar-label">
                          {gender.gender === "male" ? "Masculino" : "Feminino"}
                        </div>
                        <div className="bar-total">
                          {formatCurrency(gender.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de Taxa de Ocupação */}
          {selectedView === "occupancy" && (
            <div className="chart-section">
              <div className="chart-header">
                <h3>
                  <FiCalendar size={20} />
                  Taxa de Ocupação por Mês
                </h3>
                <div className="chart-info">
                  <span>Eficiência de ocupação das casas</span>
                </div>
              </div>
              <div className="chart-content">
                <div className="occupancy-chart">
                  <div className="occupancy-bars">
                    {data.occupancyRate.map((occupancy, index) => (
                      <div key={index} className="occupancy-bar-container">
                        <div className="occupancy-bar-wrapper">
                          <div
                            className="occupancy-bar"
                            style={{
                              height: `${occupancy.rate}%`,
                              background:
                                occupancy.rate >= 80
                                  ? "linear-gradient(135deg, #10b981, #059669)"
                                  : occupancy.rate >= 60
                                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                  : "linear-gradient(135deg, #ef4444, #dc2626)",
                            }}
                          ></div>
                          <div className="bar-value">
                            {formatPercentage(occupancy.rate)}
                          </div>
                        </div>
                        <div className="bar-label">{occupancy.month}</div>
                        <div className="bar-details">
                          <span>{occupancy.occupiedDays} dias ocupados</span>
                          <span>{occupancy.totalDays} dias totais</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommercialIntelligence;

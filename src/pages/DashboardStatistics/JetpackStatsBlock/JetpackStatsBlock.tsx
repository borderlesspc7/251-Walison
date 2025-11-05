import React from "react";
import { FiTrendingUp, FiTrendingDown, FiEye, FiUsers, FiHeart, FiMessageCircle, FiGlobe } from "react-icons/fi";
import type { JetpackStats } from "../../../types/dashboardStatistics";
import "./JetpackStatsBlock.css";

interface JetpackStatsBlockProps {
  data: JetpackStats;
  loading?: boolean;
}

const JetpackStatsBlock: React.FC<JetpackStatsBlockProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="jetpack-stats-block">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatVariation = (variation: number): { value: string; isPositive: boolean } => {
    const isPositive = variation >= 0;
    return {
      value: `${isPositive ? "+" : ""}${variation.toFixed(1)}%`,
      isPositive,
    };
  };

  const viewsVariation = formatVariation(data.views.variation);
  const visitorsVariation = formatVariation(data.visitors.variation);
  const likesVariation = formatVariation(data.likes.variation);
  const commentsVariation = formatVariation(data.comments.variation);

  return (
    <div className="jetpack-stats-block">
      <div className="stats-block-header">
        <div className="stats-block-header-icon">
          <FiGlobe />
        </div>
        <div className="stats-block-header-text">
          <h2 className="stats-block-title">Jetpack Stats - Estatísticas do Site</h2>
          <p className="stats-block-subtitle">Análise de tráfego e engajamento do site</p>
        </div>
      </div>

      <div className="jetpack-stats-grid">
        {/* Visualizações */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon views-icon">
              <FiEye />
            </div>
            <div className="stat-variation">
              {viewsVariation.isPositive ? (
                <FiTrendingUp className="trend-up" />
              ) : (
                <FiTrendingDown className="trend-down" />
              )}
              <span className={viewsVariation.isPositive ? "positive" : "negative"}>
                {viewsVariation.value}
              </span>
            </div>
          </div>
          <div className="stat-value">{formatNumber(data.views.current)}</div>
          <div className="stat-label">Visualizações</div>
          <div className="stat-previous">
            Anterior: {formatNumber(data.views.previous)}
          </div>
        </div>

        {/* Visitantes */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon visitors-icon">
              <FiUsers />
            </div>
            <div className="stat-variation">
              {visitorsVariation.isPositive ? (
                <FiTrendingUp className="trend-up" />
              ) : (
                <FiTrendingDown className="trend-down" />
              )}
              <span className={visitorsVariation.isPositive ? "positive" : "negative"}>
                {visitorsVariation.value}
              </span>
            </div>
          </div>
          <div className="stat-value">{formatNumber(data.visitors.current)}</div>
          <div className="stat-label">Visitantes Únicos</div>
          <div className="stat-previous">
            Anterior: {formatNumber(data.visitors.previous)}
          </div>
        </div>

        {/* Curtidas */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon likes-icon">
              <FiHeart />
            </div>
            <div className="stat-variation">
              {likesVariation.isPositive ? (
                <FiTrendingUp className="trend-up" />
              ) : (
                <FiTrendingDown className="trend-down" />
              )}
              <span className={likesVariation.isPositive ? "positive" : "negative"}>
                {likesVariation.value}
              </span>
            </div>
          </div>
          <div className="stat-value">{formatNumber(data.likes.current)}</div>
          <div className="stat-label">Curtidas</div>
          <div className="stat-previous">
            Anterior: {formatNumber(data.likes.previous)}
          </div>
        </div>

        {/* Comentários */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon comments-icon">
              <FiMessageCircle />
            </div>
            <div className="stat-variation">
              {commentsVariation.isPositive ? (
                <FiTrendingUp className="trend-up" />
              ) : (
                <FiTrendingDown className="trend-down" />
              )}
              <span className={commentsVariation.isPositive ? "positive" : "negative"}>
                {commentsVariation.value}
              </span>
            </div>
          </div>
          <div className="stat-value">{formatNumber(data.comments.current)}</div>
          <div className="stat-label">Comentários</div>
          <div className="stat-previous">
            Anterior: {formatNumber(data.comments.previous)}
          </div>
        </div>
      </div>

      {/* Páginas Mais Visitadas */}
      <div className="stats-section">
        <h3 className="stats-section-title">Páginas Mais Visitadas</h3>
        <div className="top-list">
          {data.topPages.map((page, index) => (
            <div key={index} className="top-list-item">
              <div className="top-list-rank">{index + 1}</div>
              <div className="top-list-content">
                <div className="top-list-name">{page.page}</div>
                <div className="top-list-url">{page.url}</div>
              </div>
              <div className="top-list-value">{formatNumber(page.views)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Principais Referrers */}
      <div className="stats-section">
        <h3 className="stats-section-title">Principais Fontes de Tráfego</h3>
        <div className="top-list">
          {data.topReferrers.map((referrer, index) => (
            <div key={index} className="top-list-item">
              <div className="top-list-rank">{index + 1}</div>
              <div className="top-list-content">
                <div className="top-list-name">{referrer.referrer}</div>
              </div>
              <div className="top-list-value">{formatNumber(referrer.views)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JetpackStatsBlock;


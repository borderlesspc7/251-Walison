import React from "react";
import { FiTrendingUp, FiTrendingDown, FiEye, FiUsers, FiDollarSign, FiTarget, FiBarChart2 } from "react-icons/fi";
import type { InstagramStats } from "../../../types/dashboardStatistics";
import "./InstagramStatsBlock.css";

interface InstagramStatsBlockProps {
  data: InstagramStats;
  loading?: boolean;
}

const InstagramStatsBlock: React.FC<InstagramStatsBlockProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="instagram-stats-block">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatVariation = (variation: number): { value: string; isPositive: boolean } => {
    const isPositive = variation >= 0;
    return {
      value: `${isPositive ? "+" : ""}${variation.toFixed(1)}%`,
      isPositive,
    };
  };

  const viewsVariation = formatVariation(data.views.variation);
  const followersVariation = formatVariation(data.followers.variation);

  return (
    <div className="instagram-stats-block">
      <div className="stats-block-header">
        <div className="stats-block-header-icon instagram-icon">
          <FiBarChart2 />
        </div>
        <div className="stats-block-header-text">
          <h2 className="stats-block-title">Instagram - Estatísticas e Tráfego Pago</h2>
          <p className="stats-block-subtitle">Análise de performance e investimento em tráfego pago</p>
        </div>
      </div>

      {/* Visualizações */}
      <div className="stats-section">
        <h3 className="stats-section-title">Visualizações</h3>
        <div className="stat-card-large">
          <div className="stat-card-large-header">
            <div className="stat-icon-large views-icon">
              <FiEye />
            </div>
            <div className="stat-card-large-info">
              <div className="stat-value-large">{formatNumber(data.views.current)}</div>
              <div className="stat-label-large">Visualizações no Mês</div>
              <div className="stat-variation-large">
                {viewsVariation.isPositive ? (
                  <FiTrendingUp className="trend-up" />
                ) : (
                  <FiTrendingDown className="trend-down" />
                )}
                <span className={viewsVariation.isPositive ? "positive" : "negative"}>
                  {viewsVariation.value} vs. mês anterior
                </span>
              </div>
            </div>
          </div>
          <div className="stat-card-large-details">
            <div className="stat-detail-item">
              <span className="stat-detail-label">Visualizações de Não Seguidores</span>
              <span className="stat-detail-value">
                {formatNumber(data.views.nonFollowersViews)} ({data.views.nonFollowersPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seguidores */}
      <div className="stats-section">
        <h3 className="stats-section-title">Seguidores</h3>
        <div className="stat-card-large">
          <div className="stat-card-large-header">
            <div className="stat-icon-large followers-icon">
              <FiUsers />
            </div>
            <div className="stat-card-large-info">
              <div className="stat-value-large">{formatNumber(data.followers.current)}</div>
              <div className="stat-label-large">Total de Seguidores</div>
              <div className="stat-variation-large">
                {followersVariation.isPositive ? (
                  <FiTrendingUp className="trend-up" />
                ) : (
                  <FiTrendingDown className="trend-down" />
                )}
                <span className={followersVariation.isPositive ? "positive" : "negative"}>
                  {followersVariation.value} vs. mês anterior
                </span>
              </div>
            </div>
          </div>
          <div className="stat-card-large-details">
            <div className="stat-detail-item">
              <span className="stat-detail-label">Seguidores Conquistados no Mês</span>
              <span className="stat-detail-value positive">
                +{formatNumber(data.followers.gainedThisMonth)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tráfego Pago */}
      <div className="stats-section">
        <h3 className="stats-section-title">Tráfego Pago - Investimento e ROI</h3>
        <div className="paid-traffic-grid">
          <div className="paid-traffic-card main-card">
            <div className="paid-traffic-card-header">
              <div className="paid-traffic-icon">
                <FiDollarSign />
              </div>
              <div>
                <div className="paid-traffic-label">Total Investido no Mês</div>
                <div className="paid-traffic-value">{formatCurrency(data.paidTraffic.totalInvested)}</div>
              </div>
            </div>
          </div>

          <div className="paid-traffic-card">
            <div className="paid-traffic-card-header">
              <div className="paid-traffic-icon small">
                <FiEye />
              </div>
              <div>
                <div className="paid-traffic-label">Visualizações do Tráfego Pago</div>
                <div className="paid-traffic-value">{formatNumber(data.paidTraffic.viewsFromPaid)}</div>
                <div className="paid-traffic-cost">
                  Custo por visualização: {formatCurrency(data.paidTraffic.costPerView)}
                </div>
              </div>
            </div>
          </div>

          <div className="paid-traffic-card">
            <div className="paid-traffic-card-header">
              <div className="paid-traffic-icon small">
                <FiUsers />
              </div>
              <div>
                <div className="paid-traffic-label">Seguidores do Tráfego Pago</div>
                <div className="paid-traffic-value">{formatNumber(data.paidTraffic.followersFromPaid)}</div>
                <div className="paid-traffic-cost">
                  Custo por seguidor: {formatCurrency(data.paidTraffic.costPerFollower)}
                </div>
              </div>
            </div>
          </div>

          <div className="paid-traffic-card">
            <div className="paid-traffic-card-header">
              <div className="paid-traffic-icon small">
                <FiTarget />
              </div>
              <div>
                <div className="paid-traffic-label">Contratos Fechados pelo Instagram</div>
                <div className="paid-traffic-value">{data.paidTraffic.contractsFromInstagram}</div>
                <div className="paid-traffic-cost">
                  Custo por contrato: {formatCurrency(data.paidTraffic.costPerContract)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className="roi-card">
          <div className="roi-header">
            <div className="roi-label">ROI (Retorno sobre Investimento)</div>
            <div className={`roi-value ${data.paidTraffic.roi >= 0 ? "positive" : "negative"}`}>
              {data.paidTraffic.roi >= 0 ? "+" : ""}{data.paidTraffic.roi.toFixed(2)}%
            </div>
          </div>
          <div className="roi-description">
            {data.paidTraffic.roi >= 0
              ? "O investimento está gerando retorno positivo"
              : "O investimento está abaixo do esperado"}
          </div>
        </div>
      </div>

      {/* Engajamento */}
      <div className="stats-section">
        <h3 className="stats-section-title">Engajamento</h3>
        <div className="engagement-grid">
          <div className="engagement-card">
            <div className="engagement-label">Taxa de Engajamento</div>
            <div className="engagement-value">{data.engagement.engagementRate.toFixed(2)}%</div>
          </div>
          <div className="engagement-card">
            <div className="engagement-label">Curtidas</div>
            <div className="engagement-value">{formatNumber(data.engagement.likes)}</div>
          </div>
          <div className="engagement-card">
            <div className="engagement-label">Comentários</div>
            <div className="engagement-value">{formatNumber(data.engagement.comments)}</div>
          </div>
          <div className="engagement-card">
            <div className="engagement-label">Salvos</div>
            <div className="engagement-value">{formatNumber(data.engagement.saves)}</div>
          </div>
          <div className="engagement-card">
            <div className="engagement-label">Compartilhamentos</div>
            <div className="engagement-value">{formatNumber(data.engagement.shares)}</div>
          </div>
        </div>
      </div>

      {/* Top Posts */}
      <div className="stats-section">
        <h3 className="stats-section-title">Posts com Melhor Performance</h3>
        <div className="top-posts-list">
          {data.topPosts.map((post, index) => (
            <div key={post.id} className="top-post-item">
              <div className="top-post-rank">{index + 1}</div>
              <div className="top-post-content">
                <div className="top-post-caption">{post.caption}</div>
                <div className="top-post-metrics">
                  <span>{formatNumber(post.views)} visualizações</span>
                  <span>{formatNumber(post.likes)} curtidas</span>
                  <span>{formatNumber(post.comments)} comentários</span>
                  <span className="engagement-rate">{post.engagementRate.toFixed(1)}% engajamento</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstagramStatsBlock;


import React, { useMemo } from "react";
import type { NFe } from "../../../types/nfe";

interface NFeStatsProps {
  nfes: NFe[];
}

const NFeStats: React.FC<NFeStatsProps> = ({ nfes }) => {
  const stats = useMemo(() => {
    const authorized = nfes.filter((n) => n.status === "authorized").length;
    const pending = nfes.filter((n) => n.status === "pending").length;
    const processing = nfes.filter((n) => n.status === "processing").length;
    const cancelled = nfes.filter((n) => n.status === "cancelled").length;
    const rejected = nfes.filter((n) => n.status === "rejected").length;
    const error = nfes.filter((n) => n.status === "error").length;

    const totalValue = nfes.reduce((sum, n) => sum + n.totalValue, 0);
    const authorizedValue = nfes
      .filter((n) => n.status === "authorized")
      .reduce((sum, n) => sum + n.totalValue, 0);
    const totalTax = nfes.reduce((sum, n) => sum + n.taxValue, 0);

    const total = nfes.length;
    const successRate = total > 0 ? (authorized / total) * 100 : 0;

    return {
      authorized,
      pending,
      processing,
      cancelled,
      rejected,
      error,
      totalValue,
      authorizedValue,
      totalTax,
      total,
      successRate,
    };
  }, [nfes]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="nfe-stats">
      <div className="nfe-stat-card success">
        <div className="nfe-stat-label">Autorizadas</div>
        <div className="nfe-stat-value">{stats.authorized}</div>
        <div className="nfe-stat-change">
          {formatCurrency(stats.authorizedValue)}
        </div>
      </div>

      <div className="nfe-stat-card warning">
        <div className="nfe-stat-label">Pendentes</div>
        <div className="nfe-stat-value">{stats.pending}</div>
        <div className="nfe-stat-change">
          {stats.processing > 0 && `${stats.processing} processando`}
        </div>
      </div>

      <div className="nfe-stat-card danger">
        <div className="nfe-stat-label">Problemas</div>
        <div className="nfe-stat-value">{stats.error + stats.rejected}</div>
        <div className="nfe-stat-change">
          {stats.error} erros, {stats.rejected} rejeitadas
        </div>
      </div>

      <div className="nfe-stat-card">
        <div className="nfe-stat-label">Taxa de Sucesso</div>
        <div className="nfe-stat-value">{stats.successRate.toFixed(1)}%</div>
        <div className="nfe-stat-change">
          {stats.total} NFe(s) emitida(s)
        </div>
      </div>

      <div className="nfe-stat-card">
        <div className="nfe-stat-label">Valor Total</div>
        <div className="nfe-stat-value">{formatCurrency(stats.totalValue)}</div>
        <div className="nfe-stat-change">
          Impostos: {formatCurrency(stats.totalTax)}
        </div>
      </div>

      <div className="nfe-stat-card">
        <div className="nfe-stat-label">Canceladas</div>
        <div className="nfe-stat-value">{stats.cancelled}</div>
        <div className="nfe-stat-change">
          {((stats.cancelled / stats.total) * 100).toFixed(1)}% do total
        </div>
      </div>
    </div>
  );
};

export default NFeStats;

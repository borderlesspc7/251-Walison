import React from "react";
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiPercent,
} from "react-icons/fi";
import "./SaleStats.css";

interface SaleStatsProps {
  stats: {
    total: number;
    totalRevenue: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    averageTicket: number;
    totalCommissions: number;
    totalMargin: number;
  };
}

export const SaleStats: React.FC<SaleStatsProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const statCards = [
    {
      title: "Total de Vendas",
      value: stats.total,
      icon: FiShoppingCart,
      color: "blue",
      description: "Número total de contratos",
      format: "number",
    },
    {
      title: "Faturamento Total",
      value: stats.totalRevenue,
      icon: FiDollarSign,
      color: "green",
      description: "Receita total gerada",
      format: "currency",
    },
    {
      title: "Ticket Médio",
      value: stats.averageTicket,
      icon: FiTarget,
      color: "purple",
      description: "Valor médio por venda",
      format: "currency",
    },
    {
      title: "Margem de Contribuição",
      value: stats.totalMargin,
      icon: FiTrendingUp,
      color: "cyan",
      description: "Margem total após custos",
      format: "currency",
    },
    {
      title: "Vendas Confirmadas",
      value: stats.confirmed,
      icon: FiCheckCircle,
      color: "success",
      description: "Contratos confirmados",
      format: "number",
    },
    {
      title: "Vendas Pendentes",
      value: stats.pending,
      icon: FiClock,
      color: "yellow",
      description: "Aguardando confirmação",
      format: "number",
    },
    {
      title: "Vendas Concluídas",
      value: stats.completed,
      icon: FiCheckCircle,
      color: "green",
      description: "Contratos finalizados",
      format: "number",
    },
    {
      title: "Total de Comissões",
      value: stats.totalCommissions,
      icon: FiPercent,
      color: "orange",
      description: "Comissões pagas",
      format: "currency",
    },
  ];

  const formatValue = (value: number, format: string) => {
    if (format === "currency") {
      return formatCurrency(value);
    }
    return value;
  };

  return (
    <div className="sale-stats">
      <div className="stats-grid">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.title}
              className={`stat-card stat-card-${stat.color}`}
            >
              <div className="stat-icon">
                <IconComponent size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatValue(stat.value, stat.format)}
                </div>
                <div className="stat-title">{stat.title}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

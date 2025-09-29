import React from "react";
import { FiTruck, FiCheckCircle, FiPause, FiAlertCircle } from "react-icons/fi";
import "./SupplierStats.css";

interface SupplierStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
}

export const SupplierStats: React.FC<SupplierStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total de Fornecedores",
      value: stats.total,
      icon: FiTruck,
      color: "blue",
      description: "Total de fornecedores cadastrados",
    },
    {
      title: "Fornecedores Ativos",
      value: stats.active,
      icon: FiCheckCircle,
      color: "green",
      description: "Fornecedores com status ativo",
    },
    {
      title: "Suspensos",
      value: stats.suspended,
      icon: FiAlertCircle,
      color: "yellow",
      description: "Fornecedores suspensos",
    },
    {
      title: "Inativos",
      value: stats.inactive,
      icon: FiPause,
      color: "gray",
      description: "Fornecedores inativos",
    },
  ];

  return (
    <div className="supplier-stats">
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
                <div className="stat-value">{stat.value}</div>
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

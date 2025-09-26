import React from "react";
import "./OwnerStats.css";
import { FiUsers, FiCheckCircle, FiTarget, FiPause } from "react-icons/fi";

interface OwnerStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
}

export const OwnerStats: React.FC<OwnerStatsProps> = ({ stats }) => {
  const statsCards = [
    {
      title: "Total de Proprietários",
      value: stats.total,
      icon: FiUsers,
      color: "blue",
      description: "Total de proprietários cadastrados",
    },
    {
      title: "Proprietários Ativos",
      value: stats.active,
      icon: FiCheckCircle,
      color: "green",
      description: "Total de proprietários ativos",
    },
    {
      title: "Suspensos",
      value: stats.suspended,
      icon: FiTarget,
      color: "yellow",
      description: "Total de proprietários suspensos",
    },
    {
      title: "Inativos",
      value: stats.inactive,
      icon: FiPause,
      color: "red",
      description: "Total de proprietários inativos",
    },
  ];

  return (
    <div className="owner-stats">
      <div className="stats-grid">
        {statsCards.map((stat) => {
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

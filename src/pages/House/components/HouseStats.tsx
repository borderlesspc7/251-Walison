import React from "react";
import {
  FiHome,
  FiCheckCircle,
  FiUsers,
  FiTool,
  FiPause,
} from "react-icons/fi";
interface HouseStatsProps {
  stats: {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    inactive: number;
  };
}

export const HouseStats: React.FC<HouseStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total de Casas",
      value: stats.total,
      icon: FiHome,
      color: "blue",
      description: "Total de casas cadastradas",
    },
    {
      title: "Disponíveis",
      value: stats.available,
      icon: FiCheckCircle,
      color: "green",
      description: "Casas disponíveis para alocação",
    },
    {
      title: "Ocupadas",
      value: stats.occupied,
      icon: FiUsers,
      color: "orange",
      description: "Casas atualmente ocupadas",
    },
    {
      title: "Em Manutenção",
      value: stats.maintenance,
      icon: FiTool,
      color: "yellow",
      description: "Casas em manutenção",
    },
    {
      title: "Inativas",
      value: stats.inactive,
      icon: FiPause,
      color: "red",
      description: "Casas inativas",
    },
  ];

  return (
    <div className="house-stats">
      <div className="stats-grid">
        {statCards.map((stat) => {
          const IconComponents = stat.icon;
          return (
            <div
              key={stat.title}
              className={`stat-card stat-card-${stat.color}`}
            >
              <div className="stat-icon">
                <IconComponents size={24} />
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

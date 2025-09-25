import React from "react";
import {
  FiUsers,
  FiCheckCircle,
  FiTarget,
  FiHome,
  FiUser,
  FiPause,
} from "react-icons/fi";
import "./ClientStats.css";

interface ClientStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    prospects: number;
  };
}

export const ClientStats: React.FC<ClientStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total de Clientes",
      value: stats.total,
      icon: FiUsers,
      color: "blue",
      description: "Total de clientes cadastrados",
    },
    {
      title: "Clientes Ativos",
      value: stats.active,
      icon: FiCheckCircle,
      color: "green",
      description: "Clientes com status ativo",
    },
    {
      title: "Prospects",
      value: stats.prospects,
      icon: FiTarget,
      color: "yellow",
      description: "Clientes em prospecção",
    },
    {
      title: "Inativos",
      value: stats.inactive,
      icon: FiPause,
      color: "gray",
      description: "Clientes inativos",
    },
  ];

  return (
    <div className="client-stats">
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

import React from "react";
import { FiUsers, FiCheckCircle, FiPause, FiAlertCircle } from "react-icons/fi";
import "./EmployeeStats.css";

interface EmployeeStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
}

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total de Colaboradores",
      value: stats.total,
      icon: FiUsers,
      color: "blue",
      description: "Total de colaboradores cadastrados",
    },
    {
      title: "Colaboradores Ativos",
      value: stats.active,
      icon: FiCheckCircle,
      color: "green",
      description: "Colaboradores com status ativo",
    },
    {
      title: "Suspensos",
      value: stats.suspended,
      icon: FiAlertCircle,
      color: "yellow",
      description: "Colaboradores suspensos",
    },
    {
      title: "Inativos",
      value: stats.inactive,
      icon: FiPause,
      color: "gray",
      description: "Colaboradores inativos",
    },
  ];

  return (
    <div className="employee-stats">
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

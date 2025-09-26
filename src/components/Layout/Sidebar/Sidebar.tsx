import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiBarChart,
  FiCreditCard,
  FiHome,
  FiShoppingCart,
  FiUsers,
  FiChevronRight,
  FiArrowUpCircle,
  FiPower,
} from "react-icons/fi";
import "./Sidebar.css";
import logo from "../../../images/logo.png";

interface SidebarProps {
  collapsed: boolean;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  path?: string;
  items?: MenuItem[];
  badge?: string | number;
}

const defaultMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FiHome,
    path: "/dashboard",
  },
  {
    id: "cadastros",
    label: "Cadastros",
    icon: FiUsers,
    items: [
      {
        id: "clientes",
        label: "Clientes",
        icon: FiUsers,
        path: "/clients",
      },
      {
        id: "proprietarios",
        label: "Proprietários",
        icon: FiUsers,
        path: "/owners",
      },
      {
        id: "fornecedores",
        label: "Fornecedores",
        icon: FiUsers,
        path: "/fornecedores",
      },
      {
        id: "colaboradores",
        label: "Colaboradores",
        icon: FiUsers,
        path: "/colaboradores",
      },
      {
        id: "casas",
        label: "Casas",
        icon: FiHome,
        path: "/casas",
      },
    ],
  },
  {
    id: "vendas",
    label: "Vendas",
    icon: FiShoppingCart,
    path: "/vendas",
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: FiCreditCard,
    path: "/financeiro",
  },
  {
    id: "dashboard-processos",
    label: "Dashboard Processos",
    icon: FiPower,
    path: "/dashboard-processos",
  },
  {
    id: "dashboard-metas",
    label: "Dashboard Metas",
    icon: FiArrowUpCircle,
    path: "/dashboard-metas",
  },
  {
    id: "dashboard-estatisticas",
    label: "Dashboard Estatísticas",
    icon: FiBarChart,
    path: "/dashboard-estatisticas",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  items = defaultMenuItems,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    if (collapsed) return;

    setExpandedItems((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.items) {
      toggleExpanded(item.id);
    }
  };

  const isActive = (path: string): boolean => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const isParentActive = (item: MenuItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.items) {
      return item.items.some((subItem) => isActive(subItem.path || ""));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isItemActive = isActive(item.path || "");
    const isParentItemActive = isParentActive(item);

    return (
      <div key={item.id} className="menu-item-container">
        <button
          className={`menu-item ${isItemActive ? "active" : ""} ${
            isParentItemActive ? "parent-active" : ""
          } ${level > 0 ? "sub-item" : ""}`}
          onClick={() => handleItemClick(item)}
          title={collapsed ? item.label : undefined}
        >
          <div className="menu-item-content">
            <div className="menu-icon">
              <item.icon size={18} />
            </div>

            {!collapsed && (
              <>
                <span className="menu-label">{item.label}</span>

                <div className="menu-item-end">
                  {item.badge && (
                    <span className="menu-badge">{item.badge}</span>
                  )}

                  {hasSubItems && (
                    <FiChevronRight
                      size={14}
                      className={`chevron ${isExpanded ? "expanded" : ""}`}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </button>

        {hasSubItems && !collapsed && isExpanded && (
          <div className="sub-menu">
            {item.items!.map((subItem) => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          {!collapsed && (
            <div className="logo-image">
              <img src={logo} alt="Logo" />
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {items.map((item) => renderMenuItem(item))}
        </div>
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="footer-content">
            <div className="version-info">
              <span>Versão 1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

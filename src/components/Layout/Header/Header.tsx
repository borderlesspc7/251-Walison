import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../ui/Button/Button";
import { useAuth } from "../../../hooks/useAuth";
import {
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiMenu,
} from "react-icons/fi";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Button
          variant="ghost"
          className="sidebar-toggle"
          onClick={onToggleSidebar}
        >
          <FiMenu size={20} />
        </Button>
      </div>

      <div className="header-right">
        <Button 
          variant="ghost" 
          className="notification-btn"
          onClick={() => navigate(paths.notifications)}
        >
          <FiBell size={18} />
          <span className="notification-badge">9+</span>
        </Button>

        <div className="user-menu-container" ref={userMenuRef}>
          <Button
            variant="ghost"
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <FiUser size={16} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || "Usuário"}</span>
              <span className="user-email">
                {user?.email || "usuário@email.com"}
              </span>
            </div>
            <FiChevronDown
              size={16}
              className={`chevron ${showUserMenu ? "rotated" : ""}`}
            />
          </Button>
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-avatar large">
                  <FiUser size={20} />
                </div>
                <div className="user-details">
                  <span className="name">{user?.name || "Usuário"}</span>
                  <span className="email">
                    {user?.email || "email@exemplo.com"}
                  </span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-items">
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate(paths.profile);
                    setShowUserMenu(false);
                  }}
                >
                  <FiUser size={16} />
                  <span>Meu Perfil</span>
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate(paths.settings);
                    setShowUserMenu(false);
                  }}
                >
                  <FiSettings size={16} />
                  <span>Configurações</span>
                </button>
              </div>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../components/ui/Button/Button";
import { useToast } from "../../hooks/useToast";
import { FiBell, FiCheck, FiTrash2, FiAlertCircle, FiInfo, FiCheckCircle } from "react-icons/fi";
import "./NotificationsManagement.css";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
}

export const NotificationsManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const { showSuccess, showError } = useToast();

  // Carregar notificações (simulação - substitua por chamada real à API)
  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Simulação de dados - substitua pela chamada real ao serviço
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "Novo cliente cadastrado",
          message: "O cliente João Silva foi cadastrado com sucesso no sistema.",
          type: "success",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        },
        {
          id: "2",
          title: "Pagamento pendente",
          message: "O pagamento da casa #123 está pendente há 5 dias.",
          type: "warning",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
        },
        {
          id: "3",
          title: "Venda finalizada",
          message: "A venda #456 foi finalizada com sucesso.",
          type: "success",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
        },
        {
          id: "4",
          title: "Erro no sistema",
          message: "Houve um erro ao processar a última solicitação.",
          type: "error",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
        },
        {
          id: "5",
          title: "Atualização disponível",
          message: "Uma nova versão do sistema está disponível.",
          type: "info",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 dias atrás
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar notificações";
      showError("Erro ao carregar notificações", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Formatar data relativa
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    }
  };

  // Marcar como lida
  const markAsRead = async (id: string) => {
    try {
      // Aqui você faria a chamada à API
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      showSuccess("Notificação marcada como lida", "");
    } catch (err) {
      showError("Erro ao marcar como lida", "Tente novamente");
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      // Aqui você faria a chamada à API
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      showSuccess("Todas as notificações foram marcadas como lidas", "");
    } catch (err) {
      showError("Erro ao marcar todas como lidas", "Tente novamente");
    }
  };

  // Excluir notificação
  const deleteNotification = async (id: string) => {
    try {
      // Aqui você faria a chamada à API
      setNotifications(prev => prev.filter(n => n.id !== id));
      showSuccess("Notificação excluída", "");
    } catch (err) {
      showError("Erro ao excluir notificação", "Tente novamente");
    }
  };

  // Filtrar notificações
  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  // Obter ícone por tipo
  const getIconByType = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <FiCheckCircle size={20} />;
      case "warning":
        return <FiAlertCircle size={20} />;
      case "error":
        return <FiAlertCircle size={20} />;
      case "info":
      default:
        return <FiInfo size={20} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-header__title">
          <FiBell size={24} />
          <h1>Notificações</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="notifications-header__actions">
          {unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllAsRead}>
              <FiCheck size={16} />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      <div className="notifications-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todas ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Não lidas ({notifications.filter(n => !n.isRead).length})
        </button>
        <button
          className={`filter-btn ${filter === "read" ? "active" : ""}`}
          onClick={() => setFilter("read")}
        >
          Lidas ({notifications.filter(n => n.isRead).length})
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <FiBell size={48} />
            <h3>Nenhuma notificação</h3>
            <p>
              {filter === "unread"
                ? "Você não tem notificações não lidas"
                : filter === "read"
                ? "Você não tem notificações lidas"
                : "Você não tem notificações"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${notification.type} ${
                !notification.isRead ? "unread" : ""
              }`}
            >
              <div className="notification-icon">
                {getIconByType(notification.type)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="action-btn"
                    onClick={() => markAsRead(notification.id)}
                    title="Marcar como lida"
                  >
                    <FiCheck size={18} />
                  </button>
                )}
                <button
                  className="action-btn delete"
                  onClick={() => deleteNotification(notification.id)}
                  title="Excluir"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

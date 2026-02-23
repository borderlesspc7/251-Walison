import React, { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { Button } from "../../components/ui/Button/Button";
import { 
  FiSettings, 
  FiBell, 
  FiMoon, 
  FiGlobe, 
  FiShield, 
  FiDatabase,
  FiSave,
  FiToggleLeft,
  FiToggleRight
} from "react-icons/fi";
import "./SettingsManagement.css";

interface SettingsState {
  // Notificações
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notifyNewClients: boolean;
  notifyPayments: boolean;
  notifySales: boolean;
  
  // Aparência
  darkMode: boolean;
  language: string;
  dateFormat: string;
  currency: string;
  
  // Privacidade
  showProfile: boolean;
  showEmail: boolean;
  twoFactorAuth: boolean;
  
  // Sistema
  autoSave: boolean;
  dataRetention: string;
  exportFormat: string;
}

export const SettingsManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"notifications" | "appearance" | "privacy" | "system">("notifications");

  const [settings, setSettings] = useState<SettingsState>({
    // Notificações
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notifyNewClients: true,
    notifyPayments: true,
    notifySales: true,
    
    // Aparência
    darkMode: false,
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL",
    
    // Privacidade
    showProfile: true,
    showEmail: false,
    twoFactorAuth: false,
    
    // Sistema
    autoSave: true,
    dataRetention: "90",
    exportFormat: "xlsx",
  });

  const handleToggle = (key: keyof SettingsState) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectChange = (key: keyof SettingsState, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Aqui você implementaria a chamada à API
      // await settingsService.updateSettings(settings);
      
      // Simulação de delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      showSuccess("Configurações salvas", "Suas preferências foram atualizadas com sucesso");
    } catch (error) {
      showError("Erro ao salvar configurações", error instanceof Error ? error.message : "Tente novamente");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "notifications" as const, label: "Notificações", icon: <FiBell size={18} /> },
    { id: "appearance" as const, label: "Aparência", icon: <FiMoon size={18} /> },
    { id: "privacy" as const, label: "Privacidade", icon: <FiShield size={18} /> },
    { id: "system" as const, label: "Sistema", icon: <FiDatabase size={18} /> },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header__title">
          <FiSettings size={24} />
          <h1>Configurações</h1>
        </div>
        <Button variant="primary" onClick={handleSaveSettings} disabled={loading}>
          <FiSave size={16} />
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {/* Notificações */}
          {activeTab === "notifications" && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Preferências de Notificações</h2>
                <p>Escolha como você deseja receber notificações do sistema</p>
              </div>

              <div className="settings-group">
                <h3>Canais de Notificação</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <FiBell size={20} />
                    <div>
                      <h4>Email</h4>
                      <p>Receber notificações por email</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("emailNotifications")}
                  >
                    {settings.emailNotifications ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <FiBell size={20} />
                    <div>
                      <h4>Push</h4>
                      <p>Receber notificações push no navegador</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("pushNotifications")}
                  >
                    {settings.pushNotifications ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <FiBell size={20} />
                    <div>
                      <h4>SMS</h4>
                      <p>Receber notificações por SMS</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("smsNotifications")}
                  >
                    {settings.smsNotifications ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>
              </div>

              <div className="settings-group">
                <h3>Eventos</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div>
                      <h4>Novos Clientes</h4>
                      <p>Notificar quando um novo cliente for cadastrado</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("notifyNewClients")}
                  >
                    {settings.notifyNewClients ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div>
                      <h4>Pagamentos</h4>
                      <p>Notificar sobre pagamentos recebidos e pendentes</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("notifyPayments")}
                  >
                    {settings.notifyPayments ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div>
                      <h4>Vendas</h4>
                      <p>Notificar quando uma venda for finalizada</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("notifySales")}
                  >
                    {settings.notifySales ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Aparência */}
          {activeTab === "appearance" && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Aparência e Localização</h2>
                <p>Personalize a aparência e formatos do sistema</p>
              </div>

              <div className="settings-group">
                <h3>Tema</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <FiMoon size={20} />
                    <div>
                      <h4>Modo Escuro</h4>
                      <p>Ativar tema escuro no sistema</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("darkMode")}
                  >
                    {settings.darkMode ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>
              </div>

              <div className="settings-group">
                <h3>Localização</h3>
                
                <div className="setting-item-select">
                  <div className="setting-info">
                    <FiGlobe size={20} />
                    <div>
                      <h4>Idioma</h4>
                      <p>Idioma do sistema</p>
                    </div>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSelectChange("language", e.target.value)}
                    className="setting-select"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div className="setting-item-select">
                  <div className="setting-info">
                    <div>
                      <h4>Formato de Data</h4>
                      <p>Como as datas serão exibidas</p>
                    </div>
                  </div>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleSelectChange("dateFormat", e.target.value)}
                    className="setting-select"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="setting-item-select">
                  <div className="setting-info">
                    <div>
                      <h4>Moeda</h4>
                      <p>Moeda padrão para valores monetários</p>
                    </div>
                  </div>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSelectChange("currency", e.target.value)}
                    className="setting-select"
                  >
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Privacidade */}
          {activeTab === "privacy" && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Privacidade e Segurança</h2>
                <p>Controle suas informações e segurança da conta</p>
              </div>

              <div className="settings-group">
                <h3>Visibilidade do Perfil</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <div>
                      <h4>Mostrar Perfil</h4>
                      <p>Permitir que outros usuários vejam seu perfil</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("showProfile")}
                  >
                    {settings.showProfile ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div>
                      <h4>Mostrar Email</h4>
                      <p>Exibir seu email para outros usuários</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("showEmail")}
                  >
                    {settings.showEmail ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>
              </div>

              <div className="settings-group">
                <h3>Segurança</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <FiShield size={20} />
                    <div>
                      <h4>Autenticação em Dois Fatores</h4>
                      <p>Adicionar uma camada extra de segurança à sua conta</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("twoFactorAuth")}
                  >
                    {settings.twoFactorAuth ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sistema */}
          {activeTab === "system" && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Configurações do Sistema</h2>
                <p>Preferências de funcionamento do sistema</p>
              </div>

              <div className="settings-group">
                <h3>Dados</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <FiDatabase size={20} />
                    <div>
                      <h4>Salvamento Automático</h4>
                      <p>Salvar automaticamente as alterações</p>
                    </div>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle("autoSave")}
                  >
                    {settings.autoSave ? (
                      <FiToggleRight size={32} className="active" />
                    ) : (
                      <FiToggleLeft size={32} />
                    )}
                  </button>
                </div>

                <div className="setting-item-select">
                  <div className="setting-info">
                    <div>
                      <h4>Retenção de Dados</h4>
                      <p>Tempo de armazenamento de dados temporários</p>
                    </div>
                  </div>
                  <select
                    value={settings.dataRetention}
                    onChange={(e) => handleSelectChange("dataRetention", e.target.value)}
                    className="setting-select"
                  >
                    <option value="30">30 dias</option>
                    <option value="60">60 dias</option>
                    <option value="90">90 dias</option>
                    <option value="180">6 meses</option>
                    <option value="365">1 ano</option>
                  </select>
                </div>

                <div className="setting-item-select">
                  <div className="setting-info">
                    <div>
                      <h4>Formato de Exportação</h4>
                      <p>Formato padrão para exportar relatórios</p>
                    </div>
                  </div>
                  <select
                    value={settings.exportFormat}
                    onChange={(e) => handleSelectChange("exportFormat", e.target.value)}
                    className="setting-select"
                  >
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="csv">CSV (.csv)</option>
                    <option value="pdf">PDF (.pdf)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

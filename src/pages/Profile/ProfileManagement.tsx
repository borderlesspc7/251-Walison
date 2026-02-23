import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Button } from "../../components/ui/Button/Button";
import InputField from "../../components/ui/InputField/InputField";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { FiUser, FiMail, FiPhone, FiSave, FiEdit3, FiX, FiShield } from "react-icons/fi";
import { maskPhone } from "../../utils/masks";
import "./ProfileManagement.css";

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const ProfileManagement: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  // Atualizar formData quando user mudar
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }));
    }
  }, [user]);

  const validateProfileForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.phone.trim()) {
      const phoneNumbers = formData.phone.replace(/\D/g, "");
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.phone = "Telefone deve ter 10 ou 11 dígitos";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Senha atual é obrigatória";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileFormData) => (value: string) => {
    if (field === "phone") {
      value = maskPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    setLoading(true);
    try {
      // Aqui você implementaria a chamada real à API
      // await userService.updateProfile({ name: formData.name, phone: formData.phone });
      
      // Simulação de delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      showSuccess("Perfil atualizado", "Suas informações foram atualizadas com sucesso");
      setIsEditing(false);
    } catch (error) {
      showError("Erro ao atualizar perfil", error instanceof Error ? error.message : "Tente novamente");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      // Aqui você implementaria a chamada real à API
      // await authService.changePassword(formData.currentPassword, formData.newPassword);
      
      // Simulação de delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      showSuccess("Senha alterada", "Sua senha foi alterada com sucesso");
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setIsChangingPassword(false);
    } catch (error) {
      showError("Erro ao alterar senha", error instanceof Error ? error.message : "Tente novamente");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleCancelPasswordChange = () => {
    setFormData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setErrors({});
    setIsChangingPassword(false);
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getRoleName = (role: string | undefined): string => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      corretor: "Corretor",
      proprietario: "Proprietário",
      inquilino: "Inquilino",
      financeiro: "Financeiro",
    };
    return roles[role || ""] || role || "N/A";
  };

  if (!user) {
    return (
      <div className="profile-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header__title">
          <FiUser size={24} />
          <h1>Meu Perfil</h1>
        </div>
      </div>

      <div className="profile-content">
        {/* Informações Básicas */}
        <div className="profile-card">
          <div className="profile-card__header">
            <h2>Informações Pessoais</h2>
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <FiEdit3 size={16} />
                Editar
              </Button>
            ) : (
              <div className="profile-card__actions">
                <Button variant="ghost" onClick={handleCancelEdit}>
                  <FiX size={16} />
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSaveProfile} disabled={loading}>
                  <FiSave size={16} />
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}
          </div>

          <div className="profile-card__body">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <label>Nome completo</label>
                {!isEditing ? (
                  <div className="profile-info-value">
                    <FiUser size={18} />
                    <span>{user.name}</span>
                  </div>
                ) : (
                  <InputField
                    label=""
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    error={errors.name}
                    placeholder="Digite seu nome completo"
                  />
                )}
              </div>

              <div className="profile-info-item">
                <label>Email</label>
                <div className="profile-info-value disabled">
                  <FiMail size={18} />
                  <span>{user.email}</span>
                  <span className="info-badge">Não editável</span>
                </div>
              </div>

              <div className="profile-info-item">
                <label>Telefone</label>
                {!isEditing ? (
                  <div className="profile-info-value">
                    <FiPhone size={18} />
                    <span>{user.phone || "Não informado"}</span>
                  </div>
                ) : (
                  <InputField
                    label=""
                    type="text"
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                    error={errors.phone}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                )}
              </div>

              <div className="profile-info-item">
                <label>Função</label>
                <div className="profile-info-value disabled">
                  <FiShield size={18} />
                  <span>{getRoleName(user.role)}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <label>Membro desde</label>
                <div className="profile-info-value disabled">
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <label>Última atualização</label>
                <div className="profile-info-value disabled">
                  <span>{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="profile-card">
          <div className="profile-card__header">
            <h2>Segurança</h2>
            {!isChangingPassword && (
              <Button variant="secondary" onClick={() => setIsChangingPassword(true)}>
                <FiShield size={16} />
                Alterar Senha
              </Button>
            )}
          </div>

          {isChangingPassword && (
            <div className="profile-card__body">
              <div className="password-change-form">
                <InputField
                  label="Senha atual"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange("currentPassword")}
                  error={errors.currentPassword}
                  placeholder="Digite sua senha atual"
                />

                <InputField
                  label="Nova senha"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange("newPassword")}
                  error={errors.newPassword}
                  placeholder="Digite a nova senha"
                  maxLength={50}
                />

                <InputField
                  label="Confirmar nova senha"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  error={errors.confirmPassword}
                  placeholder="Confirme a nova senha"
                  maxLength={50}
                />

                <div className="password-change-actions">
                  <Button variant="ghost" onClick={handleCancelPasswordChange}>
                    <FiX size={16} />
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleChangePassword} disabled={loading}>
                    <FiSave size={16} />
                    {loading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Avatar / Foto de Perfil */}
        <div className="profile-card">
          <div className="profile-card__header">
            <h2>Foto de Perfil</h2>
          </div>
          <div className="profile-card__body">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                <FiUser size={48} />
              </div>
              <div className="profile-avatar-info">
                <p>Adicione uma foto de perfil para personalizar sua conta</p>
                <Button variant="secondary" disabled>
                  <FiEdit3 size={16} />
                  Em breve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

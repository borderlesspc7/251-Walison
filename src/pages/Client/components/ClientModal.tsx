import React, { useState, useEffect } from "react";
import type {
  Client,
  CreateClientData,
  ClientStatus,
  MaritalStatus,
} from "../../../types/client";
import { clientService } from "../../../services/clientService";
import { Modal } from "../../../components/ui/Modal/Modal";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import "./ClientModal.css";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  client?: Client | null;
  mode: "create" | "edit" | "view";
}

const initialFormData: CreateClientData = {
  name: "",
  cpf: "",
  birthDate: new Date(),
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  },
  profession: "",
  maritalStatus: "single",
  phone: "",
  email: "",
  status: "active",
};

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateClientData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (client && (isEditing || mode === "view")) {
        setFormData({
          name: client.name,
          cpf: client.cpf,
          birthDate: client.birthDate,
          address: {
            street: client.address.street,
            number: client.address.number,
            complement: client.address.complement || "",
            neighborhood: client.address.neighborhood,
            city: client.address.city,
            state: client.address.state,
            zipCode: client.address.zipCode,
          },
          profession: client.profession,
          maritalStatus: client.maritalStatus,
          phone: client.phone,
          email: client.email,
          status: client.status,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, client, isEditing, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    }

    if (!formData.profession.trim()) {
      newErrors.profession = "Profissão é obrigatória";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validações de endereço
    if (!formData.address.street.trim()) {
      newErrors["address.street"] = "Rua é obrigatória";
    }
    if (!formData.address.number.trim()) {
      newErrors["address.number"] = "Número é obrigatório";
    }
    if (!formData.address.neighborhood.trim()) {
      newErrors["address.neighborhood"] = "Bairro é obrigatório";
    }
    if (!formData.address.city.trim()) {
      newErrors["address.city"] = "Cidade é obrigatória";
    }
    if (!formData.address.state.trim()) {
      newErrors["address.state"] = "Estado é obrigatório";
    }
    if (!formData.address.zipCode.trim()) {
      newErrors["address.zipCode"] = "CEP é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) return;

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isCreating) {
        await clientService.create(formData);
      } else if (isEditing && client) {
        await clientService.update({
          id: client.id,
          ...formData,
        });
      }

      onSave();
    } catch (error: unknown) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Erro ao salvar cliente",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | Date | undefined
  ) => {
    if (isReadOnly) return;

    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (parent === "address") {
          return {
            ...prev,
            address: {
              ...prev.address,
              [child]: value as string,
            },
          };
        }
        return prev;
      }
      return {
        ...prev,
        [field]: value,
      };
    });

    // Limpar erro do campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const parseDate = (dateString: string): Date | undefined => {
    return dateString ? new Date(dateString) : undefined;
  };

  const statusOptions = [
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
    { value: "prospect", label: "Prospect" },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Solteiro(a)" },
    { value: "married", label: "Casado(a)" },
    { value: "divorced", label: "Divorciado(a)" },
    { value: "widowed", label: "Viúvo(a)" },
    { value: "separated", label: "Separado(a)" },
  ];

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Novo Cliente";
      case "edit":
        return "Editar Cliente";
      case "view":
        return "Visualizar Cliente";
      default:
        return "Cliente";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="large"
      className="client-modal"
    >
      <form onSubmit={handleSubmit} className="client-form">
        {loading && <LoadingSpinner text="Salvando cliente..." />}

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="form-sections">
          {/* Informações Básicas */}
          <div className="form-section">
            <h3>Informações Básicas</h3>
            <div className="form-row">
              <div className="form-group">
                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={(value) =>
                    handleInputChange("status", value as ClientStatus)
                  }
                  options={statusOptions}
                  disabled={isReadOnly}
                  error={errors.status}
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Código"
                  value={client?.code || "Gerado automaticamente"}
                  placeholder="Código será gerado automaticamente"
                  onChange={() => {}}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <InputField
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(value) => handleInputChange("name", value)}
                  placeholder="Digite o nome completo"
                  error={errors.name}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="CPF"
                  value={formData.cpf}
                  onChange={(value) => handleInputChange("cpf", value)}
                  placeholder="000.000.000-00"
                  error={errors.cpf}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Data de Nascimento"
                  type="date"
                  value={
                    formData.birthDate ? formatDate(formData.birthDate) : ""
                  }
                  onChange={(value) =>
                    handleInputChange("birthDate", parseDate(value))
                  }
                  error={errors.birthDate}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Profissão"
                  value={formData.profession}
                  onChange={(value) => handleInputChange("profession", value)}
                  placeholder="Digite a profissão"
                  error={errors.profession}
                  required
                />
              </div>
              <div className="form-group">
                <SelectField
                  label="Estado Civil"
                  value={formData.maritalStatus}
                  onChange={(value) =>
                    handleInputChange("maritalStatus", value as MaritalStatus)
                  }
                  options={maritalStatusOptions}
                  disabled={isReadOnly}
                  error={errors.maritalStatus}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Telefone"
                  value={formData.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  placeholder="Digite o telefone"
                  error={errors.phone}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange("email", value)}
                  placeholder="Digite o email"
                  error={errors.email}
                  required
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="form-section">
            <h3>Endereço</h3>
            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="CEP"
                  value={formData.address.zipCode}
                  onChange={(value) =>
                    handleInputChange("address.zipCode", value)
                  }
                  placeholder="00000-000"
                  error={errors["address.zipCode"]}
                  required
                />
              </div>
              <div className="form-group flex-2">
                <InputField
                  label="Rua"
                  value={formData.address.street}
                  onChange={(value) =>
                    handleInputChange("address.street", value)
                  }
                  placeholder="Digite o nome da rua"
                  error={errors["address.street"]}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Número"
                  value={formData.address.number}
                  onChange={(value) =>
                    handleInputChange("address.number", value)
                  }
                  placeholder="123"
                  error={errors["address.number"]}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Complemento"
                  value={formData.address.complement || ""}
                  onChange={(value) =>
                    handleInputChange("address.complement", value)
                  }
                  placeholder="Apto, sala, etc. (opcional)"
                  error={errors["address.complement"]}
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Bairro"
                  value={formData.address.neighborhood}
                  onChange={(value) =>
                    handleInputChange("address.neighborhood", value)
                  }
                  placeholder="Digite o bairro"
                  error={errors["address.neighborhood"]}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <InputField
                  label="Cidade"
                  value={formData.address.city}
                  onChange={(value) => handleInputChange("address.city", value)}
                  placeholder="Digite a cidade"
                  error={errors["address.city"]}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Estado"
                  value={formData.address.state}
                  onChange={(value) =>
                    handleInputChange("address.state", value)
                  }
                  placeholder="SP"
                  error={errors["address.state"]}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Salvando..."
                : isCreating
                ? "Criar Cliente"
                : "Salvar Alterações"}
            </Button>
          </div>
        )}

        {isReadOnly && (
          <div className="form-actions">
            <Button type="button" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

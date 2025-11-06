import React, { useState, useEffect } from "react";
import type {
  Owner,
  CreateOwnerData,
  OwnerStatus,
  MaritalStatus,
  AccountType,
} from "../../../../types/owner";
import { ownerService } from "../../../../services/ownerService";
import { Modal } from "../../../../components/ui/Modal/Modal";
import InputField from "../../../../components/ui/InputField/InputField";
import { SelectField } from "../../../../components/ui/SelectField/SelectField";
import { Button } from "../../../../components/ui/Button/Button";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner/LoadingSpinner";
import { useToast } from "../../../../hooks/useToast";
import { maskedToNumber } from "../../../../utils/masks";
import "./OwnerModal.css";

interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onSave: (action: "create" | "edit") => void;
  owner?: Owner;
  mode: "create" | "edit" | "view";
}

const initialFormData: CreateOwnerData = {
  name: "",
  cpf: "",
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
  bankData: {
    bank: "",
    agency: "",
    account: "",
    accountType: "checking",
  },
  pix: "",
  commission: 0,
  status: "active",
};

export const OwnerModal: React.FC<OwnerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  owner,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateOwnerData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showError } = useToast();

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  useEffect(() => {
    if (isOpen) {
      if (owner && (isEditing || mode === "view")) {
        setFormData({
          name: owner.name,
          cpf: owner.cpf,
          address: {
            street: owner.address.street,
            number: owner.address.number,
            complement: owner.address.complement || "",
            neighborhood: owner.address.neighborhood,
            city: owner.address.city,
            state: owner.address.state,
            zipCode: owner.address.zipCode,
          },
          profession: owner.profession,
          maritalStatus: owner.maritalStatus,
          phone: owner.phone,
          bankData: {
            bank: owner.bankData.bank,
            agency: owner.bankData.agency,
            account: owner.bankData.account,
            accountType: owner.bankData.accountType,
          },
          pix: owner.pix,
          commission: owner.commission,
          status: owner.status,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, owner, isEditing, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    }

    if (!formData.profession.trim()) {
      newErrors.profession = "Profissão é obrigatória";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }

    if (!formData.pix.trim()) {
      newErrors.pix = "PIX é obrigatório";
    }

    if (formData.commission <= 0) {
      newErrors.commission = "Comissão deve ser maior que zero";
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

    // Validações de dados bancários
    if (!formData.bankData.bank.trim()) {
      newErrors["bankData.bank"] = "Banco é obrigatório";
    }
    if (!formData.bankData.agency.trim()) {
      newErrors["bankData.agency"] = "Agência é obrigatória";
    }
    if (!formData.bankData.account.trim()) {
      newErrors["bankData.account"] = "Conta é obrigatória";
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

      let action: "create" | "edit" = "create";
      if (isCreating) {
        await ownerService.create(formData);
        action = "create";
      } else if (isEditing && owner) {
        await ownerService.update({
          id: owner.id,
          ...formData,
        });
        action = "edit";
      }

      onSave(action);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao salvar proprietário";
      setErrors({
        submit: message,
      });
      showError("Erro ao salvar proprietário", message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | undefined
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
        if (parent === "bankData") {
          return {
            ...prev,
            bankData: {
              ...prev.bankData,
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

  const statusOptions = [
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
    { value: "suspended", label: "Suspenso" },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Solteiro(a)" },
    { value: "married", label: "Casado(a)" },
    { value: "divorced", label: "Divorciado(a)" },
    { value: "widowed", label: "Viúvo(a)" },
    { value: "separated", label: "Separado(a)" },
  ];

  const accountTypeOptions = [
    { value: "checking", label: "Conta Corrente" },
    { value: "savings", label: "Poupança" },
    { value: "business", label: "Conta Empresarial" },
  ];

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Novo Proprietário";
      case "edit":
        return "Editar Proprietário";
      case "view":
        return "Visualizar Proprietário";
      default:
        return "Proprietário";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="large"
      className="owner-modal"
    >
      <form onSubmit={handleSubmit} className="owner-form">
        {loading && <LoadingSpinner text="Salvando proprietário..." />}

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
                    handleInputChange("status", value as OwnerStatus)
                  }
                  options={statusOptions}
                  disabled={isReadOnly}
                  error={errors.status}
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Código"
                  value={owner?.code || "Gerado automaticamente"}
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
                  mask="cpf"
                />
              </div>
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
                  placeholder="(00) 00000-0000"
                  error={errors.phone}
                  required
                  mask="phone"
                />
              </div>
              <div className="form-group">
                <InputField
                  label="PIX"
                  value={formData.pix}
                  onChange={(value) => handleInputChange("pix", value)}
                  placeholder="Digite a chave PIX"
                  error={errors.pix}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Comissão (R$)"
                  value={String(Math.round(formData.commission * 100))}
                  onChange={(value) => {
                    const numValue = maskedToNumber(value, "currency");
                    handleInputChange("commission", numValue);
                  }}
                  placeholder="R$ 0,00"
                  error={errors.commission}
                  required
                  mask="currency"
                  returnUnmasked={true}
                />
              </div>
            </div>
          </div>
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
                  mask="cep"
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

          {/* Dados Bancários */}
          <div className="form-section">
            <h3>Dados Bancários</h3>
            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Banco"
                  value={formData.bankData.bank}
                  onChange={(value) =>
                    handleInputChange("bankData.bank", value)
                  }
                  placeholder="Nome do banco"
                  error={errors["bankData.bank"]}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Agência"
                  value={formData.bankData.agency}
                  onChange={(value) =>
                    handleInputChange("bankData.agency", value)
                  }
                  placeholder="0000"
                  error={errors["bankData.agency"]}
                  required
                  mask="bankAgency"
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Conta"
                  value={formData.bankData.account}
                  onChange={(value) =>
                    handleInputChange("bankData.account", value)
                  }
                  placeholder="00000-0"
                  error={errors["bankData.account"]}
                  required
                  mask="bankAccount"
                />
              </div>
              <div className="form-group">
                <SelectField
                  label="Tipo de Conta"
                  value={formData.bankData.accountType}
                  onChange={(value) =>
                    handleInputChange(
                      "bankData.accountType",
                      value as AccountType
                    )
                  }
                  options={accountTypeOptions}
                  disabled={isReadOnly}
                  error={errors["bankData.accountType"]}
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
                ? "Criar Proprietário"
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

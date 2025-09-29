import React, { useState, useEffect } from "react";
import type {
  Supplier,
  CreateSupplierData,
  SupplierStatus,
  AccountType,
} from "../../../types/supplier";
import { supplierService } from "../../../services/supplierService";
import { Modal } from "../../../components/ui/Modal/Modal";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import "./SupplierModal.css";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  supplier?: Supplier | null;
  mode: "create" | "edit" | "view";
}

const initialFormData: CreateSupplierData = {
  establishmentName: "",
  serviceType: "",
  bankData: {
    bank: "",
    agency: "",
    account: "",
    accountType: "checking",
  },
  pix: "",
  commissionPercentage: 0,
  status: "active",
};

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  supplier,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateSupplierData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (supplier && (isEditing || mode === "view")) {
        setFormData({
          establishmentName: supplier.establishmentName,
          serviceType: supplier.serviceType,
          bankData: {
            bank: supplier.bankData.bank,
            agency: supplier.bankData.agency,
            account: supplier.bankData.account,
            accountType: supplier.bankData.accountType,
          },
          pix: supplier.pix,
          commissionPercentage: supplier.commissionPercentage,
          status: supplier.status,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, supplier, isEditing, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.establishmentName.trim()) {
      newErrors.establishmentName = "Nome do estabelecimento é obrigatório";
    }

    if (!formData.serviceType.trim()) {
      newErrors.serviceType = "Tipo de serviço é obrigatório";
    }

    if (!formData.pix.trim()) {
      newErrors.pix = "PIX é obrigatório";
    }

    if (formData.commissionPercentage <= 0) {
      newErrors.commissionPercentage =
        "Percentual de comissão deve ser maior que zero";
    }

    if (formData.commissionPercentage > 100) {
      newErrors.commissionPercentage =
        "Percentual de comissão não pode ser maior que 100%";
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

      if (isCreating) {
        await supplierService.create(formData);
      } else if (isEditing && supplier) {
        await supplierService.update({
          id: supplier.id,
          ...formData,
        });
      }

      onSave();
    } catch (error: unknown) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Erro ao salvar fornecedor",
      });
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

  const serviceTypeOptions = [
    { value: "catering", label: "Buffet/Catering" },
    { value: "decoration", label: "Decoração" },
    { value: "photography", label: "Fotografia" },
    { value: "music", label: "Música/Som" },
    { value: "transport", label: "Transporte" },
    { value: "cleaning", label: "Limpeza" },
    { value: "security", label: "Segurança" },
    { value: "flowers", label: "Flores" },
    { value: "other", label: "Outros" },
  ];

  const accountTypeOptions = [
    { value: "checking", label: "Conta Corrente" },
    { value: "savings", label: "Poupança" },
    { value: "business", label: "Conta Empresarial" },
  ];

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Novo Fornecedor";
      case "edit":
        return "Editar Fornecedor";
      case "view":
        return "Visualizar Fornecedor";
      default:
        return "Fornecedor";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="large"
      className="supplier-modal"
    >
      <form onSubmit={handleSubmit} className="supplier-form">
        {loading && <LoadingSpinner text="Salvando fornecedor..." />}

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
                    handleInputChange("status", value as SupplierStatus)
                  }
                  options={statusOptions}
                  disabled={isReadOnly}
                  error={errors.status}
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Código"
                  value={supplier?.code || "Gerado automaticamente"}
                  placeholder="Código será gerado automaticamente"
                  onChange={() => {}}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <InputField
                  label="Nome do Estabelecimento"
                  value={formData.establishmentName}
                  onChange={(value) =>
                    handleInputChange("establishmentName", value)
                  }
                  placeholder="Digite o nome do estabelecimento"
                  error={errors.establishmentName}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <SelectField
                  label="Tipo de Serviço"
                  value={formData.serviceType}
                  onChange={(value) => handleInputChange("serviceType", value)}
                  options={serviceTypeOptions}
                  disabled={isReadOnly}
                  error={errors.serviceType}
                  required
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
                  label="Percentual de Comissão (%)"
                  type="number"
                  value={formData.commissionPercentage.toString()}
                  onChange={(value) =>
                    handleInputChange(
                      "commissionPercentage",
                      parseFloat(value) || 0
                    )
                  }
                  placeholder="0.00"
                  min={0}
                  max={100}
                  step={0.01}
                  error={errors.commissionPercentage}
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
                ? "Criar Fornecedor"
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

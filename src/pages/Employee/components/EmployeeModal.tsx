import React, { useState, useEffect } from "react";
import type {
  Employee,
  CreateEmployeeData,
  EmployeeStatus,
} from "../../../types/employee";
import { employeeService } from "../../../services/employeeService";
import { Modal } from "../../../components/ui/Modal/Modal";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import "./EmployeeModal.css";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee?: Employee | null;
  mode: "create" | "edit" | "view";
}

const initialFormData: CreateEmployeeData = {
  name: "",
  rentalCommissionPercentage: 10, // 10% padrão
  supplierCommissionPercentage: 10, // 10% padrão
  status: "active",
};

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateEmployeeData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (employee && (isEditing || mode === "view")) {
        setFormData({
          name: employee.name,
          rentalCommissionPercentage: employee.rentalCommissionPercentage,
          supplierCommissionPercentage: employee.supplierCommissionPercentage,
          status: employee.status,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, employee, isEditing, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (formData.rentalCommissionPercentage <= 0) {
      newErrors.rentalCommissionPercentage =
        "Percentual de comissão de locações deve ser maior que zero";
    }

    if (formData.rentalCommissionPercentage > 100) {
      newErrors.rentalCommissionPercentage =
        "Percentual de comissão de locações não pode ser maior que 100%";
    }

    if (formData.supplierCommissionPercentage <= 0) {
      newErrors.supplierCommissionPercentage =
        "Percentual de comissão de fornecedores deve ser maior que zero";
    }

    if (formData.supplierCommissionPercentage > 100) {
      newErrors.supplierCommissionPercentage =
        "Percentual de comissão de fornecedores não pode ser maior que 100%";
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
        await employeeService.create(formData);
      } else if (isEditing && employee) {
        await employeeService.update({
          id: employee.id,
          ...formData,
        });
      }

      onSave();
    } catch (error: unknown) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Erro ao salvar colaborador",
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

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Novo Colaborador";
      case "edit":
        return "Editar Colaborador";
      case "view":
        return "Visualizar Colaborador";
      default:
        return "Colaborador";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="medium"
      className="employee-modal"
    >
      <form onSubmit={handleSubmit} className="employee-form">
        {loading && <LoadingSpinner text="Salvando colaborador..." />}

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
                    handleInputChange("status", value as EmployeeStatus)
                  }
                  options={statusOptions}
                  disabled={isReadOnly}
                  error={errors.status}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <InputField
                  label="Nome do Colaborador"
                  value={formData.name}
                  onChange={(value) => handleInputChange("name", value)}
                  placeholder="Digite o nome completo"
                  error={errors.name}
                  required
                />
              </div>
            </div>
          </div>

          {/* Comissões */}
          <div className="form-section">
            <h3>Percentuais de Comissão</h3>
            <div className="commission-info">
              <p className="info-text">
                Os percentuais são aplicados sobre o valor líquido (faturamento
                - despesas/impostos)
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Comissão Locações (%)"
                  type="number"
                  value={formData.rentalCommissionPercentage.toString()}
                  onChange={(value) =>
                    handleInputChange(
                      "rentalCommissionPercentage",
                      parseFloat(value) || 0
                    )
                  }
                  placeholder="10.00"
                  min={0}
                  max={100}
                  step={0.01}
                  error={errors.rentalCommissionPercentage}
                  required
                />
                <div className="field-description">
                  <small>10% do líquido (Faturamento - Despesas)</small>
                </div>
              </div>

              <div className="form-group">
                <InputField
                  label="Comissão Fornecedores (%)"
                  type="number"
                  value={formData.supplierCommissionPercentage.toString()}
                  onChange={(value) =>
                    handleInputChange(
                      "supplierCommissionPercentage",
                      parseFloat(value) || 0
                    )
                  }
                  placeholder="10.00"
                  min={0}
                  max={100}
                  step={0.01}
                  error={errors.supplierCommissionPercentage}
                  required
                />
                <div className="field-description">
                  <small>10% do líquido (Faturamento - Impostos)</small>
                </div>
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
                ? "Criar Colaborador"
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

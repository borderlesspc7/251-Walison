import React, { useState, useEffect } from "react";
import type { House, CreateHouseData, HouseStatus } from "../../../types/house";
import { houseService } from "../../../services/houseService";
import { Modal } from "../../../components/ui/Modal/Modal";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { useToast } from "../../../hooks/useToast";
import { maskedToNumber } from "../../../utils/masks";
import "./HouseModal.css";

interface HouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: "create" | "edit") => void;
  house?: House | null;
  mode: "create" | "edit" | "view";
}

const initialFormData: CreateHouseData = {
  houseName: "",
  ownerId: "",
  staff: [],
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  },
  internetPassword: "",
  photos: [],
  description: "",
  observations: "",
  pricing: {
    lowSeason: 0,
    midSeason: 0,
    highSeason: 0,
    carnivalPackage: 0,
    newYearPackage: 0,
  },
  status: "available",
};

export const HouseModal: React.FC<HouseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  house,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateHouseData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const { showError } = useToast();

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (house && (isEditing || mode === "view")) {
        setFormData({
          houseName: house.houseName,
          ownerId: house.ownerId || "",
          staff: house.staff || [],
          address: {
            street: house.address.street,
            number: house.address.number,
            complement: house.address.complement || "",
            neighborhood: house.address.neighborhood,
            city: house.address.city,
            state: house.address.state,
            zipCode: house.address.zipCode || "",
          },
          internetPassword: house.internetPassword,
          photos: house.photos,
          description: house.description,
          observations: house.observations,
          pricing: {
            lowSeason: house.pricing.lowSeason,
            midSeason: house.pricing.midSeason,
            highSeason: house.pricing.highSeason,
            carnivalPackage: house.pricing.carnivalPackage,
            newYearPackage: house.pricing.newYearPackage,
          },
          status: house.status,
        });
        setPhotoUrls(house.photos);
      } else {
        setFormData(initialFormData);
        setPhotoUrls([]);
      }
      setErrors({});
    }
  }, [isOpen, house, isEditing, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.houseName.trim()) {
      newErrors.houseName = "Nome da casa é obrigatório";
    }

    if (!formData.internetPassword.trim()) {
      newErrors.internetPassword = "Senha da internet é obrigatória";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
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

    // Validações de preços
    if (formData.pricing.lowSeason <= 0) {
      newErrors["pricing.lowSeason"] =
        "Preço da baixa temporada deve ser maior que zero";
    }
    if (formData.pricing.midSeason <= 0) {
      newErrors["pricing.midSeason"] =
        "Preço da média temporada deve ser maior que zero";
    }
    if (formData.pricing.highSeason <= 0) {
      newErrors["pricing.highSeason"] =
        "Preço da alta temporada deve ser maior que zero";
    }
    if (formData.pricing.carnivalPackage <= 0) {
      newErrors["pricing.carnivalPackage"] =
        "Preço do pacote de carnaval deve ser maior que zero";
    }
    if (formData.pricing.newYearPackage <= 0) {
      newErrors["pricing.newYearPackage"] =
        "Preço do pacote de réveillon deve ser maior que zero";
    }

    formData.staff.forEach((member, index) => {
      if (member.name.trim() || member.role.trim() || member.phone?.trim()) {
        if (!member.name.trim()) {
          newErrors[`staff.${index}.name`] = "Nome do staff é obrigatório";
        }
        if (!member.role.trim()) {
          newErrors[`staff.${index}.role`] = "Função do staff é obrigatória";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) return;

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Atualizar fotos no formData
      const dataWithPhotos = {
        ...formData,
        photos: photoUrls,
      };

      let action: "create" | "edit" = "create";
      if (isCreating) {
        await houseService.create(dataWithPhotos);
        action = "create";
      } else if (isEditing && house) {
        await houseService.update({
          id: house.id,
          ...dataWithPhotos,
        });
        action = "edit";
      }

      onSave(action);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro ao salvar casa";
      setErrors({
        submit: message,
      });
      showError("Erro ao salvar casa", message);
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
        if (parent === "pricing") {
          return {
            ...prev,
            pricing: {
              ...prev.pricing,
              [child]: value as number,
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

  const handlePhotoUrlChange = (index: number, url: string) => {
    const newUrls = [...photoUrls];
    newUrls[index] = url;
    setPhotoUrls(newUrls);
  };

  const addPhotoUrl = () => {
    setPhotoUrls([...photoUrls, ""]);
  };

  const removePhotoUrl = (index: number) => {
    const newUrls = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(newUrls);
  };

  const handleStaffChange = (
    index: number,
    field: "name" | "role" | "phone" | "notes",
    value: string
  ) => {
    if (isReadOnly) return;

    setFormData((prev) => {
      const staff = [...prev.staff];
      const current = staff[index] || {
        name: "",
        role: "",
        phone: "",
        notes: "",
      };
      staff[index] = {
        ...current,
        [field]: value,
      };
      return {
        ...prev,
        staff,
      };
    });

    const errorKey = `staff.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addStaffMember = () => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      staff: [
        ...prev.staff,
        {
          name: "",
          role: "",
          phone: "",
          notes: "",
        },
      ],
    }));
  };

  const removeStaffMember = (index: number) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index),
    }));
  };

  const statusOptions = [
    { value: "available", label: "Disponível" },
    { value: "occupied", label: "Ocupada" },
    { value: "maintenance", label: "Em Manutenção" },
    { value: "inactive", label: "Inativa" },
  ];

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Nova Casa";
      case "edit":
        return "Editar Casa";
      case "view":
        return "Visualizar Casa";
      default:
        return "Casa";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="large"
      className="house-modal"
    >
      <form onSubmit={handleSubmit} className="house-form">
        {loading && <LoadingSpinner text="Salvando casa..." />}

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
                    handleInputChange("status", value as HouseStatus)
                  }
                  options={statusOptions}
                  disabled={isReadOnly}
                  error={errors.status}
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Código"
                  value={house?.code || "Gerado automaticamente"}
                  placeholder="Código será gerado automaticamente"
                  onChange={() => {}}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <InputField
                  label="Nome da Casa"
                  value={formData.houseName}
                  onChange={(value) => handleInputChange("houseName", value)}
                  placeholder="Digite o nome da casa"
                  error={errors.houseName}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Senha da Internet"
                  value={formData.internetPassword}
                  onChange={(value) =>
                    handleInputChange("internetPassword", value)
                  }
                  placeholder="Digite a senha da internet"
                  error={errors.internetPassword}
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

          {/* Preços */}
          <div className="form-section">
            <h3>Valores das Diárias</h3>
            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Baixa Temporada (R$)"
                  value={String(Math.round(formData.pricing.lowSeason * 100))}
                  onChange={(value) => {
                    const numValue = maskedToNumber(value, "currency");
                    handleInputChange("pricing.lowSeason", numValue);
                  }}
                  placeholder="R$ 0,00"
                  error={errors["pricing.lowSeason"]}
                  required
                  mask="currency"
                  returnUnmasked={true}
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Média Temporada (R$)"
                  value={String(Math.round(formData.pricing.midSeason * 100))}
                  onChange={(value) => {
                    const numValue = maskedToNumber(value, "currency");
                    handleInputChange("pricing.midSeason", numValue);
                  }}
                  placeholder="R$ 0,00"
                  error={errors["pricing.midSeason"]}
                  required
                  mask="currency"
                  returnUnmasked={true}
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Alta Temporada (R$)"
                  value={String(Math.round(formData.pricing.highSeason * 100))}
                  onChange={(value) => {
                    const numValue = maskedToNumber(value, "currency");
                    handleInputChange("pricing.highSeason", numValue);
                  }}
                  placeholder="R$ 0,00"
                  error={errors["pricing.highSeason"]}
                  required
                  mask="currency"
                  returnUnmasked={true}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Pacote de Carnaval (R$)"
                  value={String(Math.round(formData.pricing.carnivalPackage * 100))}
                  onChange={(value) => {
                    const numValue = maskedToNumber(value, "currency");
                    handleInputChange("pricing.carnivalPackage", numValue);
                  }}
                  placeholder="R$ 0,00"
                  error={errors["pricing.carnivalPackage"]}
                  required
                  mask="currency"
                  returnUnmasked={true}
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Pacote de Réveillon (R$)"
                  value={String(Math.round(formData.pricing.newYearPackage * 100))}
                  onChange={(value) => {
                    const numValue = maskedToNumber(value, "currency");
                    handleInputChange("pricing.newYearPackage", numValue);
                  }}
                  placeholder="R$ 0,00"
                  error={errors["pricing.newYearPackage"]}
                  required
                  mask="currency"
                  returnUnmasked={true}
                />
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div className="form-section">
            <h3>Fotos</h3>
            <div className="photos-container">
              {photoUrls.map((url, index) => (
                <div key={index} className="photo-input-group">
                  <InputField
                    label={`Foto ${index + 1}`}
                    value={url}
                    onChange={(value) => handlePhotoUrlChange(index, value)}
                    placeholder="URL da foto"
                    disabled={isReadOnly}
                  />
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => removePhotoUrl(index)}
                      className="remove-photo-btn"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addPhotoUrl}
                  className="add-photo-btn"
                >
                  + Adicionar Foto
                </Button>
              )}
            </div>
          </div>

          {/* Staff */}
          <div className="form-section">
            <h3>Equipe (Staff)</h3>
            <div className="staff-container">
              {formData.staff.length === 0 && (
                <p className="staff-empty">Nenhum membro adicionado.</p>
              )}
              {formData.staff.map((member, index) => (
                <div key={index} className="staff-row">
                  <div className="form-row">
                    <div className="form-group">
                      <InputField
                        label="Nome"
                        value={member.name}
                        onChange={(value) =>
                          handleStaffChange(index, "name", value)
                        }
                        placeholder="Nome do colaborador"
                        disabled={isReadOnly}
                        error={errors[`staff.${index}.name`]}
                      />
                    </div>
                    <div className="form-group">
                      <InputField
                        label="Função"
                        value={member.role}
                        onChange={(value) =>
                          handleStaffChange(index, "role", value)
                        }
                        placeholder="Ex: Governanta, Manutenção"
                        disabled={isReadOnly}
                        error={errors[`staff.${index}.role`]}
                      />
                    </div>
                    <div className="form-group">
                      <InputField
                        label="Telefone"
                        value={member.phone || ""}
                        onChange={(value) =>
                          handleStaffChange(index, "phone", value)
                        }
                        placeholder="(00) 00000-0000"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <InputField
                        label="Observações"
                        value={member.notes || ""}
                        onChange={(value) =>
                          handleStaffChange(index, "notes", value)
                        }
                        placeholder="Observações (opcional)"
                        disabled={isReadOnly}
                      />
                    </div>
                    {!isReadOnly && (
                      <div className="staff-actions">
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => removeStaffMember(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addStaffMember}
                  className="add-staff-btn"
                >
                  + Adicionar Staff
                </Button>
              )}
            </div>
          </div>

          {/* Descrição e Observações */}
          <div className="form-section">
            <h3>Descrição e Observações</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <InputField
                  label="Descrição da Casa"
                  value={formData.description}
                  onChange={(value) => handleInputChange("description", value)}
                  placeholder="Descreva a casa, comodidades, etc."
                  error={errors.description}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <InputField
                  label="Observações"
                  value={formData.observations}
                  onChange={(value) => handleInputChange("observations", value)}
                  placeholder="Observações adicionais (opcional)"
                  error={errors.observations}
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
                ? "Criar Casa"
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

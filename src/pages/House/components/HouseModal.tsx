import React, { useState, useEffect } from "react";
import type { House, CreateHouseData, HouseStatus } from "../../../types/house";
import { houseService } from "../../../services/houseService";
import { Modal } from "../../../components/ui/Modal/Modal";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import "./HouseModal.css";

interface HouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  house?: House | null;
  mode: "create" | "edit" | "view";
}

const initialFormData: CreateHouseData = {
  houseName: "",
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

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (house && (isEditing || mode === "view")) {
        setFormData({
          houseName: house.houseName,
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

      if (isCreating) {
        await houseService.create(dataWithPhotos);
      } else if (isEditing && house) {
        await houseService.update({
          id: house.id,
          ...dataWithPhotos,
        });
      }

      onSave();
    } catch (error: unknown) {
      setErrors({
        submit: error instanceof Error ? error.message : "Erro ao salvar casa",
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
                  type="number"
                  value={formData.pricing.lowSeason.toString()}
                  onChange={(value) =>
                    handleInputChange(
                      "pricing.lowSeason",
                      parseFloat(value) || 0
                    )
                  }
                  placeholder="0.00"
                  error={errors["pricing.lowSeason"]}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Média Temporada (R$)"
                  type="number"
                  value={formData.pricing.midSeason.toString()}
                  onChange={(value) =>
                    handleInputChange(
                      "pricing.midSeason",
                      parseFloat(value) || 0
                    )
                  }
                  placeholder="0.00"
                  error={errors["pricing.midSeason"]}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Alta Temporada (R$)"
                  type="number"
                  value={formData.pricing.highSeason.toString()}
                  onChange={(value) =>
                    handleInputChange(
                      "pricing.highSeason",
                      parseFloat(value) || 0
                    )
                  }
                  placeholder="0.00"
                  error={errors["pricing.highSeason"]}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <InputField
                  label="Pacote de Carnaval (R$)"
                  type="number"
                  value={formData.pricing.carnivalPackage.toString()}
                  onChange={(value) =>
                    handleInputChange(
                      "pricing.carnivalPackage",
                      parseFloat(value) || 0
                    )
                  }
                  placeholder="0.00"
                  error={errors["pricing.carnivalPackage"]}
                  required
                />
              </div>
              <div className="form-group">
                <InputField
                  label="Pacote de Réveillon (R$)"
                  type="number"
                  value={formData.pricing.newYearPackage.toString()}
                  onChange={(value) =>
                    handleInputChange(
                      "pricing.newYearPackage",
                      parseFloat(value) || 0
                    )
                  }
                  placeholder="0.00"
                  error={errors["pricing.newYearPackage"]}
                  required
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

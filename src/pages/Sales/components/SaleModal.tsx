import React, { useState, useEffect } from "react";
import type {
  Sale,
  CreateSaleData,
  CompanyType,
  SaleOrigin,
  SaleStatus,
} from "../../../types/sale";
import type { Client } from "../../../types/client";
import type { House } from "../../../types/house";
import {
  saleService,
  calculateSaleValues,
} from "../../../services/saleService";
import { clientService } from "../../../services/clientService";
import { houseService } from "../../../services/houseService";
import { Modal } from "../../../components/ui/Modal/Modal";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner/LoadingSpinner";
import { useToast } from "../../../hooks/useToast";
import "./SaleModal.css";
import type { Employee } from "../../../types/employee";
import { employeeService } from "../../../services/employeeService";
import { ownerService } from "../../../services/ownerService";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: "create" | "edit") => void;
  sale?: Sale | null;
  mode: "create" | "edit" | "view";
}

const initialFormData: CreateSaleData = {
  company: "exclusive",
  clientId: "",
  saleOrigin: "instagram",
  houseId: "",
  checkInDate: new Date(),
  checkOutDate: new Date(),
  numberOfGuests: 1,
  contractValue: 0,
  discount: 0,
  housekeeperValue: 0,
  conciergeValue: 0,
  additionalSales: {
    supermarket: 0,
    seafood: 0,
    seafoodMeat: 0,
    transfer: 0,
    vegetables: 0,
    coconuts: 0,
  },
  status: "pending",
  employeeId: "",
};

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sale,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateSaleData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const { showError, showWarning } = useToast();

  // Valores calculados automaticamente
  const [calculatedValues, setCalculatedValues] = useState({
    numberOfNights: 0,
    netValue: 0,
    salesCommission: 0,
    totalAdditionalSales: 0,
    totalRevenue: 0,
    contributionMargin: 0,
  });

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";

  // Carregar clientes e casas
  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadHouses();
      loadEmployees();
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar clientes";
      showError("Erro ao carregar clientes", message);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao carregar colaboradores";
      showError("Erro ao carregar colaboradores", message);
    }
  };

  const loadHouses = async () => {
    try {
      const data = await houseService.getAll();
      setHouses(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar casas";
      showError("Erro ao carregar casas", message);
    }
  };

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (sale && (isEditing || mode === "view")) {
        setFormData({
          company: sale.company,
          clientId: sale.clientId,
          saleOrigin: sale.saleOrigin,
          houseId: sale.houseId,
          checkInDate: sale.checkInDate,
          checkOutDate: sale.checkOutDate,
          numberOfGuests: sale.numberOfGuests,
          contractValue: sale.contractValue,
          discount: sale.discount,
          housekeeperValue: sale.housekeeperValue,
          conciergeValue: sale.conciergeValue,
          additionalSales: sale.additionalSales,
          status: sale.status,
          employeeId: sale.employeeId,
        });

        // Buscar cliente e casa selecionados
        clientService.getById(sale.clientId).then(setSelectedClient);
        houseService.getById(sale.houseId).then(setSelectedHouse);
      } else {
        setFormData(initialFormData);
        setSelectedClient(null);
        setSelectedHouse(null);
      }
      setErrors({});
    }
  }, [isOpen, sale, isEditing, mode]);

  // Recalcular valores quando campos relevantes mudarem
  useEffect(() => {
    const calculated = calculateSaleValues(
      formData.checkInDate,
      formData.checkOutDate,
      formData.contractValue,
      formData.discount || 0,
      formData.housekeeperValue || 0,
      formData.conciergeValue || 0,
      formData.additionalSales || {}
    );
    setCalculatedValues(calculated);
  }, [
    formData.checkInDate,
    formData.checkOutDate,
    formData.contractValue,
    formData.discount,
    formData.housekeeperValue,
    formData.conciergeValue,
    formData.additionalSales,
  ]);

  // Atualizar cliente selecionado
  useEffect(() => {
    if (formData.clientId) {
      const client = clients.find((c) => c.id === formData.clientId);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [formData.clientId, clients]);

  useEffect(() => {
    if (formData.employeeId) {
      const employee = employees.find((e) => e.id === formData.employeeId);
      setSelectedEmployee(employee || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [formData.employeeId, employees]);

  // Atualizar casa selecionada
  useEffect(() => {
    if (formData.houseId) {
      const house = houses.find((h) => h.id === formData.houseId);
      setSelectedHouse(house || null);
    } else {
      setSelectedHouse(null);
    }
  }, [formData.houseId, houses]);

  useEffect(() => {
    if (selectedHouse?.ownerId) {
      ownerService.getById(selectedHouse.ownerId).then((owner) => {
        if (owner) {
          setFormData((prev) => ({
            ...prev,
            ownerId: owner.id,
            ownerName: owner.name,
            ownerPhone: owner.phone,
          }));
        }
      });
    }
  }, [selectedHouse]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = "Cliente é obrigatório";
    }

    if (!formData.employeeId) {
      newErrors.employeeId = "Funcionário é obrigatório";
    }

    if (!formData.houseId) {
      newErrors.houseId = "Casa é obrigatória";
    }

    if (formData.checkInDate >= formData.checkOutDate) {
      newErrors.checkOutDate = "Data de saída deve ser após a data de entrada";
    }

    if (formData.contractValue <= 0) {
      newErrors.contractValue = "Valor do contrato deve ser maior que zero";
    }

    if (formData.numberOfGuests <= 0) {
      newErrors.numberOfGuests = "Número de hóspedes deve ser maior que zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) {
      onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Verificar disponibilidade da casa
      const isAvailable = await saleService.checkHouseAvailability(
        formData.houseId,
        formData.checkInDate,
        formData.checkOutDate,
        sale?.id
      );

      if (!isAvailable) {
        showWarning(
          "Casa indisponível",
          "Esta casa já possui uma reserva para as datas selecionadas."
        );
        return;
      }

      let action: "create" | "edit" = "create";
      if (isEditing && sale) {
        await saleService.update({ id: sale.id, ...formData });
        action = "edit";
      } else {
        await saleService.create(formData);
        action = "create";
      }

      onSave(action);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao salvar venda. Tente novamente.";
      showError("Erro ao salvar venda", message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof CreateSaleData,
    value: string | number | Date | CompanyType | SaleOrigin | SaleStatus
  ) => {
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

  const handleAdditionalSaleChange = (
    field: keyof NonNullable<CreateSaleData["additionalSales"]>,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      additionalSales: {
        ...(prev.additionalSales || {}),
        [field]: value,
      },
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00");
  };

  const getModalTitle = () => {
    if (mode === "view") return "Visualizar Venda";
    if (mode === "edit") return "Editar Venda";
    return "Nova Venda";
  };

  // Options para os selects
  const companyOptions = [
    { value: "exclusive", label: "Exclusive" },
    { value: "giogio", label: "Giogio" },
    { value: "direta", label: "Direta" },
  ];

  const saleOriginOptions = [
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "google", label: "Google" },
    { value: "indicacao", label: "Indicação" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "site", label: "Site" },
    { value: "outros", label: "Outros" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pendente" },
    { value: "confirmed", label: "Confirmada" },
    { value: "completed", label: "Concluída" },
    { value: "cancelled", label: "Cancelada" },
  ];

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: `${client.name} - ${client.cpf}`,
  }));

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: employee.name,
  }));

  const houseOptions = houses.map((house) => ({
    value: house.id,
    label: `${house.houseName} - ${house.address.city}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="large"
    >
      <form onSubmit={handleSubmit} className="sale-modal-form">
        {loading && <LoadingSpinner text="Salvando..." />}

        <div className="form-grid">
          {/* Seção 1: Informações Básicas */}
          <div className="form-section">
            <h3 className="section-title">Informações Básicas</h3>

            <SelectField
              label="Empresa"
              value={formData.company}
              onChange={(value) =>
                handleChange("company", value as CompanyType)
              }
              options={companyOptions}
              disabled={isReadOnly}
              error={errors.company}
              required
            />

            <SelectField
              label="Origem da Venda"
              value={formData.saleOrigin}
              onChange={(value) =>
                handleChange("saleOrigin", value as SaleOrigin)
              }
              options={saleOriginOptions}
              disabled={isReadOnly}
              error={errors.saleOrigin}
              required
            />

            <SelectField
              label="Status"
              value={formData.status || "pending"}
              onChange={(value) => handleChange("status", value as SaleStatus)}
              options={statusOptions}
              disabled={isReadOnly}
            />
          </div>

          {/* Seção 2: Cliente */}
          <div className="form-section">
            <h3 className="section-title">Cliente</h3>

            <SelectField
              label="Cliente"
              value={formData.clientId}
              onChange={(value) => handleChange("clientId", value)}
              options={[
                { value: "", label: "Selecione um cliente" },
                ...clientOptions,
              ]}
              disabled={isReadOnly}
              error={errors.clientId}
              required
            />

            {selectedClient && (
              <div className="client-info-display">
                <div className="info-row">
                  <span className="info-label">CPF:</span>
                  <span className="info-value">{selectedClient.cpf}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Telefone:</span>
                  <span className="info-value">{selectedClient.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedClient.email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Seção 3: Casa */}
          <div className="form-section">
            <h3 className="section-title">Casa</h3>

            <SelectField
              label="Casa"
              value={formData.houseId}
              onChange={(value) => handleChange("houseId", value)}
              options={[
                { value: "", label: "Selecione uma casa" },
                ...houseOptions,
              ]}
              disabled={isReadOnly}
              error={errors.houseId}
              required
            />

            {selectedHouse && (
              <div className="house-info-display">
                <div className="info-row">
                  <span className="info-label">Endereço:</span>
                  <span className="info-value">
                    {selectedHouse.address.street},{" "}
                    {selectedHouse.address.number} -{" "}
                    {selectedHouse.address.city}/{selectedHouse.address.state}
                  </span>
                </div>

                {selectedHouse.ownerId && (
                  <>
                    <div className="info-divider"></div>
                    <div className="info-subtitle">Proprietário</div>
                    <div className="info-row">
                      <span className="info-label">Nome:</span>
                      <span className="info-value">
                        {selectedHouse.ownerName}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Telefone:</span>
                      <span className="info-value">
                        {selectedHouse.ownerPhone}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3 className="section-title">Colaborador Responsável</h3>

            <SelectField
              label="Vendedor/Colaborador"
              value={formData.employeeId || ""}
              onChange={(value) => handleChange("employeeId", value)}
              options={[
                { value: "", label: "Selecione um vendedor/colaborador" },
                ...employeeOptions,
              ]}
              disabled={isReadOnly}
              error={errors.employeeId}
              required
            />

            {selectedEmployee && (
              <div className="employee-info-display">
                <div className="info-row">
                  <span className="info-label">Nome:</span>
                  <span className="info-value">{selectedEmployee.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Comissão:</span>
                  <span className="info-value">
                    {selectedEmployee.rentalCommissionPercentage}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Seção 4: Estadia */}
          <div className="form-section">
            <h3 className="section-title">Informações de Estadia</h3>

            <div className="form-row">
              <InputField
                label="Data de Check-in"
                type="date"
                value={formatDate(formData.checkInDate)}
                onChange={(value) =>
                  handleChange("checkInDate", parseDate(value))
                }
                disabled={isReadOnly}
                error={errors.checkInDate}
              />

              <InputField
                label="Data de Check-out"
                type="date"
                value={formatDate(formData.checkOutDate)}
                onChange={(value) =>
                  handleChange("checkOutDate", parseDate(value))
                }
                disabled={isReadOnly}
                error={errors.checkOutDate}
              />
            </div>

            <div className="calculated-value">
              <span className="calc-label">Número de Pernoites:</span>
              <span className="calc-value">
                {calculatedValues.numberOfNights} noites
              </span>
            </div>

            <InputField
              label="Número de Hóspedes"
              type="number"
              value={String(formData.numberOfGuests)}
              onChange={(value) =>
                handleChange("numberOfGuests", parseInt(value) || 1)
              }
              disabled={isReadOnly}
              error={errors.numberOfGuests}
            />
          </div>

          {/* Seção 5: Valores Financeiros */}
          <div className="form-section">
            <h3 className="section-title">Valores Financeiros</h3>

            <InputField
              label="Valor do Contrato"
              type="number"
              value={String(formData.contractValue)}
              onChange={(value) =>
                handleChange("contractValue", parseFloat(value) || 0)
              }
              disabled={isReadOnly}
              error={errors.contractValue}
            />

            <InputField
              label="Desconto"
              type="number"
              value={String(formData.discount || 0)}
              onChange={(value) =>
                handleChange("discount", parseFloat(value) || 0)
              }
              disabled={isReadOnly}
            />

            <div className="calculated-value">
              <span className="calc-label">Valor Líquido:</span>
              <span className="calc-value highlight">
                {formatCurrency(calculatedValues.netValue)}
              </span>
            </div>

            <div className="calculated-value">
              <span className="calc-label">Comissão de Venda (10%):</span>
              <span className="calc-value">
                {formatCurrency(calculatedValues.salesCommission)}
              </span>
            </div>

            <InputField
              label="Valor da Governanta"
              type="number"
              value={String(formData.housekeeperValue || 0)}
              onChange={(value) =>
                handleChange("housekeeperValue", parseFloat(value) || 0)
              }
              disabled={isReadOnly}
            />

            <InputField
              label="Valor do Concierge"
              type="number"
              value={String(formData.conciergeValue || 0)}
              onChange={(value) =>
                handleChange("conciergeValue", parseFloat(value) || 0)
              }
              disabled={isReadOnly}
            />
          </div>

          {/* Seção 6: Vendas Adicionais */}
          <div className="form-section full-width">
            <h3 className="section-title">
              Vendas Adicionais (Comissões de Fornecedores)
            </h3>

            <div className="additional-sales-grid">
              <InputField
                label="Supermercado"
                type="number"
                value={String(formData.additionalSales?.supermarket || 0)}
                onChange={(value) =>
                  handleAdditionalSaleChange(
                    "supermarket",
                    parseFloat(value) || 0
                  )
                }
                disabled={isReadOnly}
              />

              <InputField
                label="Pescados"
                type="number"
                value={String(formData.additionalSales?.seafood || 0)}
                onChange={(value) =>
                  handleAdditionalSaleChange("seafood", parseFloat(value) || 0)
                }
                disabled={isReadOnly}
              />

              <InputField
                label="Pescados/Carne"
                type="number"
                value={String(formData.additionalSales?.seafoodMeat || 0)}
                onChange={(value) =>
                  handleAdditionalSaleChange(
                    "seafoodMeat",
                    parseFloat(value) || 0
                  )
                }
                disabled={isReadOnly}
              />

              <InputField
                label="Transfer"
                type="number"
                value={String(formData.additionalSales?.transfer || 0)}
                onChange={(value) =>
                  handleAdditionalSaleChange("transfer", parseFloat(value) || 0)
                }
                disabled={isReadOnly}
              />

              <InputField
                label="Hortaliças"
                type="number"
                value={String(formData.additionalSales?.vegetables || 0)}
                onChange={(value) =>
                  handleAdditionalSaleChange(
                    "vegetables",
                    parseFloat(value) || 0
                  )
                }
                disabled={isReadOnly}
              />

              <InputField
                label="Cocos"
                type="number"
                value={String(formData.additionalSales?.coconuts || 0)}
                onChange={(value) =>
                  handleAdditionalSaleChange("coconuts", parseFloat(value) || 0)
                }
                disabled={isReadOnly}
              />
            </div>

            <div className="calculated-value">
              <span className="calc-label">Total de Vendas Adicionais:</span>
              <span className="calc-value">
                {formatCurrency(calculatedValues.totalAdditionalSales)}
              </span>
            </div>
          </div>

          {/* Seção 7: Totais */}
          <div className="form-section full-width totals-section">
            <h3 className="section-title">Resumo Financeiro</h3>

            <div className="totals-grid">
              <div className="total-card">
                <span className="total-label">Total de Faturamento</span>
                <span className="total-value primary">
                  {formatCurrency(calculatedValues.totalRevenue)}
                </span>
              </div>

              <div className="total-card">
                <span className="total-label">Margem de Contribuição</span>
                <span className="total-value success">
                  {formatCurrency(calculatedValues.contributionMargin)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" onClick={onClose} className="cancel-btn">
            {isReadOnly ? "Fechar" : "Cancelar"}
          </Button>
          {!isReadOnly && (
            <Button type="submit" disabled={loading} className="save-btn">
              {loading
                ? "Salvando..."
                : isEditing
                ? "Salvar Alterações"
                : "Criar Venda"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

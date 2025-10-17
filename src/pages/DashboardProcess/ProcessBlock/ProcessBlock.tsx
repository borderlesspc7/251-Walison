import React, { useState } from "react";
import {
  FiChevronRight,
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiHome,
  FiCalendar,
  FiArrowRight,
  FiCheckCircle,
  FiList,
  FiEdit3,
  FiX,
} from "react-icons/fi";
import type {
  ConciergeProcess,
  ProcessStep,
  Priority,
} from "../../../types/processDashboard";
import * as processDashboardService from "../../../services/processDashboardService";
import "./ProcessBlock.css";

interface ProcessBlockProps {
  processes: ConciergeProcess[];
  loading?: boolean;
  onRefresh: () => void;
}

interface StepModalData {
  processId: string;
  step: ProcessStep;
  stepLabel: string;
}

const ProcessBlock: React.FC<ProcessBlockProps> = ({
  processes,
  loading = false,
  onRefresh,
}) => {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [stepModal, setStepModal] = useState<StepModalData | null>(null);
  const [stepNotes, setStepNotes] = useState("");
  const [advancing, setAdvancing] = useState(false);

  const STEP_LABELS: Record<ProcessStep, string> = {
    menu_sent: "Cardápio Enviado",
    menu_received: "Cardápio Recebido",
    shopping_list: "Lista de Compras",
    client_approval: "Aprovação do Cliente",
    supplier_sent: "Fornecedor Enviado",
    payment_sent: "Pagamento Enviado",
    invoices_received: "Faturas Recebidas",
    receipts_sent: "Recibos Enviados",
  };

  const STEP_ORDER: ProcessStep[] = [
    "menu_sent",
    "menu_received",
    "shopping_list",
    "client_approval",
    "supplier_sent",
    "payment_sent",
    "invoices_received",
    "receipts_sent",
  ];

  // Mapeamento de snake_case para camelCase
  const STEP_KEY_MAP: Record<ProcessStep, keyof ConciergeProcess["steps"]> = {
    menu_sent: "menuSent",
    menu_received: "menuReceived",
    shopping_list: "shoppingList",
    client_approval: "clientApproval",
    supplier_sent: "supplierSent",
    payment_sent: "paymentSent",
    invoices_received: "invoicesReceived",
    receipts_sent: "receiptsSent",
  };

  const getPriorityColor = (priority: Priority): string => {
    const colors: Record<Priority, string> = {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#ef4444",
      urgent: "#dc2626",
    };
    return colors[priority];
  };

  // Função para obter label da prioridade
  const getPriorityLabel = (priority: Priority): string => {
    const labels: Record<Priority, string> = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      urgent: "Urgente",
    };
    return labels[priority];
  };

  // Função para formatar data
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysUntilCheckIn = (checkIn: Date): number => {
    const now = new Date();
    const checkInDate = new Date(checkIn);
    const diffTime = checkInDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getNextStep = (currentStep: ProcessStep): ProcessStep | null => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex === STEP_ORDER.length - 1) {
      return null;
    }
    return STEP_ORDER[currentIndex + 1];
  };

  const handleAdvanceStep = (processId: string, currentStep: ProcessStep) => {
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      setStepModal({
        processId,
        step: nextStep,
        stepLabel: STEP_LABELS[nextStep],
      });
      setStepNotes("");
    }
  };

  const confirmAdvanceStep = async () => {
    if (!stepModal) return;

    try {
      setAdvancing(true);
      await processDashboardService.advanceProcessStep(
        stepModal.processId,
        stepModal.step,
        stepNotes || undefined
      );
      setStepModal(null);
      setStepNotes("");
      onRefresh();
    } catch (error) {
      console.error("Erro ao avançar etapa:", error);
    } finally {
      setAdvancing(false);
    }
  };

  const cancelModal = () => {
    setStepModal(null);
    setStepNotes("");
  };

  const toggleProcessDetails = (processId: string) => {
    setSelectedProcess(selectedProcess === processId ? null : processId);
  };

  const renderStepProgress = (process: ConciergeProcess) => {
    const completedSteps = STEP_ORDER.filter(
      (step) => process.steps[STEP_KEY_MAP[step]].completed
    ).length;
    const progress = (completedSteps / STEP_ORDER.length) * 100;

    return (
      <div className="step-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">
          {completedSteps} de {STEP_ORDER.length} etapas
        </span>
      </div>
    );
  };

  const renderProcessSteps = (process: ConciergeProcess) => {
    return (
      <div className="process-steps">
        {STEP_ORDER.map((step, index) => {
          const stepData = process.steps[STEP_KEY_MAP[step]];
          const isCurrentStep = process.currentStep === step;
          const isCompleted = stepData.completed;
          const isNext =
            index > 0 && STEP_ORDER[index - 1] === process.currentStep;

          return (
            <div
              key={step}
              className={`step-item ${isCompleted ? "completed" : ""} ${
                isCurrentStep ? "current" : ""
              } ${isNext ? "next" : ""}`}
            >
              <div className="step-icon">
                {isCompleted ? (
                  <FiCheckCircle size={20} />
                ) : isCurrentStep ? (
                  <FiClock size={20} />
                ) : (
                  <div className="step-number">{index + 1}</div>
                )}
              </div>
              <div className="step-info">
                <h4>{STEP_LABELS[step]}</h4>
                {stepData.completedAt && (
                  <span className="step-date">
                    {formatDate(stepData.completedAt)}
                  </span>
                )}
                {stepData.notes && (
                  <p className="step-notes">{stepData.notes}</p>
                )}
              </div>
              {index < STEP_ORDER.length - 1 && (
                <FiChevronRight className="step-arrow" size={16} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="process-block">
        <div className="block-header">
          <div className="skeleton-title"></div>
        </div>
        <div className="processes-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="process-card loading">
              <div className="skeleton-content"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <div className="process-block">
        <div className="block-header">
          <h2>
            <FiList size={20} />
            Processos de Concierge
          </h2>
        </div>
        <div className="empty-state">
          <FiCheckCircle size={60} />
          <h3>Nenhum processo encontrado</h3>
          <p>Não há processos de concierge para os filtros selecionados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="process-block">
      <div className="block-header">
        <h2>
          <FiList size={24} />
          Processos de Concierge
        </h2>
        <span className="process-count">
          {processes.length} {processes.length > 1 ? "processos" : "processo"}
        </span>
      </div>

      <div className="processes-list">
        {processes.map((process) => {
          const isExpanded = selectedProcess === process.id;
          const daysUntilCheckIn = getDaysUntilCheckIn(process.checkIn);
          const isUrgent = daysUntilCheckIn <= 3;
          const nextStep = getNextStep(process.currentStep);

          return (
            <div
              key={process.id}
              className={`process-card ${process.status} ${
                isUrgent ? "urgent" : ""
              }`}
            >
              <div
                className="card-header"
                onClick={() => toggleProcessDetails(process.id)}
              >
                <div className="card-main-info">
                  <div className="client-info">
                    <FiUser size={18} />
                    <h3>{process.clientName}</h3>
                  </div>
                  <div className="house-info">
                    <FiHome size={18} />
                    <span>{process.houseName}</span>
                  </div>
                </div>

                <div className="card-meta">
                  <div
                    className="priority-badge"
                    style={{
                      backgroundColor: getPriorityColor(process.priority),
                      color: "white",
                    }}
                  >
                    {getPriorityLabel(process.priority)}
                  </div>

                  <div className="checkin-info">
                    <FiCalendar size={14} />
                    <span>{formatDate(process.checkIn)}</span>
                    {isUrgent && (
                      <span className="urgent-badge">
                        <FiAlertTriangle size={14} />
                        {daysUntilCheckIn} dias
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-progress">
                {renderStepProgress(process)}
                <div className="current-step-badge">
                  {STEP_LABELS[process.currentStep]}
                </div>
              </div>

              <div className="card-actions">
                {nextStep && process.status === "in_progress" && (
                  <button
                    className="advance-btn"
                    onClick={() =>
                      handleAdvanceStep(process.id, process.currentStep)
                    }
                  >
                    <FiArrowRight size={16} />
                    Avançar para {STEP_LABELS[nextStep]}
                  </button>
                )}

                <button
                  className="details-btn"
                  onClick={() => toggleProcessDetails(process.id)}
                >
                  <FiEdit3 size={16} />
                  {isExpanded ? "Ocultar" : "Ver"} Detalhes
                </button>
              </div>

              {isExpanded && (
                <div className="card-details">
                  <div className="details-header">
                    <h4>Etapas do Processo</h4>
                    <div className="process-metrics">
                      <div className="metric">
                        <span className="metric-label">Tempo Total: </span>
                        <span className="metric-value">
                          {Math.round(process.metrics.totalDuration)}h
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">
                          Etapas Concluidas:{" "}
                        </span>
                        <span className="metric-value">
                          {process.metrics.completedSteps}/
                          {process.metrics.totalSteps}
                        </span>
                      </div>
                      {process.metrics.overdueSteps > 0 && (
                        <div className="metric warning">
                          <FiAlertTriangle size={14} />
                          <span className="metric-value">
                            {process.metrics.overdueSteps} atrasadas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {renderProcessSteps(process)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {stepModal && (
        <div className="modal-overlay" onClick={cancelModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Avançar Etapa</h3>
              <button className="close-btn" onClick={cancelModal}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>Confirma o avanço para a etapa: </p>
              <div className="step-highlight">
                <FiArrowRight size={20} />
                <strong>{stepModal.stepLabel}</strong>
              </div>

              <div className="notes-input">
                <label> Observações (Opcional):</label>
                <textarea
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Adicione observações sobre esta etapa..."
                  rows={4}
                  disabled={advancing}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={cancelModal}
                disabled={advancing}
              >
                Cancelar
              </button>
              <button
                className="confirm-btn"
                onClick={confirmAdvanceStep}
                disabled={advancing}
              >
                {advancing ? "Avançando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessBlock;

// Tipos básicos
export type ProcessStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ProcessStep =
  | "menu_sent"
  | "menu_received"
  | "shopping_list"
  | "client_approval"
  | "supplier_sent"
  | "payment_sent"
  | "invoices_received"
  | "receipts_sent";
export type NotificationType =
  | "concierge_reminder"
  | "payment_reminder"
  | "process_update"
  | "deadline_warning";
export type Priority = "low" | "medium" | "high" | "urgent";

// Interface para reservas futuras
export interface FutureReservation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  houseId: string;
  houseName: string;
  checkIn: Date;
  checkOut: Date;
  totalDays: number;
  totalValue: number;
  conciergeRequired: boolean;
  conciergeProcessId?: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// Interface para processo de concierge
export interface ConciergeProcess {
  id: string;
  reservationId: string;
  clientName: string;
  houseName: string;
  checkIn: Date;
  checkOut: Date;
  currentStep: ProcessStep;
  status: ProcessStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;

  // Etapas do processo
  steps: {
    menuSent: {
      completed: boolean;
      completedAt?: Date;
      notes?: string;
    };
    menuReceived: {
      completed: boolean;
      completedAt?: Date;
      notes?: string;
    };
    shoppingList: {
      completed: boolean;
      completedAt?: Date;
      notes?: string;
      listItems?: string[];
    };
    clientApproval: {
      completed: boolean;
      completedAt?: Date;
      notes?: string;
      approved?: boolean;
    };
    supplierSent: {
      completed: boolean;
      completedAt?: Date;
      notes?: string;
      suppliers?: string[];
    };
    paymentSent: {
      completed: boolean;
      completedAt?: Date;
      notes?: string;
      amount?: number;
    };
    invoicesReceived: {
      completed: boolean;
      completedAt?: Date;
      notes?: string;
      invoiceCount?: number;
    };
    receiptsSent: {
      completed: boolean;
      completedAt?: Date;
      notes?: string;
    };
  };

  // Métricas de tempo
  metrics: {
    totalDuration: number; // em horas
    averageStepTime: number; // em horas
    overdueSteps: number;
    completedSteps: number;
    totalSteps: number;
  };
}

// Interface para notificações
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: Priority;
  relatedId: string; // ID do processo ou reserva
  relatedType: "reservation" | "concierge_process";
  isRead: boolean;
  isActive: boolean;
  createdAt: Date;
  scheduledFor?: Date; // Para notificações agendadas
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: {
    clientName?: string;
    houseName?: string;
    daysUntilCheckIn?: number;
    processStep?: ProcessStep;
    amount?: number;
  };
}

// Interface para métricas do dashboard
export interface ProcessMetrics {
  totalReservations: number;
  activeConciergeProcesses: number;
  completedProcesses: number;
  overdueProcesses: number;
  averageProcessTime: number; // em horas
  completionRate: number; // porcentagem

  // Por período
  thisMonth: {
    newReservations: number;
    completedProcesses: number;
    averageTime: number;
  };

  lastMonth: {
    newReservations: number;
    completedProcesses: number;
    averageTime: number;
  };

  // Por casa
  byHouse: Array<{
    houseId: string;
    houseName: string;
    totalProcesses: number;
    completedProcesses: number;
    averageTime: number;
    completionRate: number;
  }>;
}

// Interface para filtros
export interface ProcessFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  houseId?: string;
  status?: ProcessStatus;
  priority?: Priority;
  step?: ProcessStep;
  showOnlyActive: boolean;
  showOnlyOverdue: boolean;
}

// Tipos específicos para dados de gráficos
export interface ProcessCompletionData {
  date: string;
  completed: number;
  pending: number;
  overdue: number;
}

export interface StepPerformanceData {
  step: ProcessStep;
  stepLabel: string;
  averageTime: number;
  completionRate: number;
  totalProcesses: number;
}

export interface HousePerformanceData {
  houseId: string;
  houseName: string;
  totalProcesses: number;
  completedProcesses: number;
  completionRate: number;
  averageTime: number;
}

// Interface para dados de gráficos
export interface ProcessChartsData {
  processCompletion: ProcessCompletionData[];
  stepPerformance: StepPerformanceData[];
  housePerformance: HousePerformanceData[];
}

// Interface principal dos dados do dashboard
export interface ProcessDashboardData {
  reservations: FutureReservation[];
  conciergeProcesses: ConciergeProcess[];
  notifications: Notification[];
  metrics: ProcessMetrics;
  charts: ProcessChartsData;
}

// Interface para configurações do dashboard
export interface ProcessDashboardConfig {
  refreshInterval: number; // em minutos
  autoRefresh: boolean;
  showNotifications: boolean;
  defaultFilters: ProcessFilters;
  chartPreferences: {
    showProcessFlow: boolean;
    showPerformanceMetrics: boolean;
    showHouseComparison: boolean;
  };
}

// Tipos específicos para ações
export type ProcessActionType =
  | "advance_step"
  | "complete_process"
  | "add_note"
  | "send_notification";

export interface AdvanceStepAction {
  type: "advance_step";
  processId: string;
  step: ProcessStep;
  notes?: string;
  timestamp: Date;
  userId: string;
}

export interface CompleteProcessAction {
  type: "complete_process";
  processId: string;
  finalNotes?: string;
  timestamp: Date;
  userId: string;
}

export interface AddNoteAction {
  type: "add_note";
  processId: string;
  step: ProcessStep;
  note: string;
  timestamp: Date;
  userId: string;
}

export interface SendNotificationAction {
  type: "send_notification";
  processId: string;
  notificationType: NotificationType;
  message: string;
  timestamp: Date;
  userId: string;
}

export type ProcessAction =
  | AdvanceStepAction
  | CompleteProcessAction
  | AddNoteAction
  | SendNotificationAction;

// Tipos específicos para relatórios
export type ReportType =
  | "performance"
  | "completion"
  | "overdue"
  | "house_analysis";

export interface PerformanceReportData {
  totalProcesses: number;
  completedProcesses: number;
  averageCompletionTime: number;
  completionRate: number;
  stepBreakdown: StepPerformanceData[];
}

export interface CompletionReportData {
  period: {
    start: Date;
    end: Date;
  };
  completedProcesses: number;
  averageTime: number;
  byHouse: HousePerformanceData[];
}

export interface OverdueReportData {
  overdueProcesses: ConciergeProcess[];
  overdueSteps: Array<{
    processId: string;
    step: ProcessStep;
    daysOverdue: number;
  }>;
}

export interface HouseAnalysisReportData {
  houseId: string;
  houseName: string;
  totalProcesses: number;
  completedProcesses: number;
  averageTime: number;
  completionRate: number;
  stepPerformance: StepPerformanceData[];
  monthlyTrends: ProcessCompletionData[];
}

export type ReportData =
  | PerformanceReportData
  | CompletionReportData
  | OverdueReportData
  | HouseAnalysisReportData;

export interface ProcessReport {
  id: string;
  title: string;
  type: ReportType;
  data: ReportData;
  generatedAt: Date;
  filters: ProcessFilters;
}

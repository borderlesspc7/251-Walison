import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  ProcessDashboardData,
  FutureReservation,
  ConciergeProcess,
  Notification,
  ProcessMetrics,
  ProcessFilters,
  ProcessChartsData,
  ProcessStep,
  NotificationType,
  Priority,
  ProcessCompletionData,
  StepPerformanceData,
  HousePerformanceData,
} from "../types/processDashboard";

// Constantes para o processo de concierge
const CONCIERGE_STEPS: ProcessStep[] = [
  "menu_sent",
  "menu_received",
  "shopping_list",
  "client_approval",
  "supplier_sent",
  "payment_sent",
  "invoices_received",
  "receipts_sent",
];

const STEP_LABELS: Record<ProcessStep, string> = {
  menu_sent: "Cardápio Enviado",
  menu_received: "Cardápio Recebido",
  shopping_list: "Lista de Compras",
  client_approval: "Aprovação do Cliente",
  supplier_sent: "Enviado para Fornecedores",
  payment_sent: "Notas para Pagamento",
  invoices_received: "Notas Recebidas",
  receipts_sent: "Comprovante Enviado",
};

// Função para converter Timestamp do Firebase para Date
const convertTimestamp = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
};

// Função para converter Date para Timestamp do Firebase
const convertToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Buscar reservas futuras
export const getFutureReservations = async (
  filters: ProcessFilters
): Promise<FutureReservation[]> => {
  try {
    const reservationsRef = collection(db, "sales");
    const q = query(
      reservationsRef,
      where("checkIn", ">=", convertToTimestamp(filters.dateRange.start)),
      where("checkIn", "<=", convertToTimestamp(filters.dateRange.end)),
      orderBy("checkIn", "asc")
    );

    const snapshot = await getDocs(q);
    const reservations: FutureReservation[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Filtrar por casa se especificado
      if (filters.houseId && data.houseId !== filters.houseId) {
        return;
      }

      // Filtrar por status se especificado
      if (filters.status && data.status !== filters.status) {
        return;
      }

      const reservation: FutureReservation = {
        id: doc.id,
        clientName: data.clientName || "",
        clientEmail: data.clientEmail || "",
        clientPhone: data.clientPhone || "",
        houseId: data.houseId || "",
        houseName: data.houseName || "",
        checkIn: convertTimestamp(data.checkIn),
        checkOut: convertTimestamp(data.checkOut),
        totalDays: data.totalDays || 0,
        totalValue: data.totalValue || 0,
        conciergeRequired: data.conciergeRequired || false,
        conciergeProcessId: data.conciergeProcessId || undefined,
        status: data.status || "pending",
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };

      reservations.push(reservation);
    });

    return reservations;
  } catch (error) {
    console.error("Erro ao buscar reservas futuras:", error);
    throw new Error("Falha ao carregar reservas futuras");
  }
};

// Buscar processos de concierge
export const getConciergeProcesses = async (
  filters: ProcessFilters
): Promise<ConciergeProcess[]> => {
  try {
    const processesRef = collection(db, "conciergeProcesses");
    let q = query(
      processesRef,
      where("createdAt", ">=", convertToTimestamp(filters.dateRange.start)),
      where("createdAt", "<=", convertToTimestamp(filters.dateRange.end)),
      orderBy("createdAt", "desc")
    );

    // Aplicar filtros adicionais
    if (filters.houseId) {
      q = query(q, where("houseId", "==", filters.houseId));
    }

    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }

    if (filters.priority) {
      q = query(q, where("priority", "==", filters.priority));
    }

    if (filters.step) {
      q = query(q, where("currentStep", "==", filters.step));
    }

    const snapshot = await getDocs(q);
    const processes: ConciergeProcess[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      const process: ConciergeProcess = {
        id: doc.id,
        reservationId: data.reservationId || "",
        clientName: data.clientName || "",
        houseName: data.houseName || "",
        checkIn: convertTimestamp(data.checkIn),
        checkOut: convertTimestamp(data.checkOut),
        currentStep: data.currentStep || "menu_sent",
        status: data.status || "pending",
        priority: data.priority || "medium",
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        steps: {
          menuSent: {
            completed: data.steps?.menuSent?.completed || false,
            completedAt: data.steps?.menuSent?.completedAt
              ? convertTimestamp(data.steps.menuSent.completedAt)
              : undefined,
            notes: data.steps?.menuSent?.notes || undefined,
          },
          menuReceived: {
            completed: data.steps?.menuReceived?.completed || false,
            completedAt: data.steps?.menuReceived?.completedAt
              ? convertTimestamp(data.steps.menuReceived.completedAt)
              : undefined,
            notes: data.steps?.menuReceived?.notes || undefined,
          },
          shoppingList: {
            completed: data.steps?.shoppingList?.completed || false,
            completedAt: data.steps?.shoppingList?.completedAt
              ? convertTimestamp(data.steps.shoppingList.completedAt)
              : undefined,
            notes: data.steps?.shoppingList?.notes || undefined,
            listItems: data.steps?.shoppingList?.listItems || undefined,
          },
          clientApproval: {
            completed: data.steps?.clientApproval?.completed || false,
            completedAt: data.steps?.clientApproval?.completedAt
              ? convertTimestamp(data.steps.clientApproval.completedAt)
              : undefined,
            notes: data.steps?.clientApproval?.notes || undefined,
            approved: data.steps?.clientApproval?.approved || undefined,
          },
          supplierSent: {
            completed: data.steps?.supplierSent?.completed || false,
            completedAt: data.steps?.supplierSent?.completedAt
              ? convertTimestamp(data.steps.supplierSent.completedAt)
              : undefined,
            notes: data.steps?.supplierSent?.notes || undefined,
            suppliers: data.steps?.supplierSent?.suppliers || undefined,
          },
          paymentSent: {
            completed: data.steps?.paymentSent?.completed || false,
            completedAt: data.steps?.paymentSent?.completedAt
              ? convertTimestamp(data.steps.paymentSent.completedAt)
              : undefined,
            notes: data.steps?.paymentSent?.notes || undefined,
            amount: data.steps?.paymentSent?.amount || undefined,
          },
          invoicesReceived: {
            completed: data.steps?.invoicesReceived?.completed || false,
            completedAt: data.steps?.invoicesReceived?.completedAt
              ? convertTimestamp(data.steps.invoicesReceived.completedAt)
              : undefined,
            notes: data.steps?.invoicesReceived?.notes || undefined,
            invoiceCount:
              data.steps?.invoicesReceived?.invoiceCount || undefined,
          },
          receiptsSent: {
            completed: data.steps?.receiptsSent?.completed || false,
            completedAt: data.steps?.receiptsSent?.completedAt
              ? convertTimestamp(data.steps.receiptsSent.completedAt)
              : undefined,
            notes: data.steps?.receiptsSent?.notes || undefined,
          },
        },
        metrics: {
          totalDuration: data.metrics?.totalDuration || 0,
          averageStepTime: data.metrics?.averageStepTime || 0,
          overdueSteps: data.metrics?.overdueSteps || 0,
          completedSteps: data.metrics?.completedSteps || 0,
          totalSteps: CONCIERGE_STEPS.length,
        },
      };

      processes.push(process);
    });

    return processes;
  } catch (error) {
    console.error("Erro ao buscar processos de concierge:", error);
    throw new Error("Falha ao carregar processos de concierge");
  }
};

// Buscar notificações
export const getNotifications = async (
  filters: ProcessFilters
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("createdAt", ">=", convertToTimestamp(filters.dateRange.start)),
      where("createdAt", "<=", convertToTimestamp(filters.dateRange.end)),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const notifications: Notification[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      const notification: Notification = {
        id: doc.id,
        type: data.type || "process_update",
        title: data.title || "",
        message: data.message || "",
        priority: data.priority || "medium",
        relatedId: data.relatedId || "",
        relatedType: data.relatedType || "concierge_process",
        isRead: data.isRead || false,
        isActive: data.isActive || true,
        createdAt: convertTimestamp(data.createdAt),
        scheduledFor: data.scheduledFor
          ? convertTimestamp(data.scheduledFor)
          : undefined,
        actionRequired: data.actionRequired || false,
        actionUrl: data.actionUrl || undefined,
        metadata: data.metadata || undefined,
      };

      notifications.push(notification);
    });

    return notifications;
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    throw new Error("Falha ao carregar notificações");
  }
};

// Calcular métricas do dashboard
export const calculateProcessMetrics = (
  reservations: FutureReservation[],
  processes: ConciergeProcess[]
): ProcessMetrics => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Métricas gerais
  const totalReservations = reservations.length;
  const activeConciergeProcesses = processes.filter(
    (p) => p.status === "in_progress"
  ).length;
  const completedProcesses = processes.filter(
    (p) => p.status === "completed"
  ).length;
  const overdueProcesses = processes.filter(
    (p) => p.metrics.overdueSteps > 0
  ).length;

  // Tempo médio de processo
  const completedProcessesWithTime = processes.filter(
    (p) => p.status === "completed" && p.metrics.totalDuration > 0
  );
  const averageProcessTime =
    completedProcessesWithTime.length > 0
      ? completedProcessesWithTime.reduce(
          (sum, p) => sum + p.metrics.totalDuration,
          0
        ) / completedProcessesWithTime.length
      : 0;

  // Taxa de conclusão
  const completionRate =
    processes.length > 0 ? (completedProcesses / processes.length) * 100 : 0;

  // Métricas do mês atual
  const thisMonthReservations = reservations.filter(
    (r) => r.createdAt >= thisMonth
  );
  const thisMonthProcesses = processes.filter((p) => p.createdAt >= thisMonth);
  const thisMonthCompleted = thisMonthProcesses.filter(
    (p) => p.status === "completed"
  );
  const thisMonthAverageTime =
    thisMonthCompleted.length > 0
      ? thisMonthCompleted.reduce(
          (sum, p) => sum + p.metrics.totalDuration,
          0
        ) / thisMonthCompleted.length
      : 0;

  // Métricas do mês passado
  const lastMonthReservations = reservations.filter(
    (r) => r.createdAt >= lastMonth && r.createdAt < thisMonth
  );
  const lastMonthProcesses = processes.filter(
    (p) => p.createdAt >= lastMonth && p.createdAt < thisMonth
  );
  const lastMonthCompleted = lastMonthProcesses.filter(
    (p) => p.status === "completed"
  );
  const lastMonthAverageTime =
    lastMonthCompleted.length > 0
      ? lastMonthCompleted.reduce(
          (sum, p) => sum + p.metrics.totalDuration,
          0
        ) / lastMonthCompleted.length
      : 0;

  // Métricas por casa
  const houseMap = new Map<
    string,
    { houseName: string; processes: ConciergeProcess[] }
  >();

  processes.forEach((process) => {
    if (!houseMap.has(process.houseName)) {
      houseMap.set(process.houseName, {
        houseName: process.houseName,
        processes: [],
      });
    }
    houseMap.get(process.houseName)!.processes.push(process);
  });

  const byHouse = Array.from(houseMap.values()).map((house) => {
    const totalProcesses = house.processes.length;
    const completedProcesses = house.processes.filter(
      (p) => p.status === "completed"
    ).length;
    const averageTime =
      completedProcesses > 0
        ? house.processes
            .filter((p) => p.status === "completed")
            .reduce((sum, p) => sum + p.metrics.totalDuration, 0) /
          completedProcesses
        : 0;
    const completionRate =
      totalProcesses > 0 ? (completedProcesses / totalProcesses) * 100 : 0;

    return {
      houseId: house.processes[0]?.houseName || "", // Usando houseName como ID temporário
      houseName: house.houseName,
      totalProcesses,
      completedProcesses,
      averageTime,
      completionRate,
    };
  });

  return {
    totalReservations,
    activeConciergeProcesses,
    completedProcesses,
    overdueProcesses,
    averageProcessTime,
    completionRate,
    thisMonth: {
      newReservations: thisMonthReservations.length,
      completedProcesses: thisMonthCompleted.length,
      averageTime: thisMonthAverageTime,
    },
    lastMonth: {
      newReservations: lastMonthReservations.length,
      completedProcesses: lastMonthCompleted.length,
      averageTime: lastMonthAverageTime,
    },
    byHouse,
  };
};

// Gerar dados para gráficos
export const generateChartsData = (
  reservations: FutureReservation[],
  processes: ConciergeProcess[]
): ProcessChartsData => {
  // Dados de conclusão de processos
  const processCompletion: ProcessCompletionData[] = [];
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(last30Days);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const dayProcesses = processes.filter((p) => {
      const processDate = new Date(p.createdAt);
      return processDate.toISOString().split("T")[0] === dateStr;
    });

    processCompletion.push({
      date: dateStr,
      completed: dayProcesses.filter((p) => p.status === "completed").length,
      pending: dayProcesses.filter((p) => p.status === "pending").length,
      overdue: dayProcesses.filter((p) => p.metrics.overdueSteps > 0).length,
    });
  }

  // Dados de performance por etapa
  const stepPerformance: StepPerformanceData[] = CONCIERGE_STEPS.map((step) => {
    const stepProcesses = processes.filter((p) => p.currentStep === step);
    const completedStepProcesses = processes.filter((p) => {
      const stepData = p.steps[step as keyof typeof p.steps];
      return stepData && stepData.completed;
    });

    const averageTime =
      completedStepProcesses.length > 0
        ? completedStepProcesses.reduce(
            (sum, p) => sum + p.metrics.averageStepTime,
            0
          ) / completedStepProcesses.length
        : 0;

    const completionRate =
      stepProcesses.length > 0
        ? (completedStepProcesses.length / stepProcesses.length) * 100
        : 0;

    return {
      step,
      stepLabel: STEP_LABELS[step],
      averageTime,
      completionRate,
      totalProcesses: stepProcesses.length,
    };
  });

  // Dados de performance por casa
  const houseMap = new Map<string, ConciergeProcess[]>();
  processes.forEach((process) => {
    if (!houseMap.has(process.houseName)) {
      houseMap.set(process.houseName, []);
    }
    houseMap.get(process.houseName)!.push(process);
  });

  const housePerformance: HousePerformanceData[] = Array.from(
    houseMap.entries()
  ).map(([houseName, houseProcesses]) => {
    const totalProcesses = houseProcesses.length;
    const completedProcesses = houseProcesses.filter(
      (p) => p.status === "completed"
    ).length;
    const averageTime =
      completedProcesses > 0
        ? houseProcesses
            .filter((p) => p.status === "completed")
            .reduce((sum, p) => sum + p.metrics.totalDuration, 0) /
          completedProcesses
        : 0;
    const completionRate =
      totalProcesses > 0 ? (completedProcesses / totalProcesses) * 100 : 0;

    return {
      houseId: houseName, // Usando houseName como ID temporário
      houseName,
      totalProcesses,
      completedProcesses,
      completionRate,
      averageTime,
    };
  });

  return {
    processCompletion,
    stepPerformance,
    housePerformance,
  };
};

// Função principal para buscar todos os dados do dashboard
export const getProcessDashboardData = async (
  filters: ProcessFilters
): Promise<ProcessDashboardData> => {
  try {
    const [reservations, processes, notifications] = await Promise.all([
      getFutureReservations(filters),
      getConciergeProcesses(filters),
      getNotifications(filters),
    ]);

    const metrics = calculateProcessMetrics(reservations, processes);
    const charts = generateChartsData(reservations, processes);

    return {
      reservations,
      conciergeProcesses: processes,
      notifications,
      metrics,
      charts,
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw new Error("Falha ao carregar dados do dashboard");
  }
};

// Criar notificação automática
export const createNotification = async (
  type: NotificationType,
  title: string,
  message: string,
  relatedId: string,
  relatedType: "reservation" | "concierge_process",
  priority: Priority = "medium",
  scheduledFor?: Date,
  metadata?: Record<string, unknown>
): Promise<void> => {
  try {
    const notificationsRef = collection(db, "notifications");

    const notificationData = {
      type,
      title,
      message,
      priority,
      relatedId,
      relatedType,
      isRead: false,
      isActive: true,
      createdAt: convertToTimestamp(new Date()),
      scheduledFor: scheduledFor ? convertToTimestamp(scheduledFor) : null,
      actionRequired: priority === "high" || priority === "urgent",
      actionUrl: undefined,
      metadata: metadata || null,
    };

    await addDoc(notificationsRef, notificationData);
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    throw new Error("Falha ao criar notificação");
  }
};

// Avançar etapa do processo
export const advanceProcessStep = async (
  processId: string,
  step: ProcessStep,
  notes?: string
): Promise<void> => {
  try {
    const processRef = doc(db, "conciergeProcesses", processId);

    const updateData: Record<string, unknown> = {
      currentStep: step,
      updatedAt: convertToTimestamp(new Date()),
      [`steps.${step}.completed`]: true,
      [`steps.${step}.completedAt`]: convertToTimestamp(new Date()),
    };

    if (notes) {
      updateData[`steps.${step}.notes`] = notes;
    }

    await updateDoc(processRef, updateData);

    // Criar notificação de atualização
    await createNotification(
      "process_update",
      "Processo Atualizado",
      `Etapa "${STEP_LABELS[step]}" foi concluída`,
      processId,
      "concierge_process",
      "medium"
    );
  } catch (error) {
    console.error("Erro ao avançar etapa do processo:", error);
    throw new Error("Falha ao atualizar processo");
  }
};

// Marcar notificação como lida
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: convertToTimestamp(new Date()),
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    throw new Error("Falha ao atualizar notificação");
  }
};

// Gerar notificações automáticas para reservas próximas
export const generateReservationNotifications = async (): Promise<void> => {
  try {
    const now = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    const reservations = await getFutureReservations({
      dateRange: {
        start: now,
        end: tenDaysFromNow,
      },
      showOnlyActive: true,
      showOnlyOverdue: false,
    });

    const batch = writeBatch(db);

    for (const reservation of reservations) {
      if (reservation.conciergeRequired && !reservation.conciergeProcessId) {
        // Criar notificação para processo de concierge
        const notificationRef = doc(collection(db, "notifications"));
        batch.set(notificationRef, {
          type: "concierge_reminder",
          title: "Lembrete de Concierge",
          message: `Cliente ${reservation.clientName} chega em ${Math.ceil(
            (reservation.checkIn.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )} dias. Processo de concierge necessário.`,
          priority: "high",
          relatedId: reservation.id,
          relatedType: "reservation",
          isRead: false,
          isActive: true,
          createdAt: convertToTimestamp(now),
          actionRequired: true,
          metadata: {
            clientName: reservation.clientName,
            houseName: reservation.houseName,
            daysUntilCheckIn: Math.ceil(
              (reservation.checkIn.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            ),
          },
        });
      }
    }

    await batch.commit();
  } catch (error) {
    console.error("Erro ao gerar notificações de reserva:", error);
    throw new Error("Falha ao gerar notificações automáticas");
  }
};

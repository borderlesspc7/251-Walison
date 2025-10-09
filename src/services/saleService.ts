import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Sale,
  CreateSaleData,
  UpdateSaleData,
  SaleFilters,
  SaleCalculations,
} from "../types/sale";
import { clientService } from "./clientService";
import { houseService } from "./houseService";

const COLLECTION_NAME = "sales";

// Função para calcular número de noites
const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Função para calcular valores automaticamente
export const calculateSaleValues = (
  checkInDate: Date,
  checkOutDate: Date,
  contractValue: number,
  discount: number = 0,
  housekeeperValue: number = 0,
  conciergeValue: number = 0,
  additionalSales: {
    supermarket?: number;
    seafood?: number;
    seafoodMeat?: number;
    transfer?: number;
    vegetables?: number;
    coconuts?: number;
  } = {}
): SaleCalculations => {
  const numberOfNights = calculateNights(checkInDate, checkOutDate);
  const netValue = contractValue - discount;
  const salesCommission = netValue * 0.1; // 10% do valor líquido

  const totalAdditionalSales =
    (additionalSales.supermarket || 0) +
    (additionalSales.seafood || 0) +
    (additionalSales.seafoodMeat || 0) +
    (additionalSales.transfer || 0) +
    (additionalSales.vegetables || 0) +
    (additionalSales.coconuts || 0);

  const totalRevenue = netValue + conciergeValue + totalAdditionalSales;

  const contributionMargin =
    netValue - salesCommission - housekeeperValue - totalAdditionalSales;

  return {
    numberOfNights,
    netValue,
    salesCommission,
    totalAdditionalSales,
    totalRevenue,
    contributionMargin,
  };
};

// Função auxiliar para converter dados do Firestore
const convertFirestoreData = (doc: DocumentSnapshot): Sale => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is undefined");
  }

  return {
    id: doc.id,
    code: data.code || "",
    company: data.company || "exclusive",
    clientId: data.clientId || "",
    clientName: data.clientName || "",
    clientCpf: data.clientCpf || "",
    clientPhone: data.clientPhone || "",
    clientEmail: data.clientEmail || "",
    clientGender: data.clientGender || "",
    saleOrigin: data.saleOrigin || "instagram",
    houseId: data.houseId || "",
    houseName: data.houseName || "",
    houseAddress: data.houseAddress || "",
    checkInDate: data.checkInDate?.toDate() || new Date(),
    checkOutDate: data.checkOutDate?.toDate() || new Date(),
    numberOfNights: data.numberOfNights || 0,
    numberOfGuests: data.numberOfGuests || 0,
    contractValue: data.contractValue || 0,
    discount: data.discount || 0,
    netValue: data.netValue || 0,
    salesCommission: data.salesCommission || 0,
    housekeeperValue: data.housekeeperValue || 0,
    conciergeValue: data.conciergeValue || 0,
    additionalSales: data.additionalSales || {
      supermarket: 0,
      seafood: 0,
      seafoodMeat: 0,
      transfer: 0,
      vegetables: 0,
      coconuts: 0,
    },
    totalAdditionalSales: data.totalAdditionalSales || 0,
    totalRevenue: data.totalRevenue || 0,
    contributionMargin: data.contributionMargin || 0,
    status: data.status || "pending",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Função auxiliar para preparar dados para o Firestore
const prepareDataForFirestore = async (
  data: CreateSaleData | Omit<UpdateSaleData, "id">
) => {
  const prepared: Record<string, unknown> = { ...data };

  // Converter datas para Timestamp do Firestore
  if ("checkInDate" in prepared && prepared.checkInDate) {
    prepared.checkInDate = Timestamp.fromDate(prepared.checkInDate as Date);
  }
  if ("checkOutDate" in prepared && prepared.checkOutDate) {
    prepared.checkOutDate = Timestamp.fromDate(prepared.checkOutDate as Date);
  }

  // Buscar dados do cliente se clientId foi fornecido
  if ("clientId" in prepared && prepared.clientId) {
    const client = await clientService.getById(prepared.clientId as string);
    if (client) {
      prepared.clientName = client.name;
      prepared.clientCpf = client.cpf;
      prepared.clientPhone = client.phone;
      prepared.clientEmail = client.email;
      prepared.clientGender = ""; // Campo será preenchido quando disponível no cadastro
    }
  }

  // Buscar dados da casa se houseId foi fornecido
  if ("houseId" in prepared && prepared.houseId) {
    const house = await houseService.getById(prepared.houseId as string);
    if (house) {
      prepared.houseName = house.houseName;
      prepared.houseAddress = `${house.address.street}, ${house.address.number} - ${house.address.city}/${house.address.state}`;
    }
  }

  // Calcular valores automaticamente
  if (
    "checkInDate" in prepared &&
    "checkOutDate" in prepared &&
    "contractValue" in prepared
  ) {
    const calculations = calculateSaleValues(
      prepared.checkInDate as Date,
      prepared.checkOutDate as Date,
      prepared.contractValue as number,
      (prepared.discount as number) || 0,
      (prepared.housekeeperValue as number) || 0,
      (prepared.conciergeValue as number) || 0,
      (prepared.additionalSales as Record<string, number>) || {}
    );

    prepared.numberOfNights = calculations.numberOfNights;
    prepared.netValue = calculations.netValue;
    prepared.salesCommission = calculations.salesCommission;
    prepared.totalAdditionalSales = calculations.totalAdditionalSales;
    prepared.totalRevenue = calculations.totalRevenue;
    prepared.contributionMargin = calculations.contributionMargin;
  }

  // Garantir que additionalSales existe
  if (!prepared.additionalSales) {
    prepared.additionalSales = {
      supermarket: 0,
      seafood: 0,
      seafoodMeat: 0,
      transfer: 0,
      vegetables: 0,
      coconuts: 0,
    };
  }

  return prepared;
};

export const saleService = {
  // Buscar todas as vendas
  async getAll(filters?: SaleFilters): Promise<Sale[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc")
      );

      // Aplicar filtros se fornecidos
      if (filters?.company) {
        q = query(q, where("company", "==", filters.company));
      }

      if (filters?.status) {
        q = query(q, where("status", "==", filters.status));
      }

      if (filters?.saleOrigin) {
        q = query(q, where("saleOrigin", "==", filters.saleOrigin));
      }

      const querySnapshot = await getDocs(q);
      let sales = querySnapshot.docs.map(convertFirestoreData);

      // Filtro de busca por texto (feito no cliente)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        sales = sales.filter(
          (sale) =>
            sale.code.toLowerCase().includes(searchLower) ||
            sale.clientName.toLowerCase().includes(searchLower) ||
            sale.houseName.toLowerCase().includes(searchLower) ||
            sale.clientCpf.includes(searchLower)
        );
      }

      // Filtro por intervalo de datas
      if (filters?.dateRange) {
        sales = sales.filter(
          (sale) =>
            sale.checkInDate >= filters.dateRange!.start &&
            sale.checkInDate <= filters.dateRange!.end
        );
      }

      return sales;
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      throw new Error("Falha ao carregar lista de vendas");
    }
  },

  // Buscar venda por ID
  async getById(id: string): Promise<Sale | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreData(docSnap);
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar venda:", error);
      throw new Error("Falha ao carregar dados da venda");
    }
  },

  // Criar nova venda
  async create(saleData: CreateSaleData): Promise<string> {
    try {
      // Gerar código único para a venda
      const code = await this.generateSaleCode();

      const dataToSave = await prepareDataForFirestore(saleData);

      const finalData = {
        ...dataToSave,
        code,
        status: saleData.status || "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), finalData);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar venda:", error);
      throw new Error("Falha ao criar venda");
    }
  },

  // Atualizar venda
  async update(saleData: UpdateSaleData): Promise<void> {
    try {
      const { id, ...updateData } = saleData;
      const docRef = doc(db, COLLECTION_NAME, id);

      const dataToSave = await prepareDataForFirestore(updateData);

      const finalData = {
        ...dataToSave,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, finalData);
    } catch (error) {
      console.error("Erro ao atualizar venda:", error);
      throw new Error("Falha ao atualizar venda");
    }
  },

  // Deletar venda
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao deletar venda:", error);
      throw new Error("Falha ao deletar venda");
    }
  },

  // Gerar código único para venda
  async generateSaleCode(): Promise<string> {
    try {
      const sales = await this.getAll();
      const lastSale = sales.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      if (!lastSale || !lastSale.code) {
        return "VND001";
      }

      const lastNumber = parseInt(lastSale.code.replace("VND", ""));
      const newNumber = lastNumber + 1;

      return `VND${newNumber.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      return "VND001";
    }
  },

  // Obter estatísticas
  async getStats(): Promise<{
    total: number;
    totalRevenue: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    averageTicket: number;
    totalCommissions: number;
    totalMargin: number;
  }> {
    try {
      const sales = await this.getAll();

      const totalRevenue = sales.reduce(
        (sum, sale) => sum + sale.totalRevenue,
        0
      );
      const totalCommissions = sales.reduce(
        (sum, sale) => sum + sale.salesCommission + sale.totalAdditionalSales,
        0
      );
      const totalMargin = sales.reduce(
        (sum, sale) => sum + sale.contributionMargin,
        0
      );

      return {
        total: sales.length,
        totalRevenue,
        pending: sales.filter((s) => s.status === "pending").length,
        confirmed: sales.filter((s) => s.status === "confirmed").length,
        cancelled: sales.filter((s) => s.status === "cancelled").length,
        completed: sales.filter((s) => s.status === "completed").length,
        averageTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
        totalCommissions,
        totalMargin,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error("Falha ao carregar estatísticas");
    }
  },

  // Verificar disponibilidade da casa nas datas
  async checkHouseAvailability(
    houseId: string,
    checkInDate: Date,
    checkOutDate: Date,
    excludeSaleId?: string
  ): Promise<boolean> {
    try {
      const sales = await this.getAll();

      const conflictingSales = sales.filter((sale) => {
        if (excludeSaleId && sale.id === excludeSaleId) return false;
        if (sale.houseId !== houseId) return false;
        if (sale.status === "cancelled") return false;

        // Verificar se há sobreposição de datas
        return (
          (checkInDate >= sale.checkInDate &&
            checkInDate < sale.checkOutDate) ||
          (checkOutDate > sale.checkInDate &&
            checkOutDate <= sale.checkOutDate) ||
          (checkInDate <= sale.checkInDate && checkOutDate >= sale.checkOutDate)
        );
      });

      return conflictingSales.length === 0;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
      return false;
    }
  },
};

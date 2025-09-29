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
  Supplier,
  CreateSupplierData,
  UpdateSupplierData,
  SupplierFilters,
} from "../types/supplier";

const COLLECTION_NAME = "suppliers";

// Função auxiliar para converter dados do Firestore
const convertFirestoreData = (doc: DocumentSnapshot): Supplier => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is undefined");
  }

  return {
    id: doc.id,
    code: data.code || "",
    establishmentName: data.establishmentName || "",
    serviceType: data.serviceType || "",
    bankData: data.bankData || {
      bank: "",
      agency: "",
      account: "",
      accountType: "checking",
    },
    pix: data.pix || "",
    commissionPercentage: data.commissionPercentage || 0,
    status: data.status || "active",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Função auxiliar para preparar dados para o Firestore
const prepareDataForFirestore = (
  data: CreateSupplierData | Omit<UpdateSupplierData, "id">
) => {
  return { ...data };
};

export const supplierService = {
  // Buscar todos os fornecedores
  async getAll(filters?: SupplierFilters): Promise<Supplier[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        orderBy("establishmentName")
      );

      // Aplicar filtros se fornecidos
      if (filters?.status) {
        q = query(q, where("status", "==", filters.status));
      }

      if (filters?.serviceType) {
        q = query(q, where("serviceType", "==", filters.serviceType));
      }

      if (filters?.bank) {
        q = query(q, where("bankData.bank", "==", filters.bank));
      }

      const querySnapshot = await getDocs(q);
      let suppliers = querySnapshot.docs.map(convertFirestoreData);

      // Filtro de busca por texto (feito no cliente pois o Firestore tem limitações)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        suppliers = suppliers.filter(
          (supplier) =>
            supplier.establishmentName.toLowerCase().includes(searchLower) ||
            supplier.serviceType.toLowerCase().includes(searchLower) ||
            supplier.bankData.bank.toLowerCase().includes(searchLower)
        );
      }

      return suppliers;
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      throw new Error("Falha ao carregar lista de fornecedores");
    }
  },

  // Buscar fornecedor por ID
  async getById(id: string): Promise<Supplier | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreData(docSnap);
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar fornecedor:", error);
      throw new Error("Falha ao carregar dados do fornecedor");
    }
  },

  // Criar novo fornecedor
  async create(supplierData: CreateSupplierData): Promise<string> {
    try {
      // Gerar código único para o fornecedor
      const code = await this.generateSupplierCode();

      const dataToSave = {
        ...prepareDataForFirestore(supplierData),
        code,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
      throw new Error("Falha ao criar fornecedor");
    }
  },

  // Atualizar fornecedor
  async update(supplierData: UpdateSupplierData): Promise<void> {
    try {
      const { id, ...updateData } = supplierData;
      const docRef = doc(db, COLLECTION_NAME, id);

      const dataToSave = {
        ...prepareDataForFirestore(updateData),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, dataToSave);
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      throw new Error("Falha ao atualizar fornecedor");
    }
  },

  // Deletar fornecedor
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao deletar fornecedor:", error);
      throw new Error("Falha ao deletar fornecedor");
    }
  },

  // Buscar fornecedores por nome (para autocomplete)
  async searchByName(name: string, limit: number = 10): Promise<Supplier[]> {
    try {
      const suppliers = await this.getAll();
      const filtered = suppliers
        .filter((supplier) =>
          supplier.establishmentName.toLowerCase().includes(name.toLowerCase())
        )
        .slice(0, limit);

      return filtered;
    } catch (error) {
      console.error("Erro ao buscar fornecedores por nome:", error);
      throw new Error("Falha na busca de fornecedores");
    }
  },

  // Verificar se PIX já existe
  async pixExists(pix: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("pix", "==", pix));
      const querySnapshot = await getDocs(q);

      if (excludeId) {
        return querySnapshot.docs.some((doc) => doc.id !== excludeId);
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erro ao verificar PIX:", error);
      return false;
    }
  },

  // Gerar código único para fornecedor
  async generateSupplierCode(): Promise<string> {
    try {
      const suppliers = await this.getAll();
      const lastSupplier = suppliers.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      if (!lastSupplier || !lastSupplier.code) {
        return "FOR001";
      }

      const lastNumber = parseInt(lastSupplier.code.replace("FOR", ""));
      const newNumber = lastNumber + 1;

      return `FOR${newNumber.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      return "FOR001";
    }
  },

  // Obter estatísticas básicas
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  }> {
    try {
      const suppliers = await this.getAll();

      return {
        total: suppliers.length,
        active: suppliers.filter((s) => s.status === "active").length,
        inactive: suppliers.filter((s) => s.status === "inactive").length,
        suspended: suppliers.filter((s) => s.status === "suspended").length,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error("Falha ao carregar estatísticas");
    }
  },
};

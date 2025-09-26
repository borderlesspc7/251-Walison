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
  Owner,
  CreateOwnerData,
  UpdateOwnerData,
  OwnerFilters,
} from "../types/owner";

const COLLECTION_NAME = "owners";

const convertFirestoreData = (doc: DocumentSnapshot): Owner => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is undefined");
  }

  return {
    id: doc.id,
    code: data.code || "",
    name: data.name || "",
    cpf: data.cpf || "",
    address: data.address || {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
    profession: data.profession || "",
    maritalStatus: data.maritalStatus || "single",
    phone: data.phone || "",
    bankData: data.bankData || {
      bank: "",
      agency: "",
      account: "",
      accountType: "checking",
    },
    pix: data.pix || "",
    commission: data.commission || 0,
    status: data.status || "active",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

const prepareDataForFirestore = (
  data: CreateOwnerData | Omit<UpdateOwnerData, "id">
) => {
  const prepared = { ...data };

  if ("birthDate" in prepared && prepared.birthDate) {
    (prepared as Record<string, unknown>).birthDate = Timestamp.fromDate(
      prepared.birthDate as Date
    );
  }

  return prepared;
};

export const ownerService = {
  // Buscar todos os proprietários
  async getAll(filters?: OwnerFilters): Promise<Owner[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));

      // Aplicar filtros se fornecidos
      if (filters?.status) {
        q = query(q, where("status", "==", filters.status));
      }

      if (filters?.city) {
        q = query(q, where("address.city", "==", filters.city));
      }

      if (filters?.state) {
        q = query(q, where("address.state", "==", filters.state));
      }

      if (filters?.bank) {
        q = query(q, where("bankData.bank", "==", filters.bank));
      }

      const querySnapshot = await getDocs(q);
      let owners = querySnapshot.docs.map(convertFirestoreData);

      // Filtros que precisam ser aplicados localmente
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        owners = owners.filter(
          (owner) =>
            owner.name.toLowerCase().includes(searchLower) ||
            owner.phone.includes(searchLower) ||
            owner.cpf.includes(searchLower) ||
            owner.pix.toLowerCase().includes(searchLower) ||
            owner.profession.toLowerCase().includes(searchLower)
        );
      }

      return owners;
    } catch (error) {
      console.error("Erro ao buscar proprietários:", error);
      throw new Error("Falha ao carregar lista de proprietários");
    }
  },

  // Buscar proprietário por ID
  async getById(id: string): Promise<Owner | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return convertFirestoreData(docSnap);
      } else {
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar proprietário:", error);
      throw new Error("Falha ao carregar dados do proprietário");
    }
  },

  // Criar novo proprietário
  async create(ownerData: CreateOwnerData): Promise<string> {
    try {
      const code = await this.generateOwnerCode();

      const dataToSave = {
        ...prepareDataForFirestore(ownerData),
        code,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar proprietário:", error);
      throw new Error("Falha ao criar proprietário");
    }
  },

  async update(ownerData: UpdateOwnerData): Promise<void> {
    try {
      const { id, ...updateData } = ownerData;
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...prepareDataForFirestore(updateData),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erro ao atualizar proprietário:", error);
      throw new Error("Falha ao atualizar proprietário");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao deletar proprietário:", error);
      throw new Error("Falha ao deletar proprietário");
    }
  },

  async checkCpfExists(cpf: string, excludeOwnerId?: string): Promise<boolean> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("cpf", "==", cpf));
      const querySnapshot = await getDocs(q);

      if (excludeOwnerId) {
        return querySnapshot.docs.some((doc) => doc.id !== excludeOwnerId);
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erro ao verificar CPF:", error);
      return false;
    }
  },

  async generateOwnerCode(): Promise<string> {
    try {
      const owners = await this.getAll();
      const lastOwner = owners.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      if (!lastOwner || !lastOwner.code) {
        return "PRO001";
      }

      const lastNumber = parseInt(lastOwner.code.replace("PRO", ""));
      const newNumber = lastNumber + 1;

      return `PRO${newNumber.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      return "PRO001";
    }
  },

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  }> {
    try {
      const owners = await this.getAll();

      return {
        total: owners.length,
        active: owners.filter((o) => o.status === "active").length,
        inactive: owners.filter((o) => o.status === "inactive").length,
        suspended: owners.filter((o) => o.status === "suspended").length,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error("Falha ao carregar estatísticas");
    }
  },
};

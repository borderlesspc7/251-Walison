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
  Client,
  CreateClientData,
  UpdateClientData,
  ClientFilters,
} from "../types/client";

const COLLECTION_NAME = "clients";

// Função auxiliar para converter dados do Firestore
const convertFirestoreData = (doc: DocumentSnapshot): Client => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is undefined");
  }

  return {
    id: doc.id,
    code: data.code || "",
    name: data.name || "",
    cpf: data.cpf || "",
    birthDate: data.birthDate?.toDate() || new Date(),
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
    email: data.email || "",
    status: data.status || "active",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Função auxiliar para preparar dados para o Firestore
const prepareDataForFirestore = (
  data: CreateClientData | Omit<UpdateClientData, "id">
) => {
  const prepared = { ...data };

  // Converter datas para Timestamp do Firestore
  if ("birthDate" in prepared && prepared.birthDate) {
    (prepared as Record<string, unknown>).birthDate = Timestamp.fromDate(
      prepared.birthDate
    );
  }

  return prepared;
};

export const clientService = {
  // Buscar todos os clientes
  async getAll(filters?: ClientFilters): Promise<Client[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy("name"));

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

      const querySnapshot = await getDocs(q);
      let clients = querySnapshot.docs.map(convertFirestoreData);

      // Filtro de busca por texto (feito no cliente pois o Firestore tem limitações)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        clients = clients.filter(
          (client) =>
            client.name.toLowerCase().includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower) ||
            client.phone.includes(searchLower) ||
            client.cpf.includes(searchLower) ||
            client.profession.toLowerCase().includes(searchLower)
        );
      }

      return clients;
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw new Error("Falha ao carregar lista de clientes");
    }
  },

  // Buscar cliente por ID
  async getById(id: string): Promise<Client | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreData(docSnap);
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      throw new Error("Falha ao carregar dados do cliente");
    }
  },

  // Criar novo cliente
  async create(clientData: CreateClientData): Promise<string> {
    try {
      // Gerar código único para o cliente
      const code = await this.generateClientCode();

      const dataToSave = {
        ...prepareDataForFirestore(clientData),
        code,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw new Error("Falha ao criar cliente");
    }
  },

  // Atualizar cliente
  async update(clientData: UpdateClientData): Promise<void> {
    try {
      const { id, ...updateData } = clientData;
      const docRef = doc(db, COLLECTION_NAME, id);

      const dataToSave = {
        ...prepareDataForFirestore(updateData),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, dataToSave);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw new Error("Falha ao atualizar cliente");
    }
  },

  // Deletar cliente
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      throw new Error("Falha ao deletar cliente");
    }
  },

  // Buscar clientes por nome (para autocomplete)
  async searchByName(name: string, limit: number = 10): Promise<Client[]> {
    try {
      const clients = await this.getAll();
      const filtered = clients
        .filter((client) =>
          client.name.toLowerCase().includes(name.toLowerCase())
        )
        .slice(0, limit);

      return filtered;
    } catch (error) {
      console.error("Erro ao buscar clientes por nome:", error);
      throw new Error("Falha na busca de clientes");
    }
  },

  // Verificar se email já existe
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);

      if (excludeId) {
        return querySnapshot.docs.some((doc) => doc.id !== excludeId);
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      return false;
    }
  },

  // Gerar código único para cliente
  async generateClientCode(): Promise<string> {
    try {
      const clients = await this.getAll();
      const lastClient = clients.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      if (!lastClient || !lastClient.code) {
        return "CLI001";
      }

      const lastNumber = parseInt(lastClient.code.replace("CLI", ""));
      const newNumber = lastNumber + 1;

      return `CLI${newNumber.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      return "CLI001";
    }
  },

  // Obter estatísticas básicas
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    prospects: number;
  }> {
    try {
      const clients = await this.getAll();

      return {
        total: clients.length,
        active: clients.filter((c) => c.status === "active").length,
        inactive: clients.filter((c) => c.status === "inactive").length,
        prospects: clients.filter((c) => c.status === "prospect").length,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error("Falha ao carregar estatísticas");
    }
  },
};

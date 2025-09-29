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
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeFilters,
} from "../types/employee";

const COLLECTION_NAME = "employees";

// Função auxiliar para converter dados do Firestore
const convertFirestoreData = (doc: DocumentSnapshot): Employee => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is undefined");
  }

  return {
    id: doc.id,
    name: data.name || "",
    rentalCommissionPercentage: data.rentalCommissionPercentage || 0,
    supplierCommissionPercentage: data.supplierCommissionPercentage || 0,
    status: data.status || "active",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Função auxiliar para preparar dados para o Firestore
const prepareDataForFirestore = (
  data: CreateEmployeeData | Omit<UpdateEmployeeData, "id">
) => {
  return { ...data };
};

export const employeeService = {
  // Buscar todos os colaboradores
  async getAll(filters?: EmployeeFilters): Promise<Employee[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy("name"));

      // Aplicar filtros se fornecidos
      if (filters?.status) {
        q = query(q, where("status", "==", filters.status));
      }

      const querySnapshot = await getDocs(q);
      let employees = querySnapshot.docs.map(convertFirestoreData);

      // Filtro de busca por texto (feito no cliente pois o Firestore tem limitações)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        employees = employees.filter((employee) =>
          employee.name.toLowerCase().includes(searchLower)
        );
      }

      return employees;
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
      throw new Error("Falha ao carregar lista de colaboradores");
    }
  },

  // Buscar colaborador por ID
  async getById(id: string): Promise<Employee | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreData(docSnap);
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar colaborador:", error);
      throw new Error("Falha ao carregar dados do colaborador");
    }
  },

  // Criar novo colaborador
  async create(employeeData: CreateEmployeeData): Promise<string> {
    try {
      const dataToSave = {
        ...prepareDataForFirestore(employeeData),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar colaborador:", error);
      throw new Error("Falha ao criar colaborador");
    }
  },

  // Atualizar colaborador
  async update(employeeData: UpdateEmployeeData): Promise<void> {
    try {
      const { id, ...updateData } = employeeData;
      const docRef = doc(db, COLLECTION_NAME, id);

      const dataToSave = {
        ...prepareDataForFirestore(updateData),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, dataToSave);
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      throw new Error("Falha ao atualizar colaborador");
    }
  },

  // Deletar colaborador
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao deletar colaborador:", error);
      throw new Error("Falha ao deletar colaborador");
    }
  },

  // Buscar colaboradores por nome (para autocomplete)
  async searchByName(name: string, limit: number = 10): Promise<Employee[]> {
    try {
      const employees = await this.getAll();
      const filtered = employees
        .filter((employee) =>
          employee.name.toLowerCase().includes(name.toLowerCase())
        )
        .slice(0, limit);

      return filtered;
    } catch (error) {
      console.error("Erro ao buscar colaboradores por nome:", error);
      throw new Error("Falha na busca de colaboradores");
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
      const employees = await this.getAll();

      return {
        total: employees.length,
        active: employees.filter((e) => e.status === "active").length,
        inactive: employees.filter((e) => e.status === "inactive").length,
        suspended: employees.filter((e) => e.status === "suspended").length,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error("Falha ao carregar estatísticas");
    }
  },
};

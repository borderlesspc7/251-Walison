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
  House,
  CreateHouseData,
  UpdateHouseData,
  HouseFilters,
} from "../types/house";

const COLLECTION_NAME = "houses";

const convertFirestoreData = (doc: DocumentSnapshot): House => {
  const data = doc.data();

  if (!data) {
    throw new Error("Data not found");
  }

  return {
    id: doc.id,
    code: data.code || "",
    houseName: data.houseName || "",
    address: data.address || {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
    internetPassword: data.internetPassword || "",
    photos: data.photos || [],
    description: data.description || "",
    observations: data.observations || "",
    pricing: data.pricing || {
      lowSeason: 0,
      midSeason: 0,
      highSeason: 0,
      carnivalPackage: 0,
      newYearPackage: 0,
    },
    status: data.status || "available",
    occupiedDates: Array.isArray(data.occupiedDates)
      ? data.occupiedDates.map((date: Timestamp) => date.toDate())
      : [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

const prepareDataForFirestore = (
  data: CreateHouseData | Omit<UpdateHouseData, "id">
) => {
  const prepared = { ...data };

  if ("occupiedDates" in prepared && prepared.occupiedDates) {
    // Verificar se occupiedDates existe e é um array
    if (
      Array.isArray(prepared.occupiedDates) &&
      prepared.occupiedDates.length > 0
    ) {
      (prepared as Record<string, unknown>).occupiedDates =
        prepared.occupiedDates.map((date) => Timestamp.fromDate(date));
    } else {
      // Se não tem datas ou é array vazio, enviar array vazio
      (prepared as Record<string, unknown>).occupiedDates = [];
    }
  }

  return prepared;
};

export const houseService = {
  // 1. BUSCAR TODAS AS CASAS
  async getAll(filters?: HouseFilters): Promise<House[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy("houseName"));

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
      let houses = querySnapshot.docs.map(convertFirestoreData);

      // Filtro de busca por texto (feito no cliente)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        houses = houses.filter(
          (house) =>
            house.houseName.toLowerCase().includes(searchLower) ||
            house.address.city.toLowerCase().includes(searchLower) ||
            house.address.neighborhood.toLowerCase().includes(searchLower) ||
            house.description.toLowerCase().includes(searchLower)
        );
      }

      // Filtro por faixa de preço
      if (filters?.priceRange) {
        houses = houses.filter((house) => {
          const minPrice = filters.priceRange!.min;
          const maxPrice = filters.priceRange!.max;
          return (
            house.pricing.lowSeason >= minPrice &&
            house.pricing.lowSeason <= maxPrice
          );
        });
      }

      return houses;
    } catch (error) {
      console.error("Erro ao buscar casas:", error);
      throw new Error("Falha ao carregar lista de casas");
    }
  },

  // 2. BUSCAR CASA POR ID
  async getById(id: string): Promise<House | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertFirestoreData(docSnap);
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar casa:", error);
      throw new Error("Falha ao carregar dados da casa");
    }
  },

  // 3. CRIAR NOVA CASA
  async create(houseData: CreateHouseData): Promise<string> {
    try {
      // Gerar código único para a casa
      const code = await this.generateHouseCode();

      const dataToSave = {
        ...prepareDataForFirestore(houseData),
        code,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar casa:", error);
      throw new Error("Falha ao criar casa");
    }
  },

  // 4. ATUALIZAR CASA
  async update(houseData: UpdateHouseData): Promise<void> {
    try {
      const { id, ...updateData } = houseData;
      const docRef = doc(db, COLLECTION_NAME, id);

      const dataToSave = {
        ...prepareDataForFirestore(updateData),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, dataToSave);
    } catch (error) {
      console.error("Erro ao atualizar casa:", error);
      throw new Error("Falha ao atualizar casa");
    }
  },

  // 5. DELETAR CASA
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao deletar casa:", error);
      throw new Error("Falha ao deletar casa");
    }
  },

  // 6. GERAR CÓDIGO ÚNICO
  async generateHouseCode(): Promise<string> {
    try {
      const houses = await this.getAll();
      const lastHouse = houses.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      if (!lastHouse || !lastHouse.code) {
        return "CASA001";
      }

      const lastNumber = parseInt(lastHouse.code.replace("CASA", ""));
      const newNumber = lastNumber + 1;

      return `CASA${newNumber.toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      return "CASA001";
    }
  },

  // 7. OBTER ESTATÍSTICAS
  async getStats(): Promise<{
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    inactive: number;
  }> {
    try {
      const houses = await this.getAll();

      return {
        total: houses.length,
        available: houses.filter((h) => h.status === "available").length,
        occupied: houses.filter((h) => h.status === "occupied").length,
        maintenance: houses.filter((h) => h.status === "maintenance").length,
        inactive: houses.filter((h) => h.status === "inactive").length,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error("Falha ao carregar estatísticas");
    }
  },
};

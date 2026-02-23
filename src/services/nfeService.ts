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
  NFe,
  CreateNFeData,
  UpdateNFeData,
  NFeFilters,
  NFeSequenceConfig,
  CompanyNFeConfig,
  NFeEmissionResponse,
  NFeReport,
} from "../types/nfe";
import { saleService } from "./saleService";

const COLLECTION_NAME = "nfes";
const SEQUENCE_CONFIG_COLLECTION = "nfe_sequences";
const COMPANY_CONFIG_COLLECTION = "company_nfe_configs";

// Converter dados do Firestore
const convertFirestoreData = (doc: DocumentSnapshot): NFe => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is undefined");
  }

  return {
    id: doc.id,
    number: data.number || 0,
    series: data.series || "1",
    code: data.code || "",
    company: data.company || "exclusive",
    companyName: data.companyName || "",
    companyCnpj: data.companyCnpj || "",
    clientId: data.clientId || "",
    clientName: data.clientName || "",
    clientCpf: data.clientCpf || "",
    clientEmail: data.clientEmail || "",
    saleId: data.saleId || "",
    saleCode: data.saleCode || "",
    houseId: data.houseId || "",
    houseName: data.houseName || "",
    checkInDate: data.checkInDate?.toDate() || new Date(),
    checkOutDate: data.checkOutDate?.toDate() || new Date(),
    numberOfNights: data.numberOfNights || 0,
    dailyRateValue: data.dailyRateValue || 0,
    conciergeValue: data.conciergeValue || 0,
    additionalServicesValue: data.additionalServicesValue || 0,
    discountValue: data.discountValue || 0,
    subtotal: data.subtotal || 0,
    taxValue: data.taxValue || 0,
    totalValue: data.totalValue || 0,
    issueDate: data.issueDate?.toDate() || new Date(),
    status: data.status || "pending",
    nfeNumber: data.nfeNumber,
    nfeKey: data.nfeKey,
    xmlContent: data.xmlContent,
    pdfUrl: data.pdfUrl,
    emissionError: data.emissionError,
    failureAttempts: data.failureAttempts || 0,
    lastAttemptDate: data.lastAttemptDate?.toDate(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Serviço de NFe
export const nfeService = {
  // Obter configuração da empresa (cria automaticamente se não existir)
  async getCompanyConfig(company: string): Promise<CompanyNFeConfig> {
    try {
      const q = query(
        collection(db, COMPANY_CONFIG_COLLECTION),
        where("company", "==", company)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as CompanyNFeConfig;
      }

      // Se não encontrar, criar configuração padrão
      console.warn(
        `Configuração não encontrada para ${company}. Criando configuração padrão...`
      );
      
      const defaultConfig = this.getDefaultCompanyConfig(company);
      
      // Salvar no Firestore
      await addDoc(collection(db, COMPANY_CONFIG_COLLECTION), {
        ...defaultConfig,
        createdAt: Timestamp.fromDate(defaultConfig.createdAt),
        updatedAt: Timestamp.fromDate(defaultConfig.updatedAt),
      });

      return defaultConfig;
    } catch (error) {
      console.error("Erro ao obter configuração da empresa:", error);
      throw error;
    }
  },

  // Obter configuração padrão para uma empresa
  getDefaultCompanyConfig(company: string): CompanyNFeConfig {
    const configs: Record<string, CompanyNFeConfig> = {
      exclusive: {
        company: "exclusive",
        companyName: "Exclusive Imóveis",
        cnpj: "00.000.000/0000-00",
        stateRegistration: "00.000.000.000.000",
        series: "1",
        autoIssue: true,
        sefazEnvironment: "sandbox",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      giogio: {
        company: "giogio",
        companyName: "Gio Gio Temporadas",
        cnpj: "00.000.000/0000-00",
        stateRegistration: "00.000.000.000.000",
        series: "1",
        autoIssue: true,
        sefazEnvironment: "sandbox",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      direta: {
        company: "direta",
        companyName: "Venda Direta",
        cnpj: "00.000.000/0000-00",
        stateRegistration: "00.000.000.000.000",
        series: "1",
        autoIssue: false,
        sefazEnvironment: "sandbox",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    return (
      configs[company] || {
        company: company as any,
        companyName: company,
        cnpj: "00.000.000/0000-00",
        stateRegistration: "00.000.000.000.000",
        series: "1",
        autoIssue: false,
        sefazEnvironment: "sandbox",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  },

  // Atualizar configuração da empresa
  async updateCompanyConfig(
    company: string,
    config: Partial<CompanyNFeConfig>
  ): Promise<void> {
    try {
      const q = query(
        collection(db, COMPANY_CONFIG_COLLECTION),
        where("company", "==", company)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...config,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar configuração da empresa:", error);
      throw error;
    }
  },

  // Obter próximo número de NF-e
  async getNextNFeNumber(
    company: string,
    series: string
  ): Promise<{ number: number; sequenceId: string }> {
    try {
      const q = query(
        collection(db, SEQUENCE_CONFIG_COLLECTION),
        where("company", "==", company),
        where("series", "==", series)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Criar nova sequência
        const newSequence: NFeSequenceConfig = {
          company: company as any,
          series,
          lastNumber: 1,
          lastIssueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const docRef = await addDoc(
          collection(db, SEQUENCE_CONFIG_COLLECTION),
          {
            ...newSequence,
            lastIssueDate: Timestamp.fromDate(newSequence.lastIssueDate),
            createdAt: Timestamp.fromDate(newSequence.createdAt),
            updatedAt: Timestamp.fromDate(newSequence.updatedAt),
          }
        );

        return { number: 1, sequenceId: docRef.id };
      }

      const docRef = snapshot.docs[0].ref;
      const currentData = snapshot.docs[0].data() as NFeSequenceConfig;
      const nextNumber = currentData.lastNumber + 1;

      await updateDoc(docRef, {
        lastNumber: nextNumber,
        lastIssueDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return { number: nextNumber, sequenceId: docRef.id };
    } catch (error) {
      console.error("Erro ao obter próximo número de NF-e:", error);
      throw error;
    }
  },

  // Criar NF-e baseada em uma venda
  async createNFe(data: CreateNFeData): Promise<NFe> {
    try {
      // Buscar a venda
      const sale = await saleService.getById(data.saleId);
      if (!sale) {
        throw new Error("Venda não encontrada");
      }

      // Obter configuração da empresa (cria automaticamente se não existir)
      const companyConfig = await this.getCompanyConfig(data.company);

      // Obter próximo número de NF-e
      const { number } = await this.getNextNFeNumber(
        data.company,
        companyConfig.series
      );

      const nfeCode = `${companyConfig.series}${String(number).padStart(9, "0")}`;

      const nfe: NFe = {
        id: "", // Será gerado pelo Firestore
        number,
        series: companyConfig.series,
        code: nfeCode,
        company: data.company,
        companyName: companyConfig.companyName,
        companyCnpj: companyConfig.cnpj,
        clientId: sale.clientId,
        clientName: sale.clientName,
        clientCpf: sale.clientCpf,
        clientEmail: sale.clientEmail,
        saleId: sale.id,
        saleCode: sale.code,
        houseId: sale.houseId,
        houseName: sale.houseName,
        checkInDate: sale.checkInDate,
        checkOutDate: sale.checkOutDate,
        numberOfNights: sale.numberOfNights,
        dailyRateValue: sale.netValue,
        conciergeValue: sale.conciergeValue,
        additionalServicesValue: sale.totalAdditionalSales,
        discountValue: sale.discount,
        subtotal:
          sale.netValue + sale.conciergeValue + sale.totalAdditionalSales,
        taxValue: 0, // Será calculado na emissão
        totalValue: 0, // Será calculado na emissão
        issueDate: data.issueDate || new Date(),
        status: "pending",
        failureAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Calcular impostos (usando a alíquota configurada)
      const TAX_RATES: Record<string, number> = {
        exclusive: 6.0,
        giogio: 6.0,
        direta: 6.0,
      };

      const taxRate = TAX_RATES[data.company] || 6.0;
      nfe.taxValue = (nfe.subtotal * taxRate) / 100;
      nfe.totalValue = nfe.subtotal + nfe.taxValue;

      // Salvar no Firestore
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...nfe,
        checkInDate: Timestamp.fromDate(nfe.checkInDate),
        checkOutDate: Timestamp.fromDate(nfe.checkOutDate),
        issueDate: Timestamp.fromDate(nfe.issueDate),
        lastAttemptDate: nfe.lastAttemptDate
          ? Timestamp.fromDate(nfe.lastAttemptDate)
          : null,
        createdAt: Timestamp.fromDate(nfe.createdAt),
        updatedAt: Timestamp.fromDate(nfe.updatedAt),
      });

      nfe.id = docRef.id;

      // Se autoIssue está ativado, emitir automaticamente
      if (companyConfig.autoIssue) {
        await this.issueNFe(nfe.id);
      }

      return nfe;
    } catch (error) {
      console.error("Erro ao criar NF-e:", error);
      throw error;
    }
  },

  // Emitir NF-e (integração com SEFAZ)
  async issueNFe(nfeId: string): Promise<NFeEmissionResponse> {
    try {
      const nfe = await this.getNFeById(nfeId);
      if (!nfe) {
        throw new Error("NF-e não encontrada");
      }

      if (nfe.status === "authorized") {
        return {
          success: true,
          nfeNumber: nfe.nfeNumber,
          nfeKey: nfe.nfeKey,
          timestamp: new Date(),
        };
      }

      // Atualizar status para processando
      await this.updateNFe(nfeId, { id: nfeId, status: "processing" });

      // Simular emissão (AQUI seria a integração real com API SEFAZ)
      const emissionResponse = await this.simulateNFeSefazEmission(nfe);

      if (emissionResponse.success && emissionResponse.nfeNumber) {
        // Atualizar NF-e com dados da emissão
        await this.updateNFe(nfeId, {
          id: nfeId,
          status: "authorized",
          nfeNumber: emissionResponse.nfeNumber,
          nfeKey: emissionResponse.nfeKey,
          xmlContent: emissionResponse.xmlContent,
          pdfUrl: emissionResponse.pdfUrl,
        });
      } else {
        // Registrar erro
        const nfeUpdated = await this.getNFeById(nfeId);
        const failureAttempts = (nfeUpdated?.failureAttempts || 0) + 1;

        await this.updateNFe(nfeId, {
          id: nfeId,
          status: "error",
          emissionError: emissionResponse.error || "Erro desconhecido",
          failureAttempts,
        });
      }

      return emissionResponse;
    } catch (error) {
      console.error("Erro ao emitir NF-e:", error);
      const nfeUpdated = await this.getNFeById(nfeId);
      const failureAttempts = (nfeUpdated?.failureAttempts || 0) + 1;

      await this.updateNFe(nfeId, {
        id: nfeId,
        status: "error",
        emissionError: String(error),
        failureAttempts,
      });

      return {
        success: false,
        error: String(error),
        timestamp: new Date(),
      };
    }
  },

  // Simular emissão na SEFAZ (SUBSTITUIR POR INTEGRAÇÃO REAL)
  async simulateNFeSefazEmission(
    nfe: NFe
  ): Promise<NFeEmissionResponse> {
    return new Promise((resolve) => {
      // Simular delay de processamento
      setTimeout(() => {
        // Simular 95% de sucesso
        const success = Math.random() < 0.95;

        if (success) {
          const nfeNumber = `${nfe.series}${String(nfe.number).padStart(9, "0")}`;
          const nfeKey = this.generateNFeKey(nfe);

          resolve({
            success: true,
            nfeNumber,
            nfeKey,
            xmlContent: this.generateMockXML(nfe, nfeKey),
            pdfUrl: `https://exemplo.com/danfe/${nfeKey}.pdf`,
            timestamp: new Date(),
          });
        } else {
          resolve({
            success: false,
            error: "Erro simulado na SEFAZ: Dados inconsistentes",
            timestamp: new Date(),
          });
        }
      }, 2000); // Simular 2 segundos de processamento
    });
  },

  // Gerar chave de acesso da NF-e
  generateNFeKey(nfe: NFe): string {
    // Formato: UF (2) + AAMM (4) + CNPJ (8) + Modelo (2) + Series (3) + Número (9) + DV (1) = 43 dígitos
    const cnpj = nfe.companyCnpj.replace(/\D/g, "");
    const issueYear = nfe.issueDate.getFullYear().toString().slice(-2);
    const issueMonth = String(nfe.issueDate.getMonth() + 1).padStart(2, "0");
    const modelo = "55";
    const series = String(nfe.series).padStart(3, "0");
    const numero = String(nfe.number).padStart(9, "0");
    const uf = "35"; // SP - Substituir conforme necessário

    // Simplificado: usar valores para gerar uma chave válida
    const baseKey = `${uf}${issueYear}${issueMonth}${cnpj.substring(0, 8)}${modelo}${series}${numero}`;
    const dv = this.calculateNFeKeyDV(baseKey);

    return `${baseKey}${dv}`;
  },

  // Calcular dígito verificador da chave de acesso (módulo 11)
  calculateNFeKeyDV(baseKey: string): string {
    const sequence = "2987654321";
    let sum = 0;

    for (let i = 0; i < baseKey.length; i++) {
      sum += parseInt(baseKey[i]) * parseInt(sequence[i % 10]);
    }

    const dv = 11 - (sum % 11);
    return String(dv === 10 || dv === 11 ? 0 : dv);
  },

  // Gerar XML mock (SUBSTITUIR POR XML REAL)
  generateMockXML(nfe: NFe, nfeKey: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${nfeKey}">
    <ide>
      <cUF>35</cUF>
      <cNF>${nfe.code}</cNF>
      <natOp>Locação de Imóvel</natOp>
      <mod>55</mod>
      <serie>${nfe.series}</serie>
      <nNF>${nfe.number}</nNF>
      <dEmi>${nfe.issueDate.toISOString().split("T")[0]}</dEmi>
    </ide>
    <emit>
      <CNPJ>${nfe.companyCnpj}</CNPJ>
      <xNome>${nfe.companyName}</xNome>
    </emit>
    <dest>
      <CPF>${nfe.clientCpf}</CPF>
      <xNome>${nfe.clientName}</xNome>
    </dest>
    <det nItem="1">
      <prod>
        <xDesc>Locação de Imóvel - ${nfe.houseName}</xDesc>
        <qCom>${nfe.numberOfNights}</qCom>
        <vItem12741>${nfe.totalValue.toFixed(2)}</vItem12741>
      </prod>
    </det>
    <total>
      <ICMStot>
        <vBC>${nfe.subtotal.toFixed(2)}</vBC>
        <vICMS>${nfe.taxValue.toFixed(2)}</vICMS>
      </ICMStot>
    </total>
  </infNFe>
</NFe>`;
  },

  // Obter NF-e por ID
  async getNFeById(id: string): Promise<NFe | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return convertFirestoreData(docSnap);
    } catch (error) {
      console.error("Erro ao obter NF-e:", error);
      throw error;
    }
  },

  // Listar todas as NF-es com filtros
  async getNFes(filters?: NFeFilters): Promise<NFe[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy("issueDate", "desc"));

      const conditions = [];

      if (filters?.company && filters.company !== "all") {
        conditions.push(where("company", "==", filters.company));
      }

      if (filters?.status) {
        conditions.push(where("status", "==", filters.status));
      }

      if (filters?.series) {
        conditions.push(where("series", "==", filters.series));
      }

      if (conditions.length > 0) {
        q = query(
          collection(db, COLLECTION_NAME),
          ...conditions,
          orderBy("issueDate", "desc")
        );
      }

      const snapshot = await getDocs(q);
      const nfes = snapshot.docs.map(convertFirestoreData);

      // Filtro de texto
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return nfes.filter(
          (nfe) =>
            nfe.code.toLowerCase().includes(searchLower) ||
            nfe.clientName.toLowerCase().includes(searchLower) ||
            nfe.houseName.toLowerCase().includes(searchLower) ||
            nfe.saleCode.toLowerCase().includes(searchLower)
        );
      }

      // Filtro de período
      if (filters?.dateRange?.start && filters?.dateRange?.end) {
        return nfes.filter(
          (nfe) =>
            nfe.issueDate >= filters.dateRange!.start &&
            nfe.issueDate <= filters.dateRange!.end
        );
      }

      return nfes;
    } catch (error) {
      console.error("Erro ao listar NF-es:", error);
      throw error;
    }
  },

  // Atualizar NF-e
  async updateNFe(id: string, data: UpdateNFeData): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erro ao atualizar NF-e:", error);
      throw error;
    }
  },

  // Cancelar NF-e
  async cancelNFe(id: string, reason: string): Promise<void> {
    try {
      await this.updateNFe(id, {
        id,
        status: "cancelled",
        emissionError: reason,
      });
    } catch (error) {
      console.error("Erro ao cancelar NF-e:", error);
      throw error;
    }
  },

  // Gerar relatório de NFes
  async getNFeReport(
    company: string,
    startDate: Date,
    endDate: Date
  ): Promise<NFeReport> {
    try {
      const nfes = await this.getNFes({
        company: company as any,
        dateRange: { start: startDate, end: endDate },
      });

      const totalIssued = nfes.length;
      const totalAuthorized = nfes.filter((n) => n.status === "authorized")
        .length;
      const totalRejected = nfes.filter((n) => n.status === "rejected").length;
      const totalCancelled = nfes.filter((n) => n.status === "cancelled").length;
      const totalValue = nfes.reduce((sum, n) => sum + n.totalValue, 0);
      const taxCollected = nfes.reduce((sum, n) => sum + n.taxValue, 0);
      const successRate =
        totalIssued > 0 ? (totalAuthorized / totalIssued) * 100 : 0;

      const period = `${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`;

      return {
        company: company as any,
        period,
        totalIssued,
        totalAuthorized,
        totalRejected,
        totalCancelled,
        totalValue,
        taxCollected,
        successRate,
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de NFes:", error);
      throw error;
    }
  },

  // Deletar NF-e (apenas para testes, não deve ser usado em produção)
  async deleteNFe(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao deletar NF-e:", error);
      throw error;
    }
  },
};

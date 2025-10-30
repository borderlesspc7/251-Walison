import React, { useState, useEffect } from "react";
import "./FinancialManagement.css";
import { FiDollarSign } from "react-icons/fi";
import FinancialFilters, {
  type FinancialFilterValues,
} from "./components/FinancialFilters";
import FinancialSummary from "./components/FinancialSummary";
import RevenueByHouseReport from "./components/RevenueByHouseReport";
import CashFlowReport from "./components/CashFlowReport";
import ContractsReport from "./components/ContractsReport";
import DemographicReport from "./components/DemographicReport";
import ComparativeReport from "./components/ComparativeReport";
import TaxReport from "./components/TaxReport";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { ErrorMessage } from "../../components/ui/ErrorMessage/ErrorMessage";
import { financialService } from "../../services/financialService";
import { excelExportService } from "../../services/excelExportService";
import type {
  FinancialSummary as FinancialSummaryType,
  RevenueByHouse,
  CashFlowEntry,
  ContractsReport as ContractsReportType,
  DemographicReport as DemographicReportType,
  ComparativeReport as ComparativeReportType,
  TaxReport as TaxReportType,
} from "../../types/financial";

const FinancialManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FinancialFilterValues>({
    startDate: "",
    endDate: "",
    company: "all",
    houseId: "",
    reportType: "summary",
    groupBy: "month",
    demographicType: "house",
  });

  // Estados dos dados
  const [summaryData, setSummaryData] = useState<FinancialSummaryType | null>(
    null
  );
  const [revenueByHouseData, setRevenueByHouseData] = useState<
    RevenueByHouse[]
  >([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowEntry[]>([]);
  const [contractsData, setContractsData] =
    useState<ContractsReportType | null>(null);
  const [demographicData, setDemographicData] = useState<
    DemographicReportType[]
  >([]);
  const [comparativeData, setComparativeData] =
    useState<ComparativeReportType | null>(null);
  const [taxData, setTaxData] = useState<TaxReportType[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const filterParams = {
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        company: filters.company,
        houseId: filters.houseId || undefined,
        groupBy: filters.groupBy,
      };

      switch (filters.reportType) {
        case "summary": {
          const summary = await financialService.getFinancialSummary(
            filterParams
          );
          setSummaryData(summary);
          break;
        }

        case "revenue-by-house": {
          const revenueData = await financialService.getRevenueByHouse(
            filterParams
          );
          setRevenueByHouseData(revenueData);
          break;
        }

        case "cash-flow": {
          const cashFlow = await financialService.getCashFlow(filterParams);
          setCashFlowData(cashFlow);
          break;
        }

        case "contracts": {
          const contracts = await financialService.getContractsReport(
            filterParams
          );
          setContractsData(contracts);
          break;
        }

        case "breakdown": {
          const summary2 = await financialService.getFinancialSummary(
            filterParams
          );
          setSummaryData(summary2);
          break;
        }

        case "demographic": {
          const demographic = await financialService.getDemographicReport(
            filters.demographicType,
            filterParams
          );
          setDemographicData(demographic);
          break;
        }

        case "comparative": {
          // Para relatório comparativo, usamos o período selecionado e o anterior
          if (filters.startDate && filters.endDate) {
            const period1Start = new Date(filters.startDate);
            const period1End = new Date(filters.endDate);

            // Calcular período anterior de mesma duração
            const duration = period1End.getTime() - period1Start.getTime();
            const period2End = new Date(period1Start.getTime() - 1); // Um dia antes do início
            const period2Start = new Date(period2End.getTime() - duration);

            const comparative = await financialService.getComparativeReport(
              period2Start,
              period2End,
              period1Start,
              period1End,
              filters.company
            );
            setComparativeData(comparative);
          } else {
            setError(
              "Por favor, selecione um período (data início e fim) para o relatório comparativo."
            );
          }
          break;
        }

        case "tax": {
          const tax = await financialService.getTaxReport(filterParams);
          setTaxData(tax);
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error("Erro ao carregar dados financeiros:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados financeiros"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportType: string) => {
    try {
      setError(null);

      switch (reportType) {
        case "summary":
          if (summaryData) {
            excelExportService.exportFinancialSummary(summaryData);
          }
          break;

        case "revenue-by-house":
          if (revenueByHouseData.length > 0) {
            excelExportService.exportRevenueByHouse(revenueByHouseData);
          }
          break;

        case "cash-flow":
          if (cashFlowData.length > 0) {
            excelExportService.exportCashFlow(cashFlowData);
          }
          break;

        case "contracts":
          if (contractsData) {
            excelExportService.exportContractsReport(contractsData);
          }
          break;

        case "breakdown":
          if (summaryData) {
            excelExportService.exportFinancialSummary(summaryData);
          }
          break;

        case "demographic":
          if (demographicData.length > 0) {
            excelExportService.exportDemographicReport(
              demographicData,
              filters.demographicType
            );
          }
          break;

        case "comparative":
          if (comparativeData) {
            excelExportService.exportComparativeReport(comparativeData);
          }
          break;

        case "tax":
          if (taxData.length > 0) {
            excelExportService.exportTaxReport(taxData);
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.error("Erro ao exportar relatório:", err);
      setError("Erro ao exportar relatório para Excel");
    }
  };

  const renderReport = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <ErrorMessage message={error} />;
    }

    switch (filters.reportType) {
      case "summary":
      case "breakdown":
        return summaryData ? (
          <FinancialSummary data={summaryData} />
        ) : (
          <div className="no-data">Nenhum dado disponível</div>
        );

      case "revenue-by-house":
        return <RevenueByHouseReport data={revenueByHouseData} />;

      case "cash-flow":
        return <CashFlowReport data={cashFlowData} />;

      case "contracts":
        return contractsData ? (
          <ContractsReport data={contractsData} />
        ) : (
          <div className="no-data">Nenhum dado disponível</div>
        );

      case "demographic":
        return (
          <DemographicReport
            data={demographicData}
            type={filters.demographicType}
          />
        );

      case "comparative":
        return comparativeData ? (
          <ComparativeReport data={comparativeData} />
        ) : (
          <div className="no-data">
            Selecione um período para visualizar o relatório comparativo
          </div>
        );

      case "tax":
        return <TaxReport data={taxData} />;

      default:
        return <div className="no-data">Selecione um tipo de relatório</div>;
    }
  };

  return (
    <div className="financial-management">
      <div className="financial-header-modern">
        <div className="financial-header-content">
          <div className="financial-header-left">
            <div className="financial-header-icon">
              <FiDollarSign />
            </div>
            <div className="financial-header-text">
              <h1 className="financial-header-title">Financeiro e Relatórios</h1>
              <p className="financial-header-subtitle">Análise completa de receitas, despesas e relatórios gerenciais</p>
            </div>
          </div>
        </div>
      </div>

      <FinancialFilters onFilterChange={setFilters} onExport={handleExport} />

      <div className="financial-content">{renderReport()}</div>
    </div>
  );
};

export default FinancialManagement;

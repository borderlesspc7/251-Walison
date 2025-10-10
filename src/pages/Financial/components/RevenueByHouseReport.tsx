import React from "react";
import "./RevenueByHouseReport.css";
import type { RevenueByHouse } from "../../../types/financial";

interface RevenueByHouseReportProps {
  data: RevenueByHouse[];
}

const RevenueByHouseReport: React.FC<RevenueByHouseReportProps> = ({
  data,
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateTotals = () => {
    return data.reduce(
      (acc, item) => ({
        dailyRatesRevenue: acc.dailyRatesRevenue + item.dailyRatesRevenue,
        conciergeRevenue: acc.conciergeRevenue + item.conciergeRevenue,
        suppliersCommission: acc.suppliersCommission + item.suppliersCommission,
        grossRevenue: acc.grossRevenue + item.grossRevenue,
        expenses: acc.expenses + item.expenses,
        netRevenue: acc.netRevenue + item.netRevenue,
        numberOfSales: acc.numberOfSales + item.numberOfSales,
        numberOfNights: acc.numberOfNights + item.numberOfNights,
      }),
      {
        dailyRatesRevenue: 0,
        conciergeRevenue: 0,
        suppliersCommission: 0,
        grossRevenue: 0,
        expenses: 0,
        netRevenue: 0,
        numberOfSales: 0,
        numberOfNights: 0,
      }
    );
  };

  const totals = calculateTotals();

  if (data.length === 0) {
    return (
      <div className="revenue-by-house-report">
        <h2>Receitas e Despesas por Casa</h2>
        <div className="no-data">
          <p>Nenhum dado encontrado para o período selecionado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-by-house-report">
      <h2>Receitas e Despesas por Casa</h2>
      <p className="report-subtitle">
        Análise detalhada das três fontes de receita por propriedade
      </p>

      <div className="table-container">
        <table className="revenue-table">
          <thead>
            <tr>
              <th>Casa</th>
              <th>Vendas</th>
              <th>Noites</th>
              <th>Diárias</th>
              <th>Concierge</th>
              <th>Comissões</th>
              <th>Receita Bruta</th>
              <th>Despesas</th>
              <th>Receita Líquida</th>
            </tr>
          </thead>
          <tbody>
            {data.map((house) => (
              <tr key={house.houseId}>
                <td>
                  <div className="house-cell">
                    <strong>{house.houseName}</strong>
                    <small>{house.houseAddress}</small>
                  </div>
                </td>
                <td className="text-center">{house.numberOfSales}</td>
                <td className="text-center">{house.numberOfNights}</td>
                <td className="text-right revenue-daily">
                  {formatCurrency(house.dailyRatesRevenue)}
                </td>
                <td className="text-right revenue-concierge">
                  {formatCurrency(house.conciergeRevenue)}
                </td>
                <td className="text-right revenue-suppliers">
                  {formatCurrency(house.suppliersCommission)}
                </td>
                <td className="text-right gross-revenue">
                  {formatCurrency(house.grossRevenue)}
                </td>
                <td className="text-right expenses">
                  {formatCurrency(house.expenses)}
                </td>
                <td className="text-right net-revenue">
                  {formatCurrency(house.netRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td>
                <strong>TOTAL GERAL</strong>
              </td>
              <td className="text-center">
                <strong>{totals.numberOfSales}</strong>
              </td>
              <td className="text-center">
                <strong>{totals.numberOfNights}</strong>
              </td>
              <td className="text-right">
                <strong>{formatCurrency(totals.dailyRatesRevenue)}</strong>
              </td>
              <td className="text-right">
                <strong>{formatCurrency(totals.conciergeRevenue)}</strong>
              </td>
              <td className="text-right">
                <strong>{formatCurrency(totals.suppliersCommission)}</strong>
              </td>
              <td className="text-right">
                <strong>{formatCurrency(totals.grossRevenue)}</strong>
              </td>
              <td className="text-right">
                <strong>{formatCurrency(totals.expenses)}</strong>
              </td>
              <td className="text-right">
                <strong>{formatCurrency(totals.netRevenue)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legenda das três fontes de receita */}
      <div className="revenue-sources-legend">
        <h3>Três Fontes de Receita</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color daily"></span>
            <div>
              <strong>Diárias</strong>
              <p>Valor líquido das diárias (após descontos)</p>
            </div>
          </div>
          <div className="legend-item">
            <span className="legend-color concierge"></span>
            <div>
              <strong>Concierge</strong>
              <p>Serviços de concierge prestados</p>
            </div>
          </div>
          <div className="legend-item">
            <span className="legend-color suppliers"></span>
            <div>
              <strong>Comissões Fornecedores</strong>
              <p>
                Comissões de mercado, frutos do mar, transfer, verduras, cocos,
                etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueByHouseReport;

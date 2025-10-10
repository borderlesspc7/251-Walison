import React from "react";
import "./CashFlowReport.css";
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import type { CashFlowEntry } from "../../../types/financial";

interface CashFlowReportProps {
  data: CashFlowEntry[];
}

const CashFlowReport: React.FC<CashFlowReportProps> = ({ data }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getBalanceClass = (balance: number): string => {
    if (balance > 0) return "positive";
    if (balance < 0) return "negative";
    return "neutral";
  };

  if (data.length === 0) {
    return (
      <div className="cash-flow-report">
        <h2>Fluxo de Caixa</h2>
        <div className="no-data">
          <p>Nenhum dado encontrado para o período selecionado.</p>
        </div>
      </div>
    );
  }

  const finalBalance = data[data.length - 1]?.accumulatedBalance || 0;

  return (
    <div className="cash-flow-report">
      <div className="report-header">
        <div>
          <h2>Fluxo de Caixa</h2>
          <p className="report-subtitle">
            Entradas e saídas financeiras por período
          </p>
        </div>
        <div className="final-balance-card">
          <span className="balance-label">Saldo Final</span>
          <span className={`balance-value ${getBalanceClass(finalBalance)}`}>
            {formatCurrency(finalBalance)}
          </span>
        </div>
      </div>

      <div className="table-container">
        <table className="cash-flow-table">
          <thead>
            <tr>
              <th>Período</th>
              <th>Entradas</th>
              <th>Saídas</th>
              <th>Saldo do Período</th>
              <th>Saldo Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => (
              <tr key={index}>
                <td>
                  <strong>{entry.period}</strong>
                </td>
                <td className="cash-in">{formatCurrency(entry.cashIn)}</td>
                <td className="cash-out">{formatCurrency(entry.cashOut)}</td>
                <td className={`balance ${getBalanceClass(entry.balance)}`}>
                  {formatCurrency(entry.balance)}
                </td>
                <td
                  className={`accumulated ${getBalanceClass(
                    entry.accumulatedBalance
                  )}`}
                >
                  {formatCurrency(entry.accumulatedBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumo Visual */}
      <div className="cash-flow-summary">
        <div className="summary-item in">
          <div className="summary-icon">
            <FiTrendingUp size={40} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total de Entradas</span>
            <span className="summary-value">
              {formatCurrency(
                data.reduce((sum, entry) => sum + entry.cashIn, 0)
              )}
            </span>
          </div>
        </div>

        <div className="summary-item out">
          <div className="summary-icon">
            <FiTrendingDown size={40} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total de Saídas</span>
            <span className="summary-value">
              {formatCurrency(
                data.reduce((sum, entry) => sum + entry.cashOut, 0)
              )}
            </span>
          </div>
        </div>

        <div className="summary-item balance">
          <div className="summary-icon">
            <FiDollarSign size={40} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Saldo Total</span>
            <span
              className={`summary-value ${getBalanceClass(
                data.reduce((sum, entry) => sum + entry.balance, 0)
              )}`}
            >
              {formatCurrency(
                data.reduce((sum, entry) => sum + entry.balance, 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowReport;

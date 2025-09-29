import React, { useState, useEffect, useMemo } from "react";
import type { Employee, EmployeeFilters } from "../../types/employee";
import { employeeService } from "../../services/employeeService";
import { EmployeeList } from "./components/EmployeeList";
import { EmployeeModal } from "./components/EmployeeModal";
import { EmployeeFiltersComponent } from "./components/EmployeeFilters";
import { EmployeeStats } from "./components/EmployeeStats";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner/LoadingSpinner";
import { Button } from "../../components/ui/Button/Button";
import { ErrorMessage } from "../../components/ui/ErrorMessage/ErrorMessage";
import "./EmployeeManagement.css";

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });

  // Carregar colaboradores
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAll(filters);
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar colaboradores"
      );
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const statsData = await employeeService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  // Filtrar colaboradores localmente
  const filteredEmployees = useMemo(() => {
    let filtered = [...employees];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((employee) =>
        employee.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (employee) => employee.status === filters.status
      );
    }

    return filtered;
  }, [employees, filters]);

  // Efeitos
  useEffect(() => {
    loadEmployees();
    loadStats();
  }, []); // Intencionalmente sem dependências - carregamento inicial

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadEmployees();
    }
  }, [filters]); // Intencionalmente sem loadEmployees nas dependências

  // Handlers
  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este colaborador?")) {
      return;
    }

    try {
      await employeeService.delete(id);
      setEmployees(employees.filter((employee) => employee.id !== id));
      loadStats();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir colaborador"
      );
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleEmployeeSaved = () => {
    loadEmployees();
    loadStats();
    handleModalClose();
  };

  const handleFiltersChange = (newFilters: EmployeeFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading && employees.length === 0) {
    return <LoadingSpinner text="Carregando colaboradores..." fullScreen />;
  }

  return (
    <div className="employee-management">
      <div className="employee-management-header">
        <div className="header-content">
          <h1>Gestão de Colaboradores</h1>
          <Button
            onClick={handleCreateEmployee}
            className="create-employee-btn"
          >
            + Novo Colaborador
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <EmployeeStats stats={stats} />

      <div className="employee-management-content">
        <EmployeeFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          employeeCount={filteredEmployees.length}
          totalCount={employees.length}
        />

        <EmployeeList
          employees={filteredEmployees}
          loading={loading}
          onEdit={handleEditEmployee}
          onView={handleViewEmployee}
          onDelete={handleDeleteEmployee}
        />
      </div>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleEmployeeSaved}
        employee={selectedEmployee}
        mode={modalMode}
      />
    </div>
  );
};

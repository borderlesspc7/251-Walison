import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "../pages/Login/Login";
import { RegisterPage } from "../pages/Register/Register";
import { Layout } from "../components/Layout/Layout";
import { ClientManagement } from "../pages/Client/ClientManagement";
import { OwnerManagement } from "../pages/Owner/OwnerManagement";
import { SupplierManagement } from "../pages/Supplier/SupplierManagement";
import { EmployeeManagement } from "../pages/Employee/EmployeeManagement";
import { HouseManagement } from "../pages/House/HouseManagment";
import { SalesManagement } from "../pages/Sales/SalesManagement";
import FinancialManagement from "../pages/Financial/FinancialManagement";
import DashboardManagement from "../pages/DashboardConsolidation/DashboardManagement";
import DashboardProcessos from "../pages/DashboardProcess/DashboardManagement";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<LoginPage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
        <Route
          path={paths.clients}
          element={
            <ProtectedRoute>
              <Layout>
                <ClientManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.owners}
          element={
            <ProtectedRoute>
              <Layout>
                <OwnerManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.suppliers}
          element={
            <ProtectedRoute>
              <Layout>
                <SupplierManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.employees}
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.houses}
          element={
            <ProtectedRoute>
              <Layout>
                <HouseManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.sales}
          element={
            <ProtectedRoute>
              <Layout>
                <SalesManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.financial}
          element={
            <ProtectedRoute>
              <Layout>
                <FinancialManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.dashboardConsolidacao}
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.dashboardProcessos}
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardProcessos />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

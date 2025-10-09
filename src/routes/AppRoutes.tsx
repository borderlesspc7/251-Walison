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

export const AppRoutes = () => {
  function Menu() {
    return <div>Menu</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<LoginPage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
        <Route
          path={paths.menu}
          element={
            <ProtectedRoute>
              <Layout>
                <Menu />
              </Layout>
            </ProtectedRoute>
          }
        />
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
      </Routes>
    </BrowserRouter>
  );
};

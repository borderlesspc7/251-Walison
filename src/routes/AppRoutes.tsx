import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "../pages/Login/Login";
import { RegisterPage } from "../pages/Register/Register";
import { Layout } from "../components/Layout/Layout";

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
      </Routes>
    </BrowserRouter>
  );
};

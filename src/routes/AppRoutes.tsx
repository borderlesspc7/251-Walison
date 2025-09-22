import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRoutes = () => {
  function Home() {
    return <div>Home</div>;
  }

  function Login() {
    return <div>Login</div>;
  }

  function Register() {
    return <div>Register</div>;
  }

  function Menu() {
    return <div>Menu</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route
          path={paths.menu}
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

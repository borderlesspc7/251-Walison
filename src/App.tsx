import { AuthProvider } from "./contexts/authContext";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

import { useState, useMemo, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./shared/theme/theme";
import { AuthProvider } from "./features/auth/hooks/useAuth";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import AppLayout from "./shared/layout/AppLayout";

function Home() {
  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
        Tablero
      </h1>
      <p style={{ color: "#64748B", marginTop: "8px", fontSize: "14px" }}>
        Seleccioná un proyecto para ver su tablero Kanban.
      </p>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("kanbix-theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const theme = useMemo(() => (mode === "light" ? lightTheme : darkTheme), [mode]);

  useEffect(() => {
    localStorage.setItem("kanbix-theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Expose toggle via context or prop drilling — for now, pass via a simple module-level setter
  // We'll wire it properly in the navbar later
  (window as unknown as Record<string, unknown>).__toggleTheme = () =>
    setMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

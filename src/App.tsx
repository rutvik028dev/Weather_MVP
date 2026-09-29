import { Navigate, Route, Routes } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./pages/Dashboard";
import { ReportForm } from "./pages/ReportForm";
import { Login } from "./pages/Login";
import { Admin } from "./pages/Admin";
import { useAuth } from "./lib/useAuth";

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <main className="flex flex-col flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

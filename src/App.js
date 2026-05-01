import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

import AdminLayout from "@/components/layout/AdminLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import PackageList from "@/pages/packages/PackageList";
import PackageForm from "@/pages/packages/PackageForm";
import PackageDetail from "@/pages/packages/PackageDetail";
import CategoryMaster from "@/pages/CategoryMaster";
import DestinationMaster from "@/pages/DestinationMaster";
import UserList from "@/pages/users/UserList";
import UserTransactions from "@/pages/users/UserTransactions";
import Travellers from "@/pages/Travellers";
import Winners from "@/pages/Winners";
import PrintInvoice from "@/pages/PrintInvoice";
import ClosureSlip from "@/pages/ClosureSlip";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/mockData";

function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  const location = useLocation();
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthed } = useAuth();
  if (isAuthed) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  useEffect(() => {
    db.load(); // seeds storage if missing
    const state = db.load();
    if (state.settings?.darkMode) document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="hz-app-shell">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/invoice/:bookingId" element={<ProtectedRoute><PrintInvoice /></ProtectedRoute>} />
          <Route path="/closure-slip/:bookingId" element={<ProtectedRoute><ClosureSlip /></ProtectedRoute>} />

          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/packages" element={<PackageList />} />
            <Route path="/packages/new" element={<PackageForm />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            <Route path="/packages/:id/edit" element={<PackageForm />} />
            <Route path="/categories" element={<CategoryMaster />} />
            <Route path="/destinations" element={<DestinationMaster />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/:id/transactions" element={<UserTransactions />} />
            <Route path="/travellers" element={<Travellers />} />
            <Route path="/winners" element={<Winners />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!bg-[#162D24] !text-[#FDFCF8] !border-none !shadow-2xl !rounded-xl",
            description: "!text-[#FDFCF8]/70",
            actionButton: "!bg-[#D9734E] !text-white",
            cancelButton: "!bg-white/10 !text-white",
          },
        }}
      />
    </div>
  );
}

export default App;

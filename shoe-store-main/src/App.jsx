import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLogin  from './components/AuthLogin';
import AdminLogin from './components/AdminLogin';
import OnlineStore from './components/OnlineStore';
import AdminPos   from './components/AdminPos';
import ProtectedRoute from './components/ProtectedRoute';

// maVaiTro từ DB — dùng cho ProtectedRoute
const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Khách hàng ───────────────────────────── */}
        <Route path="/"       element={<OnlineStore />} />
        <Route path="/login"  element={<AuthLogin />} />
        <Route path="/online" element={<Navigate to="/" replace />} />

        {/* ── Nhân viên / Quản trị ─────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES}>
              <AdminPos />
            </ProtectedRoute>
          }
        />

        {/* ── Fallback ──────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

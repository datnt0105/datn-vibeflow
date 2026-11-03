import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];

export default function ProtectedRoute({ children, allowedRoles }) {
  const session     = useAuthStore((s) => s.session);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // ── 1. Chờ persist đọc xong localStorage ──────────────────────────────────
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400 font-semibold">Đang khôi phục phiên đăng nhập...</span>
        </div>
      </div>
    );
  }

  // ── 2. Chưa đăng nhập → chuyển đến /admin/login ───────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#c6f500]/10 border border-[#c6f500]/30 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Yêu Cầu Đăng Nhập</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Khu vực này dành riêng cho <b>Quản trị viên</b> và <b>Nhân viên</b>.
            </p>
          </div>
          <Link
            to="/admin/login"
            className="block w-full py-3 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs rounded-xl transition shadow"
          >
            🔑 Đăng Nhập Nhân Viên ➔
          </Link>
          <Link to="/" className="block text-xs text-zinc-500 hover:text-zinc-300 transition">
            ← Về trang cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  // ── 3. Kiểm tra role ───────────────────────────────────────────────────────
  const userRole = (session.role || '').toUpperCase();
  const allowed  = allowedRoles ?? STAFF_ROLES;
  const hasPermission = allowed.some((r) => r.toUpperCase() === userRole);

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <div className="text-4xl">🚫</div>
          <h2 className="text-lg font-black uppercase text-red-400">Không Đủ Quyền Truy Cập</h2>
          <p className="text-xs text-zinc-400">
            Tài khoản <b>{session.name}</b> (role: <b>{session.role}</b>) không có quyền vào khu vực này.
          </p>
          <div className="pt-3 flex gap-3">
            <Link to="/" className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold rounded-xl">
              Về Trang Mua Sắm
            </Link>
            <Link to="/admin/login" className="flex-1 py-2.5 bg-[#c6f500] text-black text-xs font-bold rounded-xl">
              Đổi Tài Khoản
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

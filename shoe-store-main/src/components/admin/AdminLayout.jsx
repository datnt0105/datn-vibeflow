import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Icon } from './ui';

/**
 * Khung chung khu quản trị: header + sidebar + <Outlet/> cho route con /admin/<slug>.
 * Quy ước route: .f5/specs/basic-design/v1.0.0/screens/screen-list.md §1 (ADR-001)
 *   - FE route luôn là /admin/<slug>; API tương ứng /api/admin/<slug> (không dùng /api trong link).
 *   - roles: mục chỉ hiện với các role này. Route vẫn phải bọc ProtectedRoute + BE hasRole (App.jsx).
 */
export const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Tổng quan', icon: 'dashboard', roles: ['ADMIN'] },
  { to: '/admin/pos', label: 'Bán tại quầy', icon: 'cart' },
  { to: '/admin/san-pham', label: 'Sản phẩm', icon: 'package' },
  { to: '/admin/hoa-don', label: 'Hóa đơn', icon: 'receipt' },
  { to: '/admin/giao-ca', label: 'Giao ca', icon: 'clock' },
  { to: '/admin/doi-tra', label: 'Đổi trả', icon: 'returnIcon' },
  { to: '/admin/chat', label: 'Chat', icon: 'chat' },
  { group: 'Quản lý' },
  { to: '/admin/khach-hang', label: 'Khách hàng', icon: 'users' },
  { to: '/admin/nhan-vien', label: 'Nhân viên', icon: 'idCard', roles: ['ADMIN'], badge: 'ADMIN' },
  // Quản lý khuyến mãi (SCR-ADM-KM-01) — tạm hoãn, chưa có route
  { label: 'Khuyến mãi', icon: 'tag', soon: true },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const role = (session?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN';

  const items = ADMIN_NAV.filter((it) => !it.roles || it.roles.includes(role));
  const current = items.find((it) => it.to && pathname.startsWith(it.to));
  const initials = (session?.name || 'NV').split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="bg-black text-slate-100 min-h-screen flex selection:bg-[#c6f500] selection:text-black">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-[#c6f500] focus:text-black">
        Bỏ qua tới nội dung chính
      </a>

      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-zinc-950 border-r border-zinc-800 hidden md:flex flex-col sticky top-0 h-screen">
        <Link to="/admin" className="h-14 flex items-center gap-2 px-5 border-b border-zinc-800">
          <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
          <span className="text-xl font-black italic tracking-tight">
            <span className="text-white">Vibe</span><span className="text-[#c6f500]">Flow</span>
          </span>
        </Link>

        <nav aria-label="Điều hướng quản trị" className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((it, i) => {
            if (it.group) {
              return <p key={i} className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{it.group}</p>;
            }
            if (it.soon) {
              return (
                <span key={i} aria-disabled="true" title="Chức năng đang phát triển"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 cursor-not-allowed">
                  <Icon name={it.icon} />
                  <span className="flex-1">{it.label}</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-500">Sắp có</span>
                </span>
              );
            }
            return (
              <NavLink key={it.to} to={it.to}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
                {({ isActive }) => (
                  <>
                    <Icon name={it.icon} />
                    <span className="flex-1">{it.label}</span>
                    {it.badge && (
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${isActive ? 'border-black/40 text-black' : 'border-[#c6f500]/50 text-[#c6f500]'}`}>
                        {it.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {isAdmin && (
            <>
              <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Báo cáo chuyên sâu</p>
              <a href="/admin-statistics.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition">
                <Icon name="chart" /><span>Thống kê POS nâng cao</span>
              </a>
            </>
          )}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-14 sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 flex items-center justify-between gap-3 px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-sm truncate">
            <span className="text-zinc-500">Quản trị</span>
            {current && <><span className="mx-2 text-zinc-600">/</span><span className="font-semibold text-white">{current.label}</span></>}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <Link to="/" title="Xem giao diện Cửa hàng online"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#c6f500] font-semibold transition">
              <Icon name="store" /><span>Cửa hàng online</span>
            </Link>
            <div className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border border-zinc-800 bg-zinc-900">
              <span className="w-7 h-7 rounded-full bg-[#c6f500] text-black text-[11px] font-black flex items-center justify-center">{initials}</span>
              <span className="font-semibold text-white max-w-[140px] truncate">{session?.name}</span>
              <span className="font-mono font-bold text-[10px] text-[#c6f500]">{role}</span>
            </div>
            <button type="button" onClick={handleLogout}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-500/50 font-semibold transition">
              <Icon name="logout" /><span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main id="admin-main" className="flex-1 min-w-0 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

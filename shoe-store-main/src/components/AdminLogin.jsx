import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuthStore } from '../store';

const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];

export default function AdminLogin() {
  const navigate = useNavigate();
  const login         = useAuthStore((s) => s.login);
  const session       = useAuthStore((s) => s.session);
  const hasHydrated   = useAuthStore((s) => s._hasHydrated);

  const [username, setUsername]               = useState('');
  const [password, setPassword]               = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [errorMessage, setErrorMessage]       = useState('');
  const [successMessage, setSuccessMessage]   = useState('');

  // Nếu đã đăng nhập với role staff → vào thẳng /admin
  useEffect(() => {
    if (!hasHydrated) return;
    if (session && STAFF_ROLES.includes((session.role || '').toUpperCase())) {
      navigate('/admin', { replace: true });
    }
  }, [hasHydrated, session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Vui lòng nhập email và mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.loginAdmin({
        username: username.trim(),
        password,
      });

      const roleCode = (res.role || '').toUpperCase();

      if (!STAFF_ROLES.includes(roleCode)) {
        setErrorMessage(`Tài khoản không có quyền truy cập hệ thống quản trị! (role: ${roleCode})`);
        return;
      }

      const sessionData = {
        role:        roleCode,
        name:        res.hoTen || res.email || 'Nhân viên',
        email:       res.email,
        maNhanVien:  res.maNhanVien,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        id:          res.id,
        idVaiTro:    res.idVaiTro,
        tenVaiTro:   res.tenVaiTro,
      };

      login(sessionData);
      setSuccessMessage(`Chào ${sessionData.name}! Đang vào hệ thống...`);
      setTimeout(() => navigate('/admin', { replace: true }), 400);
    } catch (err) {
      setErrorMessage(err.message || 'Đăng nhập thất bại! Kiểm tra email / mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  // Đang chờ hydrate
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col justify-between selection:bg-[#c6f500] selection:text-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-10 sticky top-0">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
              <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-lg font-black italic tracking-tight">
            <span className="text-white">Vibe</span><span className="text-[#c6f500]">Flow</span>
          </span>
        </Link>

        <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-[#c6f500] animate-pulse" />
          <span>Cổng Nhân Viên</span>
          <code className="text-[#c6f500] font-mono">/admin</code>
        </div>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-zinc-950/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          {/* Icon + Title */}
          <div className="text-center mb-7 space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
              🛡️
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              Đăng Nhập <span className="text-zinc-300">Quản Trị</span>
            </h1>
            <p className="text-xs text-zinc-500">Dành cho Quản trị viên và Nhân viên VibeFlow</p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2.5">
              <span className="mt-0.5">⚠️</span>
              <span className="flex-1">{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage('')} className="font-bold hover:text-white">✕</button>
            </div>
          )}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <span>✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                Email Nhân Viên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nhanvien@vibeflow.com"
                  required
                  autoComplete="username"
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg><span>Đang xác thực...</span></>
                : <><span>🔐</span><span>Đăng Nhập Hệ Thống ➔</span></>
              }
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
            <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition">
              ← Về trang cửa hàng khách hàng
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800/50 py-3 px-6 z-10 text-center">
        <p className="text-[11px] text-zinc-700">© 2026 VibeFlow Sneakers — Hệ thống nội bộ</p>
      </footer>
    </div>
  );
}

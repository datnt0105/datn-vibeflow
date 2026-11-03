import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuthStore } from '../store';

/**
 * Trang đăng nhập / đăng ký dành riêng cho KHÁCH HÀNG.
 * Route: /login
 *
 * - Nếu đã đăng nhập là khách hàng (KHACH_HANG) → redirect về /
 * - Nếu đã đăng nhập là nhân viên (ADMIN/NHAN_VIEN) → redirect về /admin
 */
export default function AuthLogin() {
  const navigate    = useNavigate();
  const login       = useAuthStore((s) => s.login);
  const session     = useAuthStore((s) => s.session);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Form đăng nhập
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form đăng ký
  const [regHoTen, setRegHoTen]                   = useState('');
  const [regEmail, setRegEmail]                   = useState('');
  const [regPhone, setRegPhone]                   = useState('');
  const [regPassword, setRegPassword]             = useState('');
  const [regConfirm, setRegConfirm]               = useState('');
  const [showRegPassword, setShowRegPassword]     = useState(false);

  const [loading, setLoading]             = useState(false);
  const [errorMessage, setErrorMessage]   = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-redirect nếu đã đăng nhập
  useEffect(() => {
    if (!hasHydrated || !session) return;
    const role = (session.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'NHAN_VIEN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [hasHydrated, session, navigate]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const clearMessages = () => { setErrorMessage(''); setSuccessMessage(''); };

  // ── Đăng nhập khách hàng ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.loginCustomer({ username: email.trim(), password });
      const sessionData = {
        role:         res.role || 'KHACH_HANG',
        name:         res.hoTen || res.email || 'Khách Hàng',
        phone:        res.sdt || '',
        email:        res.email || email.trim(),
        accessToken:  res.accessToken,
        refreshToken: res.refreshToken,
        id:           res.id,
        maKhachHang:  res.maKhachHang,
      };
      login(sessionData);
      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/', { replace: true }), 400);
    } catch (err) {
      setErrorMessage(err.message || 'Sai email hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  // ── Đăng ký khách hàng ────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!regHoTen.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, email và mật khẩu!');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    if (regPassword !== regConfirm) {
      setErrorMessage('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.registerCustomer({
        hoTen: regHoTen.trim(), email: regEmail.trim(),
        sdt: regPhone.trim(), password: regPassword,
      });
      setSuccessMessage(res.message || 'Đăng ký thành công! Hãy đăng nhập ngay.');
      setEmail(regEmail.trim());
      setPassword(regPassword);
      setMode('login');
      setRegHoTen(''); setRegEmail(''); setRegPhone('');
      setRegPassword(''); setRegConfirm('');
    } catch (err) {
      setErrorMessage(err.message || 'Đăng ký thất bại. Email có thể đã được dùng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col justify-between selection:bg-[#c6f500] selection:text-black relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c6f500]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#c6f500]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-10 sticky top-0">
        <Link to="/" className="flex items-center space-x-2">
          <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
            <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span className="text-xl font-black italic tracking-tight">
            <span className="text-white">Vibe</span><span className="text-[#c6f500]">Flow</span>
          </span>
        </Link>
        <Link
          to="/admin/login"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-xl"
        >
          🛡️ Cổng Nhân Viên
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-zinc-950/90 border border-zinc-800/90 rounded-3xl p-7 shadow-2xl">

          {/* Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[#c6f500] text-xs font-bold uppercase tracking-wider mb-3">
              ⚡ Tài Khoản Khách Hàng
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'} <span className="text-[#c6f500]">VibeFlow</span>
            </h1>
          </div>

          {/* Sub-tabs */}
          <div className="flex border-b border-zinc-800 mb-5 text-xs font-bold">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); clearMessages(); }}
                className={`flex-1 pb-3 transition border-b-2 -mb-px ${
                  mode === m ? 'border-[#c6f500] text-[#c6f500]' : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Đăng Nhập' : 'Đăng Ký Thành Viên'}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span className="flex-1">{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage('')} className="font-bold hover:text-white shrink-0">✕</button>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <span>✅</span><span>{successMessage}</span>
            </div>
          )}

          {/* ── Form Đăng Nhập ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Email</label>
                <input
                  type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com" required
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] focus:ring-1 focus:ring-[#c6f500] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Mật Khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••" required
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] focus:ring-1 focus:ring-[#c6f500] transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300">
                    {showPassword
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50">
                {loading
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg><span>Đang đăng nhập...</span></>
                  : <span>Đăng Nhập ➔</span>
                }
              </button>
            </form>
          )}

          {/* ── Form Đăng Ký ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Họ Và Tên</label>
                <input type="text" value={regHoTen} onChange={(e) => setRegHoTen(e.target.value)} placeholder="Nguyễn Văn An" required
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Email</label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="email@example.com" required
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Số Điện Thoại</label>
                  <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="0987654321"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Mật Khẩu</label>
                  <input type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••" required
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Xác Nhận</label>
                  <input type={showRegPassword ? 'text' : 'password'} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="••••••" required
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                </div>
              </div>
              <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={showRegPassword} onChange={(e) => setShowRegPassword(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-zinc-700 accent-[#c6f500]" />
                <span>Hiện mật khẩu</span>
              </label>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center disabled:opacity-50">
                {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Ngay ➔'}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-800/50 py-3 px-6 z-10 text-center">
        <p className="text-[11px] text-zinc-700">© 2026 VibeFlow Sneakers</p>
      </footer>
    </div>
  );
}

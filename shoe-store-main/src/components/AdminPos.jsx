import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { sanPhamApi } from '../api';
import axiosClient from '../api/axiosClient';
import AdminProduct from "./AdminProduct.jsx";
import AdminAttribute from "./AdminAttribute.jsx";
import KhachHangPage from "./KhachHangPage.jsx";
import NhanVienPage from "./NhanVienPage.jsx";

// Địa chỉ backend để hiển thị ảnh (urlAnh dạng "/api/hinh-anh/file/xxx.jpg")
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const toSrc = (url) => (!url ? '' : url.startsWith('http') ? url : BASE_URL + url);
const fmtMoney = (v) => Number(v ?? 0).toLocaleString('vi-VN') + '₫';

export default function AdminPos({ session: propSession, onLogout: propLogout }) {
  const navigate = useNavigate();
  const storeSession = useAuthStore((s) => s.session);
  const storeLogout = useAuthStore((s) => s.logout);
  const session = propSession || storeSession;

  // Phân quyền hiển thị theo role
  const isAdmin = (session?.role || '').toUpperCase() === 'ADMIN';

  const handleLogout = () => {
    if (typeof propLogout === 'function') propLogout();
    storeLogout();
    navigate('/login');
  };

  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'pos');

  // Dashboard Metrics & Filter State
  const [statsPeriod, setStatsPeriod] = useState('7days'); // 'today' | '7days' | 'month' | 'year'

  // ── POS State (kết nối API thật) ─────────────────────────────────────────
  const [activeBillTab, setActiveBillTab] = useState(1);
  // item: { chiTietId, tenSanPham, tenMau, tenKichThuoc, donGia, qty, tonKho }
  const [bill1, setBill1] = useState([]);
  const [bill2, setBill2] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [billDiscount, setBillDiscount] = useState(0);
  const [posProducts, setPosProducts] = useState([]);
  const [posLoading, setPosLoading] = useState(false);
  const [posError, setPosError] = useState('');
  const [bienTheModal, setBienTheModal] = useState(null); // sản phẩm đang chọn biến thể
  const [bill, setBill] = useState(null);                 // dữ liệu bill sau thanh toán (modal in)
  const billRef = useRef(null);

  const currentBill = activeBillTab === 1 ? bill1 : bill2;
  const setCurrentBill = activeBillTab === 1 ? setBill1 : setBill2;

  const billSubtotal = currentBill.reduce((sum, item) => sum + item.donGia * item.qty, 0);
  const billTotal = Math.max(0, billSubtotal - billDiscount);

  // Tải danh sách sản phẩm cho POS
  useEffect(() => {
    let alive = true;
    setPosLoading(true);
    sanPhamApi.getAll({ page: 0, size: 100 })
      .then((res) => { if (alive) setPosProducts(Array.isArray(res.content) ? res.content : []); })
      .catch((err) => { if (alive) setPosError(err.message || 'Không tải được sản phẩm!'); })
      .finally(() => { if (alive) setPosLoading(false); });
    return () => { alive = false; };
  }, []);

  // Ảnh chính của sản phẩm (dùng chung 1 request/ sản phẩm khi mở lưới)
  const [anhChinhMap, setAnhChinhMap] = useState({});
  useEffect(() => {
    posProducts.forEach((p) => {
      if (anhChinhMap[p.id] !== undefined) return;
      axiosClient.get(`/hinh-anh/san-pham/${p.id}`)
        .then((list) => {
          const first = Array.isArray(list) && list.length > 0 ? list[0].urlAnh : null;
          setAnhChinhMap((prev) => ({ ...prev, [p.id]: first || '' }));
        })
        .catch(() => setAnhChinhMap((prev) => ({ ...prev, [p.id]: '' })));
    });
  }, [posProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load biến thể khi mở modal chọn màu/size
  const [bienTheList, setBienTheList] = useState([]);
  const openBienThe = (sp) => {
    setBienTheModal(sp);
    setBienTheList([]);
    axiosClient.get(`/ban-hang/san-pham/${sp.id}/bien-the`)
      .then((list) => setBienTheList(Array.isArray(list) ? list : []))
      .catch((err) => alert(err.message || 'Không tải được biến thể!'));
  };

  // Thêm 1 biến thể vào hóa đơn đang mở
  const addToBill = (bt) => {
    if (bt.soLuong <= 0) { alert('Biến thể này đã hết hàng!'); return; }
    setCurrentBill((prev) => {
      const idx = prev.findIndex((x) => x.chiTietId === bt.id);
      if (idx >= 0) {
        const next = [...prev];
        if (next[idx].qty + 1 > bt.soLuong) { alert('Vượt quá tồn kho!'); return prev; }
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, {
        chiTietId: bt.id,
        tenSanPham: bienTheModal?.tenSanPham || '',
        tenMau: bt.tenMau,
        tenKichThuoc: bt.tenKichThuoc,
        donGia: Number(bt.giaBan ?? 0),
        qty: 1,
        tonKho: bt.soLuong,
      }];
    });
  };

  const handleRemovePosItem = (idx) => {
    setCurrentBill((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdatePosQty = (idx, delta) => {
    setCurrentBill((prev) => {
      const updated = [...prev];
      const newQty = updated[idx].qty + delta;
      if (newQty <= 0) updated.splice(idx, 1);
      else if (newQty > updated[idx].tonKho) { alert('Vượt quá tồn kho!'); return prev; }
      else updated[idx].qty = newQty;
      return updated;
    });
  };

  // ── Thanh toán: lưu hóa đơn + mở modal in bill K80 ──────────────────────
  const handlePosCheckout = async () => {
    if (currentBill.length === 0) { alert('Hóa đơn trống!'); return; }
    try {
      const res = await axiosClient.post('/ban-hang/thanh-toan', {
        items: currentBill.map((x) => ({ chiTietId: x.chiTietId, soLuong: x.qty })),
        tienGiam: billDiscount || 0,
      });
      setBill(res); // axiosClient đã unwrap response.data
      setCurrentBill([]);
      setBillDiscount(0);
    } catch (err) {
      alert(err.message || 'Thanh toán thất bại!');
    }
  };

  // Mở hộp thoại in sau khi modal bill render xong
  useEffect(() => {
    if (bill && billRef.current) {
      window.print();
    }
  }, [bill]);

  // ── Dashboard: thống kê thật từ /thong-ke/dashboard ─────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  useEffect(() => {
    if (!isAdmin || activeTab !== 'dashboard') return;
    let alive = true;
    setStatsLoading(true);
    axiosClient.get('/thong-ke/dashboard', { params: { period: statsPeriod } })
      .then((res) => { if (alive) setStats(res); })
      .catch(() => {})
      .finally(() => { if (alive) setStatsLoading(false); });
    return () => { alive = false; };
  }, [isAdmin, activeTab, statsPeriod]);

  // Chiều cao cột biểu đồ theo doanh thu (peak = 100%)
  const weeklyRevenue = (stats?.bieuDo7Ngay || []).map((d) => {
    const peak = Number(stats?.bieuDo7NgayPeak || 0);
    const v = Number(d.doanhThu || 0);
    return {
      day: d.thu,
      value: v,
      height: peak > 0 ? `${Math.max(4, Math.round((v / peak) * 100))}%` : '4%',
      isPeak: peak > 0 && v === peak,
    };
  });

  // ── Orders: hóa đơn thật từ /ban-hang (tab Quản Lý Hóa Đơn) ─────────────
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (activeTab !== 'orders') return;
    axiosClient.get('/ban-hang/hoa-don')
      .then((res) => setOrders(Array.isArray(res) ? res : res.content || []))
      .catch(() => setOrders([]));
  }, [activeTab]);
  const [orderFilter, setOrderFilter] = useState('all');
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'pos') return o.trangThai === 1;
    if (orderFilter === 'completed') return o.trangThai === 1 || o.trangThai === 5;
    return o.trangThai === 2; // đơn online
  });

  // ── Shift state (chốt két — dữ liệu local, chưa có bảng CA_LAM_VIEC) ────
  const [openingCash, setOpeningCash] = useState(0);
  const [actualCash, setActualCash] = useState(0);
  const [shiftNote, setShiftNote] = useState('');

  return (
    <div className="bg-black text-slate-100 min-h-screen flex flex-col selection:bg-[#c6f500] selection:text-black">
      {/* Top Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 h-14 flex items-center justify-between px-4 sm:px-6 z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
              <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xl font-black italic tracking-tight">
              <span className="text-white">Vibe</span><span className="text-[#c6f500]">Flow</span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[#c6f500] text-[10px] font-black uppercase">
            {isAdmin ? 'Quản Trị & POS' : 'Nhân Viên POS'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            to="/"
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#c6f500] text-zinc-300 hover:text-white font-bold transition"
            title="Xem giao diện Cửa Hàng Online của Khách Hàng"
          >
            <span>🛍️</span>
            <span>Cửa Hàng Online</span>
          </Link>

          <div className="hidden sm:flex items-center space-x-2 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-[#c6f500] animate-pulse"></span>
            <span>{session?.branch || 'Chi nhánh: 298 Cầu Giấy'}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 font-bold">
            <span className="text-[#c6f500]">●</span>
            <span className="text-white">{session?.name || 'Vũ Minh Đức (Admin)'}</span>
          </div>

          <button onClick={handleLogout} className="text-zinc-400 hover:text-red-400 font-bold px-2 py-1 transition">
            Đăng Xuất
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-56 bg-zinc-950 border-r border-zinc-800 p-3 space-y-1.5 shrink-0 hidden md:flex flex-col justify-between">
          <div className="space-y-1">
            {/* Dashboard / Thống kê — chỉ ADMIN */}
            {isAdmin && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'dashboard' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>📊</span>
              <span>Dashboard / Thống Kê</span>
            </button>
            )}
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'pos' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>💵</span>
              <span>Bán Hàng POS (F2)</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'products' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>👟</span>
              <span>Quản Lý Sản Phẩm</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'orders' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>📋</span>
              <span>Quản Lý Hóa Đơn</span>
            </button>
            <button
                onClick={() => setActiveTab('attribute')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'attribute' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
            >
              <span>🏷️</span>
              <span>Quản Lý Thuộc tính</span>
            </button>
            <button
                onClick={() => setActiveTab('customer')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'customer' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
            >
              <span>👥</span>
              <span>Quản Lý Khách Hàng</span>
            </button>

            <button
                onClick={() => setActiveTab('employee')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'employee' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
            >
              <span>🧑‍💼</span>
              <span>Quản Lý Nhân Viên</span>
            </button>
            <button
              onClick={() => setActiveTab('shift')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'shift' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>🔒</span>
              <span>Giao Ca & Chốt Két</span>
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'returns' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>🔄</span>
              <span>Đổi Trả Hàng (7 ngày)</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'chat' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>💬</span>
              <span>Live Chat CSKH</span>
            </button>
          </div>

          <div className="space-y-2">
            {/* Báo cáo chuyên sâu — chỉ ADMIN */}
            {isAdmin && (
              <>
                <div className="text-[10px] font-bold uppercase text-zinc-500 px-2">Báo Cáo Chuyên Sâu</div>
                <a href="admin-statistics.html" className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition">
                  <span>💵</span>
                  <span>Thống Kê POS Nâng Cao</span>
                </a>
              </>
            )}

            <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1 mt-2">
              <div className="font-bold text-white">Hotkeys POS:</div>
              <div>[F2] Mở tìm kiếm</div>
              <div>[F3] Quét Barcode</div>
              <div>[F9] Thanh toán nhanh</div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-black p-4 sm:p-6">
          {/* TAB 0: DASHBOARD — chỉ ADMIN */}
          {activeTab === 'dashboard' && isAdmin && (
            <div className="space-y-6">
              {/* Header Dashboard & Time Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
                <div>
                  <h2 className="text-xl font-black uppercase text-white flex items-center space-x-2">
                    <span className="text-[#c6f500]">📊</span>
                    <span>Dashboard Thống Kê & Báo Cáo Doanh Thu</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Tổng quan kết quả kinh doanh đa kênh (Website Online + Bán lẻ tại quầy POS).</p>
                </div>

                {/* Period Selector Pills */}
                <div className="flex items-center gap-2">
                  {[
                    { id: 'today', label: 'Hôm nay' },
                    { id: '7days', label: '7 ngày qua' },
                    { id: 'month', label: 'Tháng này' },
                    { id: 'year', label: 'Năm 2026' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setStatsPeriod(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        statsPeriod === p.id ? 'bg-[#c6f500] text-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button onClick={() => alert("Đang xuất báo cáo tài chính ra file Excel...")} className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition">
                    📥 Xuất Excel
                  </button>
                </div>
              </div>

              {/* 4 KPI SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span>Tổng Doanh Thu</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">
                      {stats ? `${stats.kpi.tangTruongDoanhThu >= 0 ? '+' : ''}${stats.kpi.tangTruongDoanhThu}%` : '—'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">{stats ? fmtMoney(stats.kpi.tongDoanhThu) : '...'}</div>
                  <div className="text-[11px] text-zinc-500">So với kỳ trước ({stats ? fmtMoney(stats.kpi.doanhThuKyTruoc) : '...'})</div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span>Tổng Đơn Hàng</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">
                      {stats ? `${stats.kpi.tangTruongDonHang >= 0 ? '+' : ''}${stats.kpi.tangTruongDonHang}%` : '—'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">{stats ? `${stats.kpi.tongDonHang} đơn` : '...'}</div>
                  <div className="text-[11px] text-zinc-500">Online: <b>{stats ? fmtMoney(stats.kenhBanHang.onlineDoanhThu) : '...'}</b> • POS: <b>{stats ? fmtMoney(stats.kenhBanHang.posDoanhThu) : '...'}</b></div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span>Giá Trị Trung Bình Đơn (AOV)</span>
                  </div>
                  <div className="text-2xl font-black text-[#c6f500]">{stats ? fmtMoney(stats.kpi.aov) : '...'}</div>
                  <div className="text-[11px] text-zinc-500">Kỳ: {stats?.period || '—'}</div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span>Số Đôi Giày Xuất Kho</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stats ? `${stats.kpi.soDoiXuatKho} đôi` : '...'}</div>
                  <div className="text-[11px] text-zinc-500">Sản phẩm tồn thấp: <b>{stats ? stats.tonKhoThap.length : 0}</b></div>
                </div>
              </div>

              {/* CHARTS ROW (BIỂU ĐỒ DOANH THU 7 NGÀY & TỶ TRỌNG KÊNH BÁN) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-DAY REVENUE BAR CHART (2 COLS) */}
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-sm uppercase text-white">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
                      <p className="text-[11px] text-zinc-400">Doanh số tăng mạnh vào cuối tuần (Thứ 7 & Chủ Nhật).</p>
                    </div>
                    <span className="text-xs font-bold text-[#c6f500]">
                      {stats ? `Đỉnh điểm: ${(Number(stats.bieuDo7NgayPeak || 0) / 1000000).toFixed(1)}M` : '—'}
                    </span>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-zinc-800 pb-2">
                    {weeklyRevenue.length === 0 && (
                      <div className="w-full text-center text-zinc-500 text-xs pb-4">Chưa có dữ liệu doanh thu</div>
                    )}
                    {weeklyRevenue.map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition font-mono mb-1">
                          {(item.value / 1000000).toFixed(1)}M
                        </div>
                        <div
                          style={{ height: item.height }}
                          className={`w-full rounded-t-lg transition duration-300 ${
                            item.isPeak
                              ? 'bg-[#c6f500] shadow-[0_0_15px_rgba(198,245,0,0.5)]'
                              : 'bg-zinc-800 hover:bg-[#c6f500]/70'
                          }`}
                        ></div>
                        <span className="text-[10px] font-bold text-zinc-400 mt-2">{item.day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sub breakdown info */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-zinc-900/60 p-2 rounded-xl">
                      <span className="text-zinc-500 text-[10px] block">Doanh Thu TB / Ngày</span>
                      <b className="text-white">6.970.000₫</b>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded-xl">
                      <span className="text-zinc-500 text-[10px] block">Tỷ Lệ Hoàn Tất Đơn</span>
                      <b className="text-[#c6f500]">94.8%</b>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded-xl">
                      <span className="text-zinc-500 text-[10px] block">Tỷ Lệ Hủy Đơn</span>
                      <b className="text-red-400">5.2%</b>
                    </div>
                  </div>
                </div>

                {/* CHANNEL BREAKDOWN & PAYMENT METHODS (1 COL) */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-sm uppercase text-white mb-1">Tỷ Trọng Kênh Bán Hàng</h3>
                    <p className="text-[11px] text-zinc-400 mb-4">Phân bổ doanh thu giữa Online và Quầy POS.</p>

                    {/* Progress Channels */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-zinc-300">🌐 Online Website (160Store)</span>
                          <span className="text-[#c6f500]">
                            {stats ? `${stats.kenhBanHang.onlinePhanTram}% (${(Number(stats.kenhBanHang.onlineDoanhThu) / 1000000).toFixed(1)}M)` : '—'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-[#c6f500] rounded-full" style={{ width: `${stats?.kenhBanHang.onlinePhanTram || 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-zinc-300">💵 Bán Lẻ Tại Quầy POS</span>
                          <span className="text-white">
                            {stats ? `${stats.kenhBanHang.posPhanTram}% (${(Number(stats.kenhBanHang.posDoanhThu) / 1000000).toFixed(1)}M)` : '—'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${stats?.kenhBanHang.posPhanTram || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-4 space-y-2">
                    <h4 className="font-bold text-xs text-white">Phương Thức Thanh Toán</h4>
                    <div className="space-y-1.5 text-xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Quét mã VietQR:</span>
                        <b className="text-white">55% (Tự động hạch toán)</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiền mặt tại két:</span>
                        <b className="text-white">30%</b>
                      </div>
                      <div className="flex justify-between">
                        <span>COD khi giao:</span>
                        <b className="text-white">10%</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Ví MoMo / VNPay:</span>
                        <b className="text-white">5%</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BEST SELLERS & LOW STOCK ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Best Sellers */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-sm uppercase text-white">Top Giày Bán Chạy Nhất</h3>
                    <span className="text-[10px] text-[#c6f500] font-bold">Xếp theo số lượng</span>
                  </div>

                  <div className="divide-y divide-zinc-850 space-y-2 text-xs">
                    {(stats?.topBanChay || []).length === 0 && (
                      <div className="py-6 text-center text-zinc-500">Chưa có đơn hàng nào trong kỳ này</div>
                    )}
                    {(stats?.topBanChay || []).map((p, idx) => (
                      <div key={p.sanPhamId} className="pt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                            idx === 0 ? 'bg-[#c6f500] text-black' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white line-clamp-1">{p.tenSanPham}</div>
                            <div className="text-[10px] text-zinc-500">{p.thuongHieu || '—'} • Đã bán {p.daBan} đôi</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[#c6f500]">{fmtMoney(p.doanhThu)}</div>
                          <div className="text-[10px] text-zinc-400">Tồn: <b>{p.tonKho}</b></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Warnings */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-sm uppercase text-white flex items-center space-x-1.5">
                      <span className="text-amber-400">⚠️</span>
                      <span>Cảnh Báo Tồn Kho Sắp Hết</span>
                    </h3>
                    <span className="text-[10px] text-red-400 font-bold">&lt; {stats?.nguongTonThap || 10} đôi</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {(stats?.tonKhoThap || []).length === 0 && (
                      <div className="py-6 text-center text-zinc-500">Tồn kho tất cả sản phẩm đều ổn định 👌</div>
                    )}
                    {(stats?.tonKhoThap || []).map((p) => (
                      <div key={p.sanPhamId} className={`p-3 rounded-xl flex items-center justify-between ${
                        p.tonKho <= 5 ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                      }`}>
                        <div>
                          <div className="font-bold text-white">{p.tenSanPham}</div>
                          <div className={`text-[10px] ${p.tonKho <= 5 ? 'text-red-300' : 'text-amber-300'}`}>
                            Còn {p.tonKho} đôi{p.sizeHetHang > 0 ? ` (${p.sizeHetHang} size đã hết hàng)` : ''}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold ${p.tonKho <= 5 ? 'text-red-400' : 'text-amber-400'}`}>
                          {p.tonKho <= 5 ? 'Sắp hết!' : 'Cần nhập thêm'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: POS SCREEN */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="[F2/F3] Tìm tên giày, mã SP..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c6f500]"
                  />
                </div>

                {posError && <div className="text-red-400 text-xs">{posError}</div>}
                {posLoading && <div className="text-zinc-400 text-xs">Đang tải sản phẩm...</div>}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {posProducts.filter((p) => !posSearch || p.tenSanPham.toLowerCase().includes(posSearch.toLowerCase()) || (p.maSanPham || '').toLowerCase().includes(posSearch.toLowerCase())).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openBienThe(p)}
                      className="bg-zinc-950 border border-zinc-800 hover:border-[#c6f500] rounded-2xl p-2.5 cursor-pointer transition flex flex-col justify-between"
                    >
                      <img src={toSrc(anhChinhMap[p.id])} className="w-full aspect-square rounded-xl object-cover bg-zinc-900 mb-2" />
                      <div>
                        <div className="text-[10px] text-zinc-500 font-mono">{p.maSanPham}</div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">{p.tenSanPham}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-black text-xs text-[#c6f500]">{fmtMoney(p.giaBan)}</span>
                          <span className="text-[10px] text-zinc-400">Tồn: {p.tongTonKho ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* POS Bill Panel */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between h-fit lg:h-full print:hidden">
                <div>
                  <div className="flex gap-2 border-b border-zinc-800 pb-3 mb-3">
                    <button
                      onClick={() => setActiveBillTab(1)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeBillTab === 1 ? 'bg-[#c6f500] text-black' : 'bg-zinc-900 text-zinc-400'}`}
                    >
                      Hóa Đơn 1 ({bill1.length})
                    </button>
                    <button
                      onClick={() => setActiveBillTab(2)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeBillTab === 2 ? 'bg-[#c6f500] text-black' : 'bg-zinc-900 text-zinc-400'}`}
                    >
                      Hóa Đơn 2 ({bill2.length})
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {currentBill.length === 0 ? (
                      <div className="py-8 text-center text-zinc-500 text-xs">Hóa đơn đang trống. Click giày bên trái để thêm!</div>
                    ) : (
                      currentBill.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="font-bold text-white line-clamp-1">{item.tenSanPham}</span>
                            <button onClick={() => handleRemovePosItem(idx)} className="text-zinc-500 hover:text-red-400 font-bold ml-2">✕</button>
                          </div>
                          <div className="flex justify-between text-zinc-400 text-[11px]">
                            <span>Size: {item.tenKichThuoc} • {item.tenMau}</span>
                            <span className="font-bold text-[#c6f500]">{(item.donGia * item.qty).toLocaleString('vi-VN')}₫</span>
                          </div>
                          <div className="flex items-center space-x-2 pt-1">
                            <button onClick={() => handleUpdatePosQty(idx, -1)} className="w-5 h-5 bg-black rounded text-white">-</button>
                            <span className="font-bold">{item.qty}</span>
                            <button onClick={() => handleUpdatePosQty(idx, 1)} className="w-5 h-5 bg-black rounded text-white">+</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-3 mt-4">
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between text-zinc-400">
                      <span>Tạm tính hàng:</span>
                      <span>{billSubtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Giảm giá / Voucher:</span>
                      <input
                        type="number"
                        placeholder="0₫"
                        value={billDiscount || ''}
                        onChange={(e) => setBillDiscount(Number(e.target.value))}
                        className="w-24 bg-black border border-zinc-800 rounded px-2 py-0.5 text-right text-xs text-[#c6f500]"
                      />
                    </div>
                    <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                      <span>Khách Cần Trả:</span>
                      <span className="text-[#c6f500]">{billTotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>

                  <button onClick={handlePosCheckout} className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs rounded-xl shadow-lg transition">
                    [F9] Thanh Toán & In Bill K80
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── MODAL: BIẾN THỂ (chọn màu/size khi bán) ── */}
          {bienTheModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:hidden" onClick={() => setBienTheModal(null)}>
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-sm uppercase text-white">{bienTheModal.tenSanPham}</h3>
                  <button onClick={() => setBienTheModal(null)} className="text-zinc-400 hover:text-red-400 font-bold">✕</button>
                </div>
                {bienTheList.length === 0 ? (
                  <div className="text-zinc-400 text-xs py-6 text-center">Đang tải biến thể...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {bienTheList.map((bt) => (
                      <button
                        key={bt.id}
                        onClick={() => { addToBill(bt); setBienTheModal(null); }}
                        disabled={bt.soLuong <= 0}
                        className={`p-3 rounded-xl border text-left text-xs transition ${
                          bt.soLuong <= 0
                            ? 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed'
                            : 'border-zinc-800 bg-zinc-900 hover:border-[#c6f500] text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-3 h-3 rounded-full inline-block border border-zinc-600" style={{ background: bt.maHex || '#555' }}></span>
                          {bt.tenMau} • Size {bt.tenKichThuoc}
                        </div>
                        <div className="flex justify-between mt-1 text-[11px]">
                          <span className="text-[#c6f500] font-black">{fmtMoney(bt.giaBan)}</span>
                          <span className={bt.soLuong <= 0 ? 'text-red-400' : 'text-zinc-400'}>Tồn: {bt.soLuong}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MODAL: BILL K80 — in hóa đơn sau thanh toán ── */}
          {bill && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:static print:bg-white print:block print:p-0">
              <div className="bg-white text-black rounded-2xl p-6 w-full max-w-sm font-mono text-[11px] leading-relaxed shadow-2xl print:shadow-none print:rounded-none print:max-w-full print:p-0"
                   ref={billRef}>
                <div className="text-center space-y-0.5">
                  <div className="text-base font-black tracking-tight italic">Vibe<span className="text-lime-600">Flow</span> Sneaker</div>
                  <div>298 Cầu Giấy, Hà Nội</div>
                  <div>Hotline: 0550000888</div>
                  <div className="border-t border-dashed border-black my-2"></div>
                  <div className="font-black uppercase text-xs">Hóa đơn bán hàng</div>
                  <div>#{bill.maHoaDon}</div>
                  <div>{new Date(bill.ngayTao).toLocaleString('vi-VN')}</div>
                  <div>Thu ngân: {session?.name || session?.hoTen || '—'}</div>
                </div>
                <div className="border-t border-dashed border-black my-2"></div>
                {bill.danhSach.map((l, i) => (
                  <div key={i} className="mb-1.5">
                    <div className="font-bold">{l.tenSanPham}</div>
                    <div className="flex justify-between">
                      <span>{l.kichThuoc} • {l.mauSac} × {l.soLuong}</span>
                      <span>{Number(l.thanhTien).toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-dashed border-black my-2"></div>
                <div className="flex justify-between"><span>Tạm tính:</span><span>{Number(bill.tongTien).toLocaleString('vi-VN')}₫</span></div>
                <div className="flex justify-between"><span>Giảm giá:</span><span>-{Number(bill.tienGiam || 0).toLocaleString('vi-VN')}₫</span></div>
                <div className="flex justify-between font-black text-sm mt-1"><span>TỔNG CỘNG:</span><span>{Number(bill.thanhTien).toLocaleString('vi-VN')}₫</span></div>
                <div className="border-t border-dashed border-black my-2"></div>
                <div className="text-center space-y-0.5">
                  <div>Cảm ơn quý khách — Hẹn gặp lại!</div>
                  <div>Đổi trả trong 7 ngày với hóa đơn này</div>
                  <div className="text-[9px] mt-1">--- VibeFlow POS System ---</div>
                </div>
              </div>
              <div className="absolute bottom-6 flex gap-3 print:hidden">
                <button onClick={() => window.print()} className="px-5 py-2.5 bg-[#c6f500] text-black font-black text-xs rounded-xl">🖨️ In Bill K80</button>
                <button onClick={() => setBill(null)} className="px-5 py-2.5 bg-zinc-800 text-white font-bold text-xs rounded-xl">Đóng</button>
              </div>
            </div>
          )}


          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (<AdminProduct activeTab={activeTab} isAdmin={isAdmin}/>

          )}
          {activeTab === 'attribute' && (<AdminAttribute activeTab={activeTab} isAdmin={isAdmin}/>
          )}
          {activeTab === 'customer' && <KhachHangPage isAdmin={isAdmin} />}
          {activeTab === 'employee' && <NhanVienPage isAdmin={isAdmin} />}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Tất cả hóa đơn' },
                  { id: 'pending', label: 'Đơn Online: Chưa xử lý' },
                  { id: 'processing', label: 'Đơn Online: Đang chuẩn bị' },
                  { id: 'pos', label: 'Hóa Đơn Tại Quầy POS' },
                  { id: 'completed', label: 'Đã hoàn thành' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      orderFilter === tab.id ? 'bg-[#c6f500] text-black' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Mã Hóa Đơn</th>
                      <th className="p-3">Kênh</th>
                      <th className="p-3">Khách Hàng</th>
                      <th className="p-3">Sản Phẩm</th>
                      <th className="p-3 text-right">Tổng Tiền</th>
                      <th className="p-3 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Chưa có hóa đơn nào</td></tr>
                    )}
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-900/40">
                        <td className="p-3 font-mono font-bold text-[#c6f500]">#{ord.maHoaDon}</td>
                        <td className="p-3 text-zinc-300">{ord.trangThai === 1 ? 'Tại quầy POS' : 'Online'}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{ord.khachHangId ? `Khách #${ord.khachHangId}` : 'Khách vãng lai'}</div>
                          <div className="text-[10px] text-zinc-500">{ord.ngayTao ? new Date(ord.ngayTao).toLocaleString('vi-VN') : ''}</div>
                        </td>
                        <td className="p-3 text-zinc-300">{ord.itemsSummary}</td>
                        <td className="p-3 text-right font-black text-white">{Number(ord.thanhTien || 0).toLocaleString('vi-VN')}₫</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">
                            Đã Thanh Toán
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SHIFT CLOSING */}
          {activeTab === 'shift' && (
            <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-zinc-800 pb-4">
                <span className="text-xs font-black uppercase text-[#c6f500]">Bàn Giao Ca Trực</span>
                <h3 className="text-xl font-black text-white mt-1">Chốt Két & Đối Soát Tiền Mặt</h3>
                <p className="text-xs text-zinc-400">Thu ngân kiểm đếm tiền thực tế trong két để bàn giao cho ca tiếp theo.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-400">
                  <span>Tiền mặt đầu ca:</span>
                  <span className="font-bold text-white">{openingCash.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800 text-zinc-400">
                  <span>Doanh thu tiền mặt trong ca:</span>
                  <span className="font-bold text-[#c6f500]">+3.350.000₫</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800 font-bold text-white text-sm">
                  <span>Tiền mặt lý thuyết trong két:</span>
                  <span className="text-[#c6f500]">5.350.000₫</span>
                </div>

                <div className="pt-2">
                  <label className="block text-zinc-300 font-bold mb-1">Tiền mặt thực đếm khi bàn giao:</label>
                  <input
                    type="number"
                    value={actualCash}
                    onChange={(e) => setActualCash(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Ghi chú bàn giao:</label>
                  <textarea
                    rows={2}
                    value={shiftNote}
                    onChange={(e) => setShiftNote(e.target.value)}
                    placeholder="Đầy đủ tiền lẻ, két niêm phong bình thường..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-xs"
                  />
                </div>

                <button
                  onClick={() => alert("🎉 ĐÃ CHỐT CA TRỰC THÀNH CÔNG!\nBiên bản bàn giao két đã được gửi lên hệ thống.")}
                  className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase rounded-xl transition mt-2"
                >
                  Xác Nhận Chốt Két & In Biên Bản Bàn Giao
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: RETURNS */}
          {activeTab === 'returns' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-xs space-y-4">
              <h3 className="font-black text-sm uppercase text-white">Quy Trình Đổi Size / Đổi Trả Hàng (7 Ngày)</h3>
              <p className="text-zinc-400">Nhập mã hóa đơn cũ để kiểm tra điều kiện đổi size hoặc đổi mẫu mới:</p>
              <div className="flex gap-2 max-w-md">
                <input type="text" placeholder="Nhập mã đơn: #ORD-9821 hoặc #POS-1042..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white" />
                <button onClick={() => alert("Đơn hàng hợp lệ! Đã mua cách đây 2 ngày. Đủ điều kiện đổi size miễn phí.")} className="px-4 py-2 bg-[#c6f500] text-black font-bold rounded-xl">
                  Kiểm Tra
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: CHAT */}
          {activeTab === 'chat' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-xs space-y-4">
              <h3 className="font-black text-sm uppercase text-white">Live Chat CSKH Omnichannel</h3>
              <div className="h-48 bg-zinc-900 rounded-2xl p-4 overflow-y-auto space-y-2">
                <div className="text-zinc-400 text-[10px]">Hôm nay 14:10</div>
                <div className="bg-zinc-800 p-2.5 rounded-xl max-w-xs text-white">
                  <b>Khách:</b> Shop còn Nike Jordan Shadow size 42 ở chi nhánh Phố Huế không ạ?
                </div>
                <div className="bg-[#c6f500] text-black p-2.5 rounded-xl max-w-xs ml-auto font-medium">
                  <b>Thu ngân:</b> Dạ chào bạn, size 42 hiện chi nhánh Hoàn Kiếm còn sẵn 3 đôi bạn nhé!
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

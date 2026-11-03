const { useState, useEffect } = React;

const OD = [
  { day: "T2", v: 2100000, o: 3 },
  { day: "T3", v: 3500000, o: 5 },
  { day: "T4", v: 4200000, o: 6 },
  { day: "T5", v: 3800000, o: 5 },
  { day: "T6", v: 5100000, o: 7 },
  { day: "T7", v: 8200000, o: 11 },
  { day: "CN", v: 7600000, o: 10 }
];

const OM = [
  { m: "T1", v: 62e6 },
  { m: "T2", v: 58e6 },
  { m: "T3", v: 71e6 },
  { m: "T4", v: 68e6 },
  { m: "T5", v: 82e6 },
  { m: "T6", v: 78e6 },
  { m: "T7", v: 95e6 },
  { m: "T8", v: 108e6 },
  { m: "T9", v: 115e6 },
  { m: "T10", v: 122e6 }
];

const OS = [
  { st: "Chờ xác nhận", c: 8, cl: "#fbbf24" },
  { st: "Đang đóng gói", c: 5, cl: "#60a5fa" },
  { st: "Đang giao", c: 12, cl: "#a78bfa" },
  { st: "Đã giao", c: 42, cl: "#c6f500" },
  { st: "Đã hủy", c: 3, cl: "#f87171" }
];

const OP = [
  { m: "COD", a: 12500000, c: 18, p: 36, cl: "#c6f500" },
  { m: "VietQR", a: 10800000, c: 15, p: 31, cl: "#60a5fa" },
  { m: "MoMo", a: 6200000, c: 9, p: 18, cl: "#a78bfa" },
  { m: "VNPay", a: 5000000, c: 5, p: 15, cl: "#fb923c" }
];

const OA = [
  { area: "Hà Nội", o: 28, r: 18500000, p: 40 },
  { area: "TP.HCM", o: 22, r: 14200000, p: 31 },
  { area: "Đà Nẵng", o: 8, r: 5100000, p: 11 },
  { area: "Khác", o: 12, r: 7700000, p: 18 }
];

const OTP = [
  { n: "Jordan 1 Shadow", sk: "NK-AJ1-SHD-01", sl: 18, r: 87300000, i: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=200&auto=format&fit=crop&q=80" },
  { n: "Nike Dunk Panda", sk: "NK-DNK-PND-02", sl: 15, r: 47250000, i: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200&auto=format&fit=crop&q=80" },
  { n: "Yeezy 350 V2 Onyx", sk: "AD-YZY-350-06", sl: 10, r: 68000000, i: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&auto=format&fit=crop&q=80" },
  { n: "Adidas Samba OG", sk: "AD-SMB-OG-03", sl: 8, r: 19600000, i: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=200&auto=format&fit=crop&q=80" },
  { n: "Nike Air Force 1", sk: "NK-AF1-WHT-04", sl: 6, r: 15900000, i: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80" }
];

const OTX = [
  { id: "ORD-9830", t: "16:20", cu: "Nguyễn Thị Lan", it: "1x Jordan 1 Shadow (42)", to: 4850000, pa: "VietQR", st: "Chờ xác nhận", addr: "Hà Nội" },
  { id: "ORD-9829", t: "15:45", cu: "Trần Đức Minh", it: "1x Nike Dunk Panda (41)", to: 3150000, pa: "COD", st: "Đang giao", addr: "TP.HCM" },
  { id: "ORD-9828", t: "14:30", cu: "Lê Hoàng Yến", it: "1x Yeezy 350 (43)", to: 6800000, pa: "MoMo", st: "Đã giao", addr: "Đà Nẵng" },
  { id: "ORD-9827", t: "13:15", cu: "Phạm Văn Hải", it: "2x Samba OG (40,41)", to: 4900000, pa: "VNPay", st: "Đang đóng gói", addr: "Hà Nội" },
  { id: "ORD-9826", t: "11:50", cu: "Vũ Thị Hương", it: "1x Nike AF1 (39)", to: 2650000, pa: "COD", st: "Đã giao", addr: "TP.HCM" },
  { id: "ORD-9825", t: "10:20", cu: "Ngô Quang Huy", it: "1x NB 550 (42)", to: 3200000, pa: "VietQR", st: "Đã hủy", addr: "Hải Phòng" }
];

function App() {
  const [pe, setPe] = useState('7days');
  const [ac, setAc] = useState('overview');
  const [se, setSe] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem('vibeflow_session');
    if (s) {
      try { setSe(JSON.parse(s)); } catch (e) {}
    }
  }, []);

  const tR = OD.reduce((s, d) => s + d.v, 0);
  const tO = OD.reduce((s, d) => s + d.o, 0);
  const mD = Math.max(...OD.map(d => d.v));
  const mM = Math.max(...OM.map(m => m.v));
  const tOS = OS.reduce((s, o) => s + o.c, 0);
  const f = n => n.toLocaleString('vi-VN');

  return (
    <div className="bg-black text-slate-100 min-h-screen flex flex-col selection:bg-[#c6f500] selection:text-black">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 h-14 flex items-center justify-between px-4 sm:px-6 z-30">
        <div className="flex items-center space-x-3">
          <a href="admin.html" className="flex items-center space-x-2 hover:opacity-80 transition">
            <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
              <path d="M8 12L15 28L22 12" stroke="#FFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-black italic tracking-tight">
              <span className="text-white">Vibe</span><span className="text-[#c6f500]">Flow</span>
            </span>
          </a>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[#c6f500] text-[10px] font-black uppercase">
            Thống Kê Online
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <a href="admin.html" className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 font-bold transition">
            ← Admin POS
          </a>
          <a href="admin-statistics.html" className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 font-bold transition">
            💵 TK POS Quầy
          </a>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6">
        <div className="flex items-center space-x-1 overflow-x-auto py-2">
          {[
            { id: 'overview', l: '📊 Tổng Quan' },
            { id: 'orders', l: '📦 Trạng Thái Đơn' },
            { id: 'payments', l: '💳 Thanh Toán' },
            { id: 'areas', l: '📍 Khu Vực' },
            { id: 'history', l: '📋 Đơn Hàng' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setAc(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                ac === t.id ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
          <div>
            <h1 className="text-xl font-black uppercase text-white flex items-center space-x-2">
              <span className="text-[#c6f500]">🌐</span>
              <span>Thống Kê Bán Hàng Online (160Store Style)</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Phân tích đơn đặt website, thanh toán, tỷ lệ giao hàng và phân bổ địa lý.</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: 'today', l: 'Hôm nay' },
              { id: '7days', l: '7 ngày' },
              { id: 'month', l: 'Tháng này' },
              { id: 'year', l: 'Năm 2026' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPe(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  pe === p.id ? 'bg-[#c6f500] text-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {p.l}
              </button>
            ))}
            <button
              onClick={() => alert("Đang xuất báo cáo thống kê Online ra file Excel...")}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition"
            >
              📥 Xuất Excel
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {ac === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Doanh Thu Online</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">+28.3%</span>
                </div>
                <div className="text-2xl font-black text-white">{f(tR)}₫</div>
                <div className="text-[11px] text-zinc-500">Kỳ trước: 27.100.000₫</div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Tổng Đơn Online</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">+19.5%</span>
                </div>
                <div className="text-2xl font-black text-white">{tO} đơn</div>
                <div className="text-[11px] text-zinc-500">TB {Math.round(tO / 7)} đơn/ngày</div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Tỷ Lệ Chuyển Đổi</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-[#c6f500]">+2.1%</span>
                </div>
                <div className="text-2xl font-black text-[#c6f500]">3.8%</div>
                <div className="text-[11px] text-zinc-500">Lượt truy cập: 1,247</div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Tỷ Lệ Hủy Đơn</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-400/15 text-red-400">4.3%</span>
                </div>
                <div className="text-2xl font-black text-white">3 đơn</div>
                <div className="text-[11px] text-zinc-500">Giảm so với kỳ trước (5 đơn)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-sm uppercase text-white">Doanh Thu Online 7 Ngày</h3>
                    <p className="text-[11px] text-zinc-400">Đơn đặt qua website.</p>
                  </div>
                  <span className="text-xs font-bold text-[#c6f500]">Đỉnh: {(mD / 1e6).toFixed(1)}M</span>
                </div>
                <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-zinc-800 pb-2">
                  {OD.map((it, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition font-mono mb-1">
                        {(it.v / 1e6).toFixed(1)}M
                      </div>
                      <div
                        style={{ height: `${(it.v / mD) * 100}%` }}
                        className={`w-full rounded-t-lg transition duration-300 ${
                          it.v === mD ? 'bg-[#c6f500] shadow-[0_0_15px_rgba(198,245,0,0.5)]' : 'bg-zinc-800 hover:bg-[#c6f500]/70'
                        }`}
                      ></div>
                      <span className="text-[10px] font-bold text-zinc-400 mt-2">{it.day}</span>
                      <span className="text-[9px] text-zinc-500">{it.o} đơn</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
                <h3 className="font-black text-sm uppercase text-white">🏆 Top SP Online</h3>
                <div className="space-y-2 text-xs">
                  {OTP.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900/60 transition">
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                          i === 0 ? 'bg-[#c6f500] text-black' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {i + 1}
                        </span>
                        <img src={p.i} className="w-8 h-8 rounded-lg object-cover bg-zinc-900" alt={p.n} />
                        <div>
                          <div className="font-bold text-white text-[11px]">{p.n}</div>
                          <div className="text-[10px] text-zinc-500">{p.sl} đôi</div>
                        </div>
                      </div>
                      <div className="font-black text-[#c6f500] text-[11px]">{f(p.r)}₫</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-black text-sm uppercase text-white">📈 Xu Hướng DT Online Theo Tháng</h3>
              <div className="h-40 flex items-end justify-between gap-1.5 pt-4 border-b border-zinc-800 pb-2">
                {OM.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[9px] text-zinc-400 opacity-0 group-hover:opacity-100 transition font-mono mb-1">
                      {(m.v / 1e6).toFixed(0)}M
                    </div>
                    <div
                      style={{ height: `${(m.v / mM) * 100}%` }}
                      className={`w-full rounded-t-md transition duration-300 ${
                        m.v === mM ? 'bg-[#c6f500] shadow-[0_0_10px_rgba(198,245,0,0.4)]' : 'bg-zinc-700 hover:bg-[#c6f500]/60'
                      }`}
                    ></div>
                    <span className="text-[9px] font-bold text-zinc-500 mt-1">{m.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRẠNG THÁI ĐƠN HÀNG */}
        {ac === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {OS.map((st, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">{st.st}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.cl }}></span>
                  </div>
                  <div className="text-2xl font-black text-white">{st.c} đơn</div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${(st.c / tOS) * 100}%`, backgroundColor: st.cl }} className="h-full rounded-full"></div>
                  </div>
                  <div className="text-[10px] text-zinc-500">{((st.c / tOS) * 100).toFixed(1)}% tổng đơn</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-sm uppercase text-white">Phễu Chuyển Đổi Vận Đơn Online</h3>
              <div className="space-y-3">
                {OS.map((st, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-32 font-bold text-zinc-300 truncate">{st.st}</span>
                    <div className="flex-1 bg-zinc-900 rounded-full h-6 overflow-hidden">
                      <div
                        style={{ width: `${(st.c / tOS) * 100}%`, backgroundColor: st.cl }}
                        className="h-full rounded-full flex items-center justify-end pr-3"
                      >
                        <span className="text-[10px] font-black text-black">{st.c} đơn</span>
                      </div>
                    </div>
                    <span className="w-16 text-right font-bold text-zinc-400">{((st.c / tOS) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHƯƠNG THỨC THANH TOÁN */}
        {ac === 'payments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {OP.map((pm, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-400">{pm.m}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: `${pm.cl}20`, color: pm.cl }}>
                      {pm.p}%
                    </span>
                  </div>
                  <div className="text-xl font-black text-white">{f(pm.a)}₫</div>
                  <div className="text-[11px] text-zinc-500">{pm.c} giao dịch</div>
                  <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden">
                    <div style={{ width: `${pm.p}%`, backgroundColor: pm.cl }} className="h-full rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-black text-sm uppercase text-white">Tỷ Trọng Cổng Thanh Toán</h3>
              <div className="flex h-10 rounded-xl overflow-hidden">
                {OP.map((pm, i) => (
                  <div
                    key={i}
                    style={{ width: `${pm.p}%`, backgroundColor: pm.cl }}
                    className="h-full flex items-center justify-center text-[10px] font-bold text-black hover:opacity-80 transition"
                  >
                    {pm.p >= 15 && `${pm.m} (${pm.p}%)`}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                {OP.map((pm, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: pm.cl }}></span>
                    <span className="text-zinc-300">{pm.m}: <b>{f(pm.a)}₫</b> ({pm.p}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PHÂN BỔ KHU VỰC */}
        {ac === 'areas' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {OA.map((a, i) => (
              <div key={i} className={`bg-zinc-950 border rounded-2xl p-5 space-y-4 ${i === 0 ? 'border-[#c6f500]/50' : 'border-zinc-800'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Khu Vực Giao Hàng</div>
                    <div className="font-bold text-white text-base mt-0.5">{a.area}</div>
                  </div>
                  {i === 0 && <span className="px-2 py-0.5 bg-[#c6f500]/15 text-[#c6f500] text-[10px] font-bold rounded">TOP 1</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-900 rounded-xl p-3 text-center">
                    <div className="text-zinc-500 text-[10px]">Doanh Thu</div>
                    <div className="font-black text-[#c6f500] text-base">{(a.r / 1e6).toFixed(1)}M</div>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-3 text-center">
                    <div className="text-zinc-500 text-[10px]">Đơn Hàng</div>
                    <div className="font-black text-white text-base">{a.o}</div>
                  </div>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div style={{ width: `${a.p}%` }} className="h-full bg-[#c6f500] rounded-full"></div>
                </div>
                <div className="text-right text-[10px] text-zinc-500">Chiếm {a.p}% tổng đơn toàn quốc</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: LỊCH SỬ ĐƠN HÀNG */}
        {ac === 'history' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Mã Đơn</th>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Khách Hàng</th>
                  <th className="p-3.5">Khu Vực</th>
                  <th className="p-3.5">Sản Phẩm Đặt Mua</th>
                  <th className="p-3.5 text-right">Tổng Tiền</th>
                  <th className="p-3.5">Thanh Toán</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {OTX.map((t, i) => (
                  <tr key={i} className="hover:bg-zinc-900/40 transition">
                    <td className="p-3.5 font-mono font-bold text-[#c6f500]">#{t.id}</td>
                    <td className="p-3.5 text-zinc-300">{t.t}</td>
                    <td className="p-3.5 font-bold text-white">{t.cu}</td>
                    <td className="p-3.5 text-zinc-400">{t.addr}</td>
                    <td className="p-3.5 text-zinc-300">{t.it}</td>
                    <td className="p-3.5 text-right font-black text-white">{f(t.to)}₫</td>
                    <td className="p-3.5 text-zinc-300">{t.pa}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.st === 'Đã giao'
                          ? 'bg-[#c6f500]/15 text-[#c6f500]'
                          : t.st === 'Chờ xác nhận'
                          ? 'bg-amber-400/15 text-amber-400'
                          : t.st === 'Đang giao'
                          ? 'bg-purple-400/15 text-purple-400'
                          : t.st === 'Đang đóng gói'
                          ? 'bg-blue-400/15 text-blue-400'
                          : 'bg-red-400/15 text-red-400'
                      }`}>
                        {t.st}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-3 text-center text-[11px] text-zinc-500">
        © 2026 VibeFlow Sneakers • Thống Kê Bán Hàng Online
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

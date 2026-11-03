import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { INITIAL_PRODUCTS, VOUCHERS } from '../data/mockData';
import { useAuthStore } from '../store';

// maVaiTro trong DB: ADMIN, NHAN_VIEN, KHACH_HANG
const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];

export default function OnlineStore({ session: propSession, onLogout: propLogout }) {
  const navigate     = useNavigate();
  const storeSession = useAuthStore((s) => s.session);
  const hasHydrated  = useAuthStore((s) => s._hasHydrated);
  const storeLogout  = useAuthStore((s) => s.logout);
  const session      = propSession || storeSession;
  const isStaff      = STAFF_ROLES.includes((session?.role || '').toUpperCase());

  // Nếu đã đăng nhập là nhân viên/admin → redirect thẳng về /admin
  useEffect(() => {
    if (!hasHydrated) return;
    if (session && STAFF_ROLES.includes((session.role || '').toUpperCase())) {
      navigate('/admin', { replace: true });
    }
  }, [hasHydrated, session, navigate]);

  const handleLogout = () => {
    if (typeof propLogout === 'function') propLogout();
    storeLogout();
    navigate('/login');
  };

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'catalog' | 'customer'
  const [customerSubTab, setCustomerSubTab] = useState('orders'); // 'orders' | 'profile' | 'password'

  // Search & Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [priceRange, setPriceRange] = useState('all');

  // Product Detail Modal
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailSize, setDetailSize] = useState('42');
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Cart & Discount
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([
    { product: INITIAL_PRODUCTS[0], size: '42', color: 'Xám Khói (Shadow)', qty: 1 }
  ]);
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Checkout Form
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState(session?.name || "Nguyễn Văn An");
  const [checkoutPhone, setCheckoutPhone] = useState(session?.phone || "0987.654.321");
  const [checkoutAddress, setCheckoutAddress] = useState("128 Phố Huế, Hoàn Kiếm, Hà Nội");
  const [checkoutNote, setCheckoutNote] = useState("");
  const [checkoutPayment, setCheckoutPayment] = useState("Thanh toán khi nhận hàng (COD)");

  // Customer Orders State (CHỈ QUẢN LÝ ĐƠN HÀNG CÁ NHÂN CỦA KHÁCH: XEM, SỬA ĐỊA CHỈ, HỦY ĐƠN)
  const [myOrders, setMyOrders] = useState([
    {
      id: "ORD-9821",
      items: [
        { name: "Nike Air Jordan 1 Retro High Shadow 2.0", size: "42", color: "Xám Khói", qty: 1, price: 4850000 }
      ],
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
      date: "14:15 - Hôm nay",
      total: 4850000,
      recipientName: "Nguyễn Văn An",
      phone: "0987.654.321",
      address: "128 Phố Huế, Hoàn Kiếm, Hà Nội",
      note: "Gọi trước khi giao hàng 15 phút",
      paymentMethod: "Chuyển khoản VietQR",
      status: "Chờ xác nhận", // 'Chờ xác nhận' | 'Đang đóng gói' | 'Đang giao' | 'Đã giao' | 'Đã hủy'
      cancelReason: null
    },
    {
      id: "ORD-8940",
      items: [
        { name: "Adidas Samba Classic OG White", size: "41", color: "Trắng Viền Đen", qty: 1, price: 2450000 }
      ],
      image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80",
      date: "02/10/2026",
      total: 2450000,
      recipientName: "Nguyễn Văn An",
      phone: "0987.654.321",
      address: "128 Phố Huế, Hoàn Kiếm, Hà Nội",
      note: "Giao giờ hành chính",
      paymentMethod: "Thanh toán khi nhận hàng (COD)",
      status: "Đã giao thành công",
      cancelReason: null
    }
  ]);

  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'Chờ xác nhận' | 'Đang giao' | 'Đã giao' | 'Đã hủy'
  const [viewingOrderDetail, setViewingOrderDetail] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [cancelingOrder, setCancelingOrder] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("Đổi ý không mua nữa");

  // Filtering Products
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false;
      }
      if (selectedSize && !p.sizes.includes(selectedSize)) {
        return false;
      }
      if (priceRange === 'under-2m' && p.price >= 2000000) return false;
      if (priceRange === '2m-4m' && (p.price < 2000000 || p.price > 4000000)) return false;
      if (priceRange === 'over-4m' && p.price <= 4000000) return false;
      return true;
    });
  }, [searchQuery, selectedBrands, selectedSize, priceRange]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  }, [cart]);

  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Cart Handlers
  const handleAddToCart = (product, size) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { product, size, color: product.colors[0], qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (idx, delta) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[idx].qty + delta;
      if (newQty <= 0) updated.splice(idx, 1);
      else updated[idx].qty = newQty;
      return updated;
    });
  };

  const handleApplyVoucher = () => {
    const v = VOUCHERS.find((x) => x.code === voucherCode.trim().toUpperCase());
    if (v) {
      if (cartSubtotal >= v.minOrder) {
        setDiscountAmount(v.discount);
        alert(`🎉 Áp dụng mã voucher ${v.code} thành công: Giảm ${v.discount.toLocaleString('vi-VN')}₫`);
      } else {
        alert(`Đơn hàng cần đạt tối thiểu ${v.minOrder.toLocaleString('vi-VN')}₫ để dùng mã này!`);
      }
    } else {
      alert("Mã voucher không hợp lệ! Hãy thử nhập: KICKS100K hoặc VIBEFLOW10");
    }
  };

  // Checkout & Order Placement
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const newId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: newId,
      items: cart.map(i => ({
        name: i.product.name,
        size: i.size,
        color: i.color,
        qty: i.qty,
        price: i.product.price
      })),
      image: cart[0]?.product.image,
      date: "Vừa xong",
      total: cartTotal,
      recipientName: checkoutName,
      phone: checkoutPhone,
      address: checkoutAddress,
      note: checkoutNote,
      paymentMethod: checkoutPayment,
      status: "Chờ xác nhận",
      cancelReason: null
    };

    setMyOrders(prev => [newOrder, ...prev]);
    alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\nMã đơn: #${newId}\nTổng thanh toán: ${cartTotal.toLocaleString('vi-VN')}₫\nBạn có thể theo dõi tiến độ, sửa thông tin nhận hoặc hủy đơn trong mục "Đơn Hàng Của Tôi".`);
    setCart([]);
    setIsCheckoutOpen(false);
    setActiveTab('customer');
    setCustomerSubTab('orders');
  };

  // Cancel Order Handler
  const confirmCancelOrder = () => {
    if (!cancelingOrder) return;
    setMyOrders(prev => prev.map(ord => ord.id === cancelingOrder.id ? { ...ord, status: "Đã hủy", cancelReason: cancelReasonInput } : ord));
    alert(`Đã hủy thành công đơn hàng #${cancelingOrder.id}!`);
    setCancelingOrder(null);
  };

  // Save Edit Order Handler
  const saveEditedOrder = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    setMyOrders(prev => prev.map(ord => ord.id === editingOrder.id ? editingOrder : ord));
    alert(`Đã cập nhật thông tin giao hàng cho đơn #${editingOrder.id}!`);
    setEditingOrder(null);
  };

  const filteredMyOrders = myOrders.filter(ord => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'Đã giao') return ord.status.includes('Đã giao');
    return ord.status === orderFilter;
  });

  return (
    <div className="bg-black text-slate-100 min-h-screen flex flex-col selection:bg-[#c6f500] selection:text-black">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-xs py-2 px-4 text-center font-semibold border-b border-zinc-800 flex items-center justify-center space-x-2">
        <span className="bg-[#c6f500] text-black font-black text-[10px] px-2 py-0.5 rounded uppercase">VIBE ONLINE</span>
        <span className="text-zinc-300">🔥 SIÊU HỘI SNEAKER: GIẢM 40% AIR JORDAN & DUNK - MÃ: <span className="text-[#c6f500] font-bold">KICKS100K</span></span>
      </div>

      {/* Customer Header (KHÔNG CÓ NÚT QUẢN TRỊ POS CỦA ADMIN) */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div onClick={() => setActiveTab('home')} className="flex items-center space-x-2 cursor-pointer">
            <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
              <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4.5" strokeLinecap="round"/>
            </svg>
            <span className="text-2xl font-black italic tracking-tight">
              <span className="text-white">Vibe</span><span className="text-[#c6f500]">Flow</span>
            </span>
          </div>

          <nav className="hidden md:flex space-x-6 text-xs uppercase font-extrabold tracking-wider text-zinc-300">
            <button onClick={() => setActiveTab('home')} className={`py-1 border-b-2 transition ${activeTab === 'home' ? 'text-[#c6f500] border-[#c6f500]' : 'border-transparent hover:text-white'}`}>
              Trang Chủ
            </button>
            <button onClick={() => setActiveTab('catalog')} className={`py-1 border-b-2 transition ${activeTab === 'catalog' ? 'text-[#c6f500] border-[#c6f500]' : 'border-transparent hover:text-white'}`}>
              Tất Cả Giày
            </button>
            <button onClick={() => { setSelectedBrands(['Jordan']); setActiveTab('catalog'); }} className="py-1 text-[#c6f500] hover:underline">
              Air Jordan ⚡
            </button>
            <button onClick={() => setActiveTab('customer')} className={`py-1 border-b-2 transition ${activeTab === 'customer' ? 'text-[#c6f500] border-[#c6f500]' : 'border-transparent hover:text-white'}`}>
              Đơn Hàng Của Tôi
            </button>
          </nav>
        </div>

        {/* Customer Actions */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Tìm Jordan, Nike, size..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if (activeTab !== 'catalog') setActiveTab('catalog'); }}
            className="hidden sm:block w-48 bg-zinc-900 border border-zinc-700 text-xs px-3.5 py-1.5 rounded-full text-white focus:outline-none focus:border-[#c6f500]"
          />

          {/* Nút chuyển sang Admin POS nếu là tài khoản Quản trị / Thu ngân */}
          {isStaff && (
            <Link
              to="/admin"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#c6f500] text-xs font-bold text-[#c6f500] transition"
              title="Mở Bàn Làm Việc Quản Trị & Thu Ngân POS"
            >
              <span>🛡️</span>
              <span className="hidden md:inline">Quản Trị POS</span>
            </Link>
          )}

          {session ? (
            <div className="flex items-center space-x-2">
              <button onClick={() => setActiveTab('customer')} className="flex items-center space-x-1.5 p-1.5 rounded-xl hover:bg-zinc-900 text-xs font-bold text-zinc-200">
                <div className="w-7 h-7 rounded-full bg-[#c6f500] text-black font-black text-xs flex items-center justify-center">
                  {session?.name ? session.name.charAt(0) : 'U'}
                </div>
                <span className="hidden lg:inline">{session?.name || 'Tài Khoản'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-400 text-xs font-bold px-2 py-1 transition"
                title="Đăng xuất khỏi tài khoản"
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl bg-[#c6f500] text-black text-xs font-extrabold uppercase tracking-wide hover:bg-[#b0dc00] transition"
            >
              Đăng Nhập
            </Link>
          )}

          <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#c6f500] text-zinc-200">
            🛒
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#c6f500] text-black font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* VIEW 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl z-10">
                <span className="px-3 py-1 rounded-full bg-[#c6f500]/10 text-[#c6f500] text-xs font-black uppercase tracking-wider border border-[#c6f500]/30">
                  ⚡ 100% Sneaker Chính Hãng • Bảo Hành 6 Tháng
                </span>
                <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tight text-white leading-tight">
                  ĐỊNH HÌNH PHONG CÁCH <br />
                  <span className="text-[#c6f500]">SNEAKER STREETWEAR</span>
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm">
                  Thương hiệu thời trang đường phố chuẩn phong cách 160Store. Hỗ trợ đổi size tận nơi 7 ngày, kiểm tra hàng trước khi thanh toán.
                </p>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setActiveTab('catalog')} className="px-6 py-3 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs rounded-xl transition shadow">
                    Mua Sắm Ngay ➔
                  </button>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80"
                alt="Sneaker Hero"
                className="w-full max-w-md transform -rotate-12 hover:rotate-0 transition duration-500 drop-shadow-2xl"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase text-white flex items-center space-x-2">
                  <span className="text-[#c6f500]">⚡</span> <span>Sản Phẩm Đang Hot</span>
                </h2>
                <button onClick={() => setActiveTab('catalog')} className="text-xs text-[#c6f500] hover:underline font-bold">
                  Xem tất cả ({INITIAL_PRODUCTS.length} mẫu) ➔
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {INITIAL_PRODUCTS.map((prod) => (
                  <div key={prod.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 hover:border-[#c6f500] transition flex flex-col justify-between group">
                    <div className="aspect-square rounded-xl bg-zinc-900 overflow-hidden mb-3 relative cursor-pointer" onClick={() => { setDetailProduct(prod); setDetailSize(prod.sizes[0]); }}>
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      {prod.isFlashSale && (
                        <span className="absolute top-2 left-2 bg-[#c6f500] text-black text-[10px] font-black px-2 py-0.5 rounded">
                          HOT SALE
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{prod.brand}</span>
                      <h3 onClick={() => { setDetailProduct(prod); setDetailSize(prod.sizes[0]); }} className="font-bold text-xs text-white line-clamp-2 mt-0.5 cursor-pointer hover:text-[#c6f500]">
                        {prod.name}
                      </h3>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800">
                        <span className="font-black text-xs sm:text-sm text-[#c6f500]">{prod.price.toLocaleString('vi-VN')}₫</span>
                        <button
                          onClick={() => { setDetailProduct(prod); setDetailSize(prod.sizes[0]); }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-[#c6f500] hover:text-black text-xs font-bold transition"
                        >
                          Chọn Size
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CATALOG & FILTERS */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-6 h-fit">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="font-black text-sm text-white uppercase">Bộ Lọc Tìm Kiếm</span>
                <button
                  onClick={() => { setSelectedBrands([]); setSelectedSize(null); setPriceRange('all'); setSearchQuery(''); }}
                  className="text-[11px] text-[#c6f500] hover:underline"
                >
                  Xóa lọc
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Thương Hiệu</label>
                {['Nike', 'Jordan', 'Adidas', 'New Balance'].map((b) => (
                  <label key={b} className="flex items-center space-x-2 text-xs text-zinc-400 mb-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBrands([...selectedBrands, b]);
                        else setSelectedBrands(selectedBrands.filter((x) => x !== b));
                      }}
                      className="accent-[#c6f500]"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Kích Cỡ Giày (EU)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['38', '39', '40', '41', '42', '43', '44'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                        selectedSize === s ? 'bg-[#c6f500] text-black border-[#c6f500]' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Khoảng Giá</label>
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under-2m', label: 'Dưới 2.000.000₫' },
                  { id: '2m-4m', label: 'Từ 2 - 4 Triệu' },
                  { id: 'over-4m', label: 'Trên 4 Triệu' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center space-x-2 text-xs text-zinc-400 mb-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="store-price-opt"
                      checked={priceRange === item.id}
                      onChange={() => setPriceRange(item.id)}
                      className="accent-[#c6f500]"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="mb-4 flex justify-between items-center text-xs text-zinc-400">
                <span>Tìm thấy <b className="text-white">{filteredProducts.length}</b> sản phẩm</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <div key={prod.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 hover:border-[#c6f500] transition flex flex-col justify-between group">
                    <div className="aspect-square rounded-xl bg-zinc-900 overflow-hidden mb-3 relative cursor-pointer" onClick={() => { setDetailProduct(prod); setDetailSize(prod.sizes[0]); }}>
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{prod.brand}</span>
                      <h3 onClick={() => { setDetailProduct(prod); setDetailSize(prod.sizes[0]); }} className="font-bold text-xs text-white line-clamp-2 mt-0.5 cursor-pointer hover:text-[#c6f500]">
                        {prod.name}
                      </h3>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800">
                        <span className="font-black text-xs sm:text-sm text-[#c6f500]">{prod.price.toLocaleString('vi-VN')}₫</span>
                        <button
                          onClick={() => { setDetailProduct(prod); setDetailSize(prod.sizes[0]); }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-[#c6f500] hover:text-black text-xs font-bold transition"
                        >
                          Chọn Size
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CUSTOMER PORTAL (ĐƠN HÀNG CỦA TÔI, SỬA ĐỊA CHỈ, CHECK HỦY ĐƠN - KHÔNG CÓ THỐNG KÊ DOANH THU) */}
        {activeTab === 'customer' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Customer Profile Banner */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-[#c6f500] text-black font-black text-2xl flex items-center justify-center">
                  {session?.name ? session.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{session?.name || 'Nguyễn Văn An'}</h2>
                  <div className="text-xs text-zinc-400">{session?.phone || '0987.654.321'} • {session?.email || 'an.nguyen@vibeflow.vn'}</div>
                  <div className="mt-1 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 text-[11px] font-bold">
                    <span>👑 Thẻ VIP Vàng (Gold) • Tích lũy: 850 Điểm</span>
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-zinc-900 hover:bg-red-500/20 hover:text-red-400 border border-zinc-700 text-xs font-bold rounded-xl transition">
                Đăng Xuất
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex space-x-6 border-b border-zinc-800 text-xs font-bold">
              <button
                onClick={() => setCustomerSubTab('orders')}
                className={`py-3 border-b-2 transition ${customerSubTab === 'orders' ? 'border-[#c6f500] text-[#c6f500]' : 'border-transparent text-zinc-400 hover:text-white'}`}
              >
                Đơn Hàng Của Tôi ({myOrders.length})
              </button>
              <button
                onClick={() => setCustomerSubTab('profile')}
                className={`py-3 border-b-2 transition ${customerSubTab === 'profile' ? 'border-[#c6f500] text-[#c6f500]' : 'border-transparent text-zinc-400 hover:text-white'}`}
              >
                Thông Tin Cá Nhân
              </button>
              <button
                onClick={() => setCustomerSubTab('password')}
                className={`py-3 border-b-2 transition ${customerSubTab === 'password' ? 'border-[#c6f500] text-[#c6f500]' : 'border-transparent text-zinc-400 hover:text-white'}`}
              >
                Đổi Mật Khẩu
              </button>
            </div>

            {/* TAB: ORDERS LIST */}
            {customerSubTab === 'orders' && (
              <div className="space-y-4">
                {/* Order Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Tất cả đơn' },
                    { id: 'Chờ xác nhận', label: 'Chờ xác nhận (Có thể hủy/sửa)' },
                    { id: 'Đang giao', label: 'Đang vận chuyển' },
                    { id: 'Đã giao', label: 'Đã hoàn thành' },
                    { id: 'Đã hủy', label: 'Đã hủy' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        orderFilter === f.id ? 'bg-[#c6f500] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredMyOrders.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-950 rounded-2xl border border-zinc-800">
                    Không có đơn hàng nào trong mục này.
                  </div>
                ) : (
                  filteredMyOrders.map((ord) => (
                    <div key={ord.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-zinc-700 transition">
                      <div className="flex items-start space-x-3.5">
                        <img src={ord.image} className="w-14 h-14 rounded-xl object-cover bg-zinc-900 shrink-0" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-[#c6f500]">#{ord.id}</span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-zinc-400 text-[11px]">{ord.date}</span>
                          </div>
                          <div className="font-bold text-white leading-tight">
                            {ord.items.map(i => `${i.qty}x ${i.name} (Sz ${i.size})`).join(', ')}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Người nhận: <b>{ord.recipientName}</b> ({ord.phone}) • {ord.address}
                          </div>
                          {ord.cancelReason && (
                            <div className="text-[11px] text-red-400 italic">
                              Lý do hủy: {ord.cancelReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-900">
                        <div className="text-left md:text-right">
                          <div className="font-black text-sm text-[#c6f500]">{ord.total.toLocaleString('vi-VN')}₫</div>
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold mt-1 ${
                            ord.status === 'Chờ xác nhận'
                              ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                              : ord.status === 'Đã hủy'
                              ? 'bg-red-400/15 text-red-400 border border-red-400/30'
                              : 'bg-[#c6f500]/15 text-[#c6f500] border border-[#c6f500]/30'
                          }`}>
                            {ord.status}
                          </span>
                        </div>

                        {/* Customer Order Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setViewingOrderDetail(ord)}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition"
                          >
                            Xem Chi Tiết
                          </button>

                          {/* Sửa thông tin khi đơn còn 'Chờ xác nhận' */}
                          {ord.status === 'Chờ xác nhận' && (
                            <>
                              <button
                                onClick={() => setEditingOrder({ ...ord })}
                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[#c6f500] text-xs font-bold rounded-xl transition"
                                title="Sửa tên, SĐT hoặc địa chỉ nhận hàng"
                              >
                                Sửa Địa Chỉ
                              </button>
                              <button
                                onClick={() => setCancelingOrder(ord)}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition"
                                title="Hủy đơn hàng nếu đổi ý"
                              >
                                Hủy Đơn
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: PROFILE */}
            {customerSubTab === 'profile' && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-xs space-y-4">
                <h3 className="font-black text-sm uppercase text-white">Thông Tin Tài Khoản Khách Hàng</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Họ và tên</label>
                    <input defaultValue={session?.name || "Nguyễn Văn An"} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Số điện thoại</label>
                    <input defaultValue={session?.phone || "0987.654.321"} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Email</label>
                    <input defaultValue={session?.email || "an.nguyen@vibeflow.vn"} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Địa chỉ mặc định</label>
                    <input defaultValue="128 Phố Huế, Hoàn Kiếm, Hà Nội" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white" />
                  </div>
                </div>
                <button onClick={() => alert("Đã lưu thông tin cá nhân!")} className="px-4 py-2 bg-[#c6f500] text-black font-bold rounded-xl">
                  Lưu Thay Đổi
                </button>
              </div>
            )}

            {/* TAB: PASSWORD */}
            {customerSubTab === 'password' && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-xs space-y-4 max-w-md">
                <h3 className="font-black text-sm uppercase text-white">Đổi Mật Khẩu Đăng Nhập</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Mật khẩu hiện tại</label>
                    <input type="password" defaultValue="123456" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Mật khẩu mới</label>
                    <input type="password" placeholder="Nhập ít nhất 6 ký tự..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white" />
                  </div>
                </div>
                <button onClick={() => alert("Đã cập nhật mật khẩu mới thành công!")} className="px-4 py-2 bg-[#c6f500] text-black font-bold rounded-xl">
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: XEM CHI TIẾT ĐƠN HÀNG CỦA KHÁCH */}
      {viewingOrderDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Chi Tiết Đơn Hàng</span>
                <h3 className="font-mono font-black text-sm text-[#c6f500]">#{viewingOrderDetail.id}</h3>
              </div>
              <button onClick={() => setViewingOrderDetail(null)} className="text-zinc-400 hover:text-white font-bold text-base">✕</button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <div className="font-bold text-white">Sản phẩm đặt mua:</div>
                {viewingOrderDetail.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-zinc-300">
                    <span>{it.qty}x {it.name} (Size {it.size} - {it.color})</span>
                    <span className="font-bold text-[#c6f500]">{it.price.toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-zinc-400">
                <div className="flex justify-between">
                  <span>Trạng thái đơn:</span>
                  <b className="text-white">{viewingOrderDetail.status}</b>
                </div>
                <div className="flex justify-between">
                  <span>Người nhận:</span>
                  <b className="text-white">{viewingOrderDetail.recipientName} ({viewingOrderDetail.phone})</b>
                </div>
                <div className="flex justify-between">
                  <span>Địa chỉ giao hàng:</span>
                  <b className="text-white text-right max-w-xs">{viewingOrderDetail.address}</b>
                </div>
                <div className="flex justify-between">
                  <span>Ghi chú đơn hàng:</span>
                  <span className="text-white">{viewingOrderDetail.note || "Không có"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phương thức thanh toán:</span>
                  <b className="text-white">{viewingOrderDetail.paymentMethod}</b>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#c6f500]">{viewingOrderDetail.total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button onClick={() => setViewingOrderDetail(null)} className="w-full py-2.5 bg-zinc-800 text-white font-bold rounded-xl">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SỬA THÔNG TIN NHẬN HÀNG (DÀNH CHO KHÁCH TRƯỚC KHI GIAO) */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm uppercase text-white">Sửa Thông Tin Nhận Hàng (#{editingOrder.id})</h3>
              <button onClick={() => setEditingOrder(null)} className="text-zinc-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={saveEditedOrder} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Họ Tên Người Nhận</label>
                <input
                  required
                  value={editingOrder.recipientName}
                  onChange={(e) => setEditingOrder({ ...editingOrder, recipientName: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Số Điện Thoại</label>
                <input
                  required
                  value={editingOrder.phone}
                  onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Địa Chỉ Nhận Hàng</label>
                <textarea
                  required
                  rows={2}
                  value={editingOrder.address}
                  onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                  className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Ghi Chú Giao Hàng</label>
                <input
                  value={editingOrder.note || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, note: e.target.value })}
                  placeholder="Ví dụ: Gọi trước khi giao, giao sau 18h..."
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingOrder(null)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl">
                  Hủy
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-[#c6f500] text-black font-black uppercase rounded-xl">
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHECK HỦY ĐƠN HÀNG (CHO KHÁCH CHỌN LÝ DO HỦY) */}
      {cancelingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm uppercase text-red-400">Xác Nhận Hủy Đơn Hàng #{cancelingOrder.id}</h3>
              <button onClick={() => setCancelingOrder(null)} className="text-zinc-400 hover:text-white font-bold">✕</button>
            </div>

            <p className="text-zinc-300">
              Bạn có chắc chắn muốn hủy đơn hàng <b>#{cancelingOrder.id}</b> trị giá <b>{cancelingOrder.total.toLocaleString('vi-VN')}₫</b> không?
            </p>

            <div>
              <label className="block text-zinc-400 mb-1 font-bold">Vui lòng chọn lý do hủy:</label>
              <select
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white"
              >
                <option>Đổi ý không mua nữa</option>
                <option>Muốn đổi sang màu hoặc size khác</option>
                <option>Nhập nhầm địa chỉ nhận hàng</option>
                <option>Tìm thấy nơi bán giá tốt hơn</option>
                <option>Thời gian giao hàng không phù hợp</option>
                <option>Lý do khác</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setCancelingOrder(null)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl">
                Giữ Đơn Hàng
              </button>
              <button onClick={confirmCancelOrder} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded-xl">
                Xác Nhận Hủy Đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 relative overflow-hidden">
            <button onClick={() => setDetailProduct(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-lg">✕</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <img src={detailProduct.image} alt={detailProduct.name} className="rounded-2xl object-cover w-full aspect-square bg-zinc-950" />
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#c6f500] uppercase tracking-wider">{detailProduct.brand}</span>
                <h3 className="text-lg font-black text-white">{detailProduct.name}</h3>
                <div className="text-xl font-black text-[#c6f500]">{detailProduct.price.toLocaleString('vi-VN')}₫</div>

                <div>
                  <div className="flex justify-between items-center text-xs text-zinc-300 mb-1.5">
                    <span>Chọn Kích Cỡ: <b>{detailSize}</b></span>
                    <button onClick={() => setShowSizeChart(true)} className="text-[#c6f500] text-[11px] underline">
                      Bảng Size Chuẩn
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {detailProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setDetailSize(s)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold border ${detailSize === s ? 'bg-[#c6f500] text-black border-[#c6f500]' : 'bg-black border-zinc-700 text-white'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(detailProduct, detailSize);
                    setDetailProduct(null);
                  }}
                  className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs rounded-xl transition shadow-lg"
                >
                  Thêm Vào Giỏ Hàng 🛒
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIZE CHART MODAL */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-white uppercase">Bảng Quy Đổi Size Sneaker Chuẩn</h4>
              <button onClick={() => setShowSizeChart(false)} className="text-zinc-400 hover:text-white font-bold">✕</button>
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2">EU (Việt Nam)</th>
                  <th className="py-2">US</th>
                  <th className="py-2">Chiều dài chân (cm)</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-zinc-800/50"><td className="py-2">38</td><td>5.5</td><td>24.0 cm</td></tr>
                <tr className="border-b border-zinc-800/50"><td className="py-2">39</td><td>6.5</td><td>24.5 cm</td></tr>
                <tr className="border-b border-zinc-800/50"><td className="py-2">40</td><td>7.0</td><td>25.0 cm</td></tr>
                <tr className="border-b border-zinc-800/50"><td className="py-2">41</td><td>8.0</td><td>26.0 cm</td></tr>
                <tr className="border-b border-zinc-800/50"><td className="py-2 text-[#c6f500] font-bold">42</td><td>8.5</td><td>26.5 cm</td></tr>
                <tr className="border-b border-zinc-800/50"><td className="py-2">43</td><td>9.5</td><td>27.5 cm</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-end">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <h3 className="font-black uppercase text-sm text-white">Giỏ Hàng ({cart.length})</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white font-bold">✕</button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-xs">Giỏ hàng đang trống!</div>
              ) : (
                <div className="divide-y divide-zinc-800 my-4 max-h-[50vh] overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center space-x-3 text-xs">
                      <img src={item.product.image} className="w-14 h-14 rounded-xl object-cover bg-zinc-900" />
                      <div className="flex-1">
                        <h4 className="font-bold text-white line-clamp-1">{item.product.name}</h4>
                        <div className="text-zinc-400 text-[11px]">Size: <b>{item.size}</b></div>
                        <div className="text-[#c6f500] font-bold mt-1">{item.product.price.toLocaleString('vi-VN')}₫</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleUpdateQty(idx, -1)} className="w-6 h-6 rounded bg-zinc-800 text-white">-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => handleUpdateQty(idx, 1)} className="w-6 h-6 rounded bg-zinc-800 text-white">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mã voucher (KICKS100K)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button onClick={handleApplyVoucher} className="px-3 py-2 bg-zinc-800 text-[#c6f500] font-bold text-xs rounded-xl">
                  Áp Dụng
                </button>
              </div>

              <div className="text-xs space-y-1.5 pt-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Tạm tính:</span>
                  <span>{cartSubtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#c6f500]">
                    <span>Giảm voucher:</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                  <span>Tổng tiền:</span>
                  <span className="text-[#c6f500]">{cartTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs rounded-xl transition shadow"
              >
                Tiến Hành Đặt Hàng ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-black text-sm uppercase text-white">Thanh Toán Đặt Hàng VibeFlow</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-zinc-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Họ Tên Người Nhận</label>
                <input required value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Số Điện Thoại</label>
                <input required value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Địa Chỉ Nhận Hàng</label>
                <input required value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Ghi Chú Đơn Hàng (tùy chọn)</label>
                <input value={checkoutNote} onChange={(e) => setCheckoutNote(e.target.value)} placeholder="Giao giờ hành chính, gọi trước khi đến..." className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Phương Thức Thanh Toán</label>
                <select value={checkoutPayment} onChange={(e) => setCheckoutPayment(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-white">
                  <option>Thanh toán khi nhận hàng (COD)</option>
                  <option>Quét mã VietQR (Tự động nhận diện)</option>
                  <option>Ví MoMo / VNPay</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase rounded-xl">
                  Xác Nhận Đặt Hàng ({cartTotal.toLocaleString('vi-VN')}₫) ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

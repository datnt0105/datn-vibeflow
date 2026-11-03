// Mock Data cho Hệ Thống Bán Giày VibeFlow Omnichannel

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    sku: "NK-AJ1-SHD-01",
    barcode: "89385012301",
    name: "Nike Air Jordan 1 Retro High Shadow 2.0",
    brand: "Jordan",
    price: 4850000,
    originalPrice: 5600000,
    cost: 3200000,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
    colors: ["Xám Khói (Shadow)", "Đen Stealth", "Trắng Bạc"],
    sizes: ["39", "40", "41", "42", "43", "44"],
    stock: 24,
    supplier: "Nike Vietnam Distribution",
    isFlashSale: true
  },
  {
    id: 2,
    sku: "NK-DNK-PND-02",
    barcode: "89385012302",
    name: "Nike Dunk Low Retro White Black 'Panda'",
    brand: "Nike",
    price: 3150000,
    originalPrice: 3800000,
    cost: 2100000,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    colors: ["Trắng Đen (Panda)", "Xanh Varsity", "Hồng Pastel"],
    sizes: ["38", "39", "40", "41", "42", "43"],
    stock: 45,
    supplier: "Nike Vietnam Distribution",
    isFlashSale: true
  },
  {
    id: 3,
    sku: "AD-SMB-OG-03",
    barcode: "89385012303",
    name: "Adidas Originals Samba Classic OG White",
    brand: "Adidas",
    price: 2450000,
    originalPrice: 2800000,
    cost: 1600000,
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80",
    colors: ["Trắng Viền Đen", "Đen Viền Trắng", "Kem Cổ Điển"],
    sizes: ["38", "39", "40", "41", "42"],
    stock: 38,
    supplier: "Adidas Indochina",
    isFlashSale: false
  },
  {
    id: 4,
    sku: "NK-AF1-WHT-04",
    barcode: "89385012304",
    name: "Nike Air Force 1 '07 All White Triple",
    brand: "Nike",
    price: 2650000,
    originalPrice: 2950000,
    cost: 1800000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
    colors: ["Triple White", "White Black Swoosh"],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    stock: 52,
    supplier: "Nike Vietnam Distribution",
    isFlashSale: false
  },
  {
    id: 5,
    sku: "NB-550-WGR-05",
    barcode: "89385012305",
    name: "New Balance 550 White Green Vintage",
    brand: "New Balance",
    price: 3200000,
    originalPrice: 3600000,
    cost: 2200000,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80",
    colors: ["Trắng Xanh Lá", "Trắng Navy", "Xám Be"],
    sizes: ["39", "40", "41", "42", "43"],
    stock: 19,
    supplier: "New Balance Global Trading",
    isFlashSale: false
  },
  {
    id: 6,
    sku: "AD-YZY-350-06",
    barcode: "89385012306",
    name: "Adidas Yeezy Boost 350 V2 Onyx",
    brand: "Adidas",
    price: 6800000,
    originalPrice: 7500000,
    cost: 5100000,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
    colors: ["Onyx All Black", "Bone White", "Zebra"],
    sizes: ["40", "41", "42", "43", "44"],
    stock: 8,
    supplier: "Adidas Indochina",
    isFlashSale: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-9821",
    channel: "Online Store",
    customer: "Nguyễn Văn An",
    phone: "0987.654.321",
    time: "14:15 - Hôm nay",
    itemsSummary: "1x Jordan 1 Retro High Shadow (Sz 42)",
    total: 4850000,
    payment: "Chuyển khoản VietQR",
    status: "pending"
  },
  {
    id: "POS-1042",
    channel: "Quầy POS #01",
    customer: "Trần Thị Mai (VIP)",
    phone: "0912.333.444",
    time: "13:40 - Hôm nay",
    itemsSummary: "1x Nike Dunk Panda (Sz 39), 1x Lót giày",
    total: 3350000,
    payment: "Tiền mặt",
    status: "pos"
  },
  {
    id: "ORD-9818",
    channel: "Online Store",
    customer: "Phạm Hải Long",
    phone: "0944.888.999",
    time: "10:30 - Hôm nay",
    itemsSummary: "1x Adidas Samba OG White (Sz 41)",
    total: 2450000,
    payment: "COD tận nơi",
    status: "processing"
  },
  {
    id: "ORD-9815",
    channel: "Online Store",
    customer: "Lê Hoàng Yến",
    phone: "0977.111.222",
    time: "Hôm qua",
    itemsSummary: "1x Nike Air Force 1 '07 (Sz 38)",
    total: 2650000,
    payment: "Ví MoMo",
    status: "completed"
  }
];

export const VOUCHERS = [
  { code: "KICKS100K", discount: 100000, minOrder: 1500000, desc: "Giảm 100K cho đơn từ 1.500K" },
  { code: "VIBEFLOW10", discount: 250000, minOrder: 2500000, desc: "Giảm 250K cho đơn từ 2.500K" }
];

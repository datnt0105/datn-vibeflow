import React, { useState, useEffect, useMemo } from 'react';
import { sanPhamApi } from '../api';
import ProductDetail from './ProductDetail';
import ProductForm from './ProductForm';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Pagination from './Pagination';
import thuongHieuApi from '../api/thuongHieuApi.js';
import chatLieuApi from '../api/chatLieuApi.js';
import danhMucApi from '../api/danhMucApi.js';
import xuatXuApi from '../api/xuatXuApi.js';

// Địa chỉ backend để hiển thị ảnh (urlAnh dạng "/api/hinh-anh/file/xxx.jpg")
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const toSrc = (url) => (!url ? '' : url.startsWith('http') ? url : BASE_URL + url);

const fmtMoney = (v) => Number(v ?? 0).toLocaleString('vi-VN') + '₫';

export default function AdminProduct({ isAdmin }) {

    // ── Danh sách sản phẩm ─────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [prodLoading, setProdLoading] = useState(false);
    const [prodError, setProdError] = useState('');

    // ── Bộ lọc ─────────────────────────────────────────────────────────────
    const [prodSearch, setProdSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [prodBrandFilter, setProdBrandFilter] = useState('all');
    const [prodStockFilter, setProdStockFilter] = useState('all');

    // ── Phân trang (backend đếm từ 0) ──────────────────────────────────────
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // ── Dữ liệu dùng chung cho select / hiển thị ───────────────────────────
    const [brands, setBrands] = useState([]);
    const [chatLieus, setChatLieus] = useState([]);
    const [danhMucs, setDanhMucs] = useState([]);
    const [xuatXus, setXuatXus] = useState([]);

    const [togglingId, setTogglingId] = useState(null);

    const handleToggleStatus = async (p) => {
        if (togglingId) return;
        const next = !p.trangThai;
        setTogglingId(p.id);

        // Cập nhật giao diện ngay, lỗi thì hoàn lại
        setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, trangThai: next } : x)));
        try {
            await sanPhamApi.updateStatus(p.id, next);
        } catch (err) {
            setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, trangThai: !next } : x)));
            setProdError(err.response?.data?.message || err.message || 'Đổi trạng thái thất bại!');
        } finally {
            setTogglingId(null);
        }
    };

    // ── Modal: null | 'view' | 'add' | 'edit' | 'delete' ───────────────────
    const [prodModal, setProdModal] = useState(null);
    const [selectedProd, setSelectedProd] = useState(null);

    const brandMap = useMemo(
        () => new Map(brands.map((b) => [String(b.id), b.tenThuongHieu])),
        [brands]
    );
    const chatLieuMap = useMemo(
        () => new Map(chatLieus.map((c) => [String(c.id), c.tenChatLieu])),
        [chatLieus]
    );

    // Debounce ô tìm kiếm, tránh gọi API mỗi lần gõ phím
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(prodSearch.trim());
            setPage(0);
        }, 400);
        return () => clearTimeout(t);
    }, [prodSearch]);

    // Tải dữ liệu dùng chung một lần
    useEffect(() => {
        Promise.all([
            thuongHieuApi.getAll(),
            chatLieuApi.getAll(),
            danhMucApi.getAll(),
            xuatXuApi.getAll(),
        ])
            .then(([b, c, d, x]) => {
                setBrands(Array.isArray(b) ? b : []);
                setChatLieus(Array.isArray(c) ? c : []);
                setDanhMucs(Array.isArray(d) ? d : []);
                setXuatXus(Array.isArray(x) ? x : []);
            })
            .catch((err) => console.error('Không thể tải danh mục dùng chung:', err));
    }, []);

    // Tải lại sản phẩm khi đổi trang / size / thương hiệu / từ khóa
    useEffect(() => {
        fetchProducts();
    }, [page, pageSize, prodBrandFilter, debouncedSearch]);

    const fetchProducts = async () => {
        setProdLoading(true);
        setProdError('');
        try {
            const data = await sanPhamApi.getAll({
                page,
                size: pageSize,
                q: debouncedSearch,
                thuongHieuId: prodBrandFilter === 'all' ? undefined : prodBrandFilter,
            });
            setProducts(Array.isArray(data?.content) ? data.content : []);
            setTotalPages(data?.totalPages ?? 0);
            setTotalElements(data?.totalElements ?? 0);
        } catch (err) {
            setProdError(err.response?.data?.message || err.message || 'Không thể tải danh sách sản phẩm!');
        } finally {
            setProdLoading(false);
        }
    };

    // ── Mở / đóng modal ────────────────────────────────────────────────────
    const openAdd = () => { setSelectedProd(null); setProdModal('add'); };
    const openEdit = (p) => { setSelectedProd(p); setProdModal('edit'); };
    const openView = (p) => { setSelectedProd(p); setProdModal('view'); };
    const openDelete = (p) => { setSelectedProd(p); setProdModal('delete'); };
    const closeModal = () => { setProdModal(null); setSelectedProd(null); };

    // Gọi sau khi ProductForm lưu thành công
    const handleSaved = async (saved, mode) => {
        await fetchProducts();
        if (mode === 'add' && saved?.id) {
            setSelectedProd(saved);   // mở chi tiết để thêm ảnh và biến thể
            setProdModal('view');
        } else {
            closeModal();
        }
    };

    const handleDeleteProduct = async () => {
        setProdLoading(true);
        try {
            await sanPhamApi.delete(selectedProd.id);
            closeModal();
            // Xóa dòng cuối của trang thì lùi về trang trước (effect sẽ tự tải lại)
            if (products.length === 1 && page > 0) {
                setPage(page - 1);
            } else {
                await fetchProducts();
            }
        } catch (err) {
            setProdError(err.response?.data?.message || err.message || 'Xóa sản phẩm thất bại!');
            closeModal();
        } finally {
            setProdLoading(false);
        }
    };

    // Bộ lọc tồn kho chạy ở client, chỉ áp dụng cho trang hiện tại
    const filteredProducts = products.filter((p) => {
        const stock = p.tongTonKho ?? 0;
        if (prodStockFilter === 'low' && stock > 10) return false;
        if (prodStockFilter === 'out' && stock > 0) return false;
        return true;
    });

    const COLS = 8;

    return (
        <div className="space-y-4">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                    <h2 className="text-lg font-black uppercase text-white">Quản Lý Sản Phẩm</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        {filteredProducts.length} / {totalElements} sản phẩm
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={openAdd}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black text-xs font-black rounded-xl transition shadow"
                    >
                        <span>＋</span><span>Thêm Sản Phẩm</span>
                    </button>
                )}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Tìm tên, mã sản phẩm..."
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition"
                    />
                </div>
                <select
                    value={prodBrandFilter}
                    onChange={(e) => { setProdBrandFilter(e.target.value); setPage(0); }}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c6f500] transition"
                >
                    <option value="all">Tất cả thương hiệu</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.tenThuongHieu}</option>)}
                </select>
                <select
                    value={prodStockFilter}
                    onChange={(e) => setProdStockFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c6f500] transition"
                >
                    <option value="all">Tất cả tồn kho</option>
                    <option value="low">Sắp hết (≤ 10)</option>
                    <option value="out">Hết hàng</option>
                </select>
                <button
                    onClick={fetchProducts}
                    disabled={prodLoading}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition disabled:opacity-50"
                    title="Tải lại"
                >
                    {prodLoading ? '⏳' : '🔄'}
                </button>
            </div>

            {/* Lỗi API */}
            {prodError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <span>⚠️</span><span>{prodError}</span>
                    <button onClick={() => setProdError('')} className="ml-auto font-bold hover:text-white">✕</button>
                </div>
            )}

            {/* ── Table ── */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wide">
                        <tr>
                            <th className="px-4 py-3 font-bold w-16">Ảnh</th>
                            <th className="px-4 py-3 font-bold">Tên / Mã</th>
                            <th className="px-4 py-3 font-bold">Thương Hiệu</th>
                            <th className="px-4 py-3 font-bold">Chất Liệu</th>
                            <th className="px-4 py-3 font-bold text-right">Giá Bán</th>
                            <th className="px-4 py-3 font-bold text-center">Tồn Kho</th>
                            <th className="px-4 py-3 font-bold text-center">Trạng Thái</th>
                            <th className="px-4 py-3 font-bold text-center">Hành Động</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">

                        {prodLoading && products.length === 0 && (
                            <tr>
                                <td colSpan={COLS} className="px-4 py-12 text-center">
                                    <div className="flex items-center justify-center gap-2 text-zinc-500">
                                        <div className="w-4 h-4 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" />
                                        <span>Đang tải sản phẩm...</span>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!prodLoading && filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={COLS} className="px-4 py-12 text-center text-zinc-500">
                                    {products.length === 0
                                        ? 'Chưa có sản phẩm nào. Bấm "+ Thêm Sản Phẩm" để bắt đầu.'
                                        : 'Không có sản phẩm phù hợp với bộ lọc tồn kho.'}
                                </td>
                            </tr>
                        )}

                        {filteredProducts.map((p) => {
                            const name = p.tenSanPham || '—';
                            const brand = brandMap.get(String(p.thuongHieuId)) || 'Chưa có';
                            const chatLieu = chatLieuMap.get(String(p.chatLieuId)) || '—';
                            const stock = p.tongTonKho ?? 0;
                            const price = p.giaBan ?? 0;
                            const giaGoc = p.giaGoc;
                            const imgSrc = toSrc(p.anhChinhUrl);

                            return (
                                <tr key={p.id} className="hover:bg-zinc-900/40 transition">
                                    {/* Ảnh */}
                                    <td className="px-4 py-3">
                                        {imgSrc
                                            ? <img src={imgSrc} alt={name} className="w-12 h-12 rounded-xl object-cover bg-zinc-900" />
                                            : <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-xl">👟</div>}
                                    </td>

                                    {/* Tên / Mã */}
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-white line-clamp-1 max-w-[200px]">{name}</div>
                                        <div className="text-zinc-500 font-mono mt-0.5">{p.maSanPham}</div>
                                    </td>

                                    {/* Thương hiệu */}
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold">{brand}</span>
                                    </td>

                                    {/* Chất liệu */}
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold">{chatLieu}</span>
                                    </td>

                                    {/* Giá bán */}
                                    <td className="px-4 py-3 text-right">
                                        <div className="font-black text-[#c6f500]">{fmtMoney(price)}</div>
                                        {giaGoc && giaGoc > price && (
                                            <div className="text-zinc-500 line-through text-[10px]">{fmtMoney(giaGoc)}</div>
                                        )}
                                    </td>

                                    {/* Tồn kho */}
                                    <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${
                                                stock === 0 ? 'bg-red-500/15 text-red-400'
                                                    : stock <= 10 ? 'bg-amber-400/15 text-amber-400'
                                                        : 'bg-[#c6f500]/15 text-[#c6f500]'
                                            }`}>
                                                {stock === 0 ? 'Hết hàng' : `${stock} đôi`}
                                            </span>
                                    </td>

                                    {/* Trạng thái */}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleStatus(p)}
                                            disabled={togglingId === p.id}
                                            className={`relative w-10 h-5 rounded-full transition ${p.trangThai ? 'bg-[#c6f500]' : 'bg-zinc-700'}`}
                                        >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
        p.trangThai ? 'translate-x-5' : ''
    }`} />
                                        </button>
                                    </td>

                                    {/* Hành động */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => openView(p)}
                                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg transition"
                                            >
                                                👁 Xem
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="px-3 py-1.5 bg-zinc-900 hover:bg-[#c6f500]/10 border border-zinc-700 hover:border-[#c6f500]/50 text-[#c6f500] text-[10px] font-bold rounded-lg transition"
                                                >
                                                    ✏️ Sửa
                                                </button>
                                            )}
                                            {/*{isAdmin && (*/}
                                            {/*    <button*/}
                                            {/*        onClick={() => openDelete(p)}*/}
                                            {/*        className="px-2.5 py-1.5 bg-zinc-900 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/40 text-zinc-500 hover:text-red-400 text-[10px] font-bold rounded-lg transition"*/}
                                            {/*    >*/}
                                            {/*        🗑️*/}
                                            {/*    </button>*/}
                                            {/*)}*/}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Phân trang ── */}
            <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                loading={prodLoading}
                onPage={setPage}
                onPageSize={(n) => { setPageSize(n); setPage(0); }}
            />

            {/* ── Modal xem chi tiết ── */}
            {prodModal === 'view' && selectedProd && (
                <ProductDetail
                    product={selectedProd}
                    isAdmin={isAdmin}
                    onClose={closeModal}
                    onImagesChanged={fetchProducts}
                    tenThuongHieu={brandMap.get(String(selectedProd.thuongHieuId))}
                    tenChatLieu={chatLieuMap.get(String(selectedProd.chatLieuId))}
                />
            )}

            {/* ── Modal thêm / sửa (chỉ ADMIN) ── */}
            {(prodModal === 'add' || prodModal === 'edit') && isAdmin && (
                <ProductForm
                    mode={prodModal}
                    product={selectedProd}
                    brands={brands}
                    danhMucs={danhMucs}
                    xuatXus={xuatXus}
                    chatLieus={chatLieus}
                    onClose={closeModal}
                    onSaved={handleSaved}
                />
            )}

            {/* ── Modal xác nhận xóa (chỉ ADMIN) ── */}
            {prodModal === 'delete' && selectedProd && isAdmin && (
                <ConfirmDeleteModal
                    name={selectedProd.tenSanPham}
                    loading={prodLoading}
                    onCancel={closeModal}
                    onConfirm={handleDeleteProduct}
                />
            )}
        </div>
    );
}
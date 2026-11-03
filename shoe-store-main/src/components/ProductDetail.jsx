import React, { useEffect, useRef, useState } from 'react';
import hinhAnhApi from '../api/hinhAnhApi';
import chiTietSanPhamApi from "../api/chiTietSanPhamApi.js";
import ProductVariants from "./ProductVariants.jsx";

// Địa chỉ backend (urlAnh trả về dạng "/api/hinh-anh/file/xxx.jpg")
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const toSrc = (url) => (!url ? '' : url.startsWith('http') ? url : BASE_URL + url);

const MAX_SIZE = 5 * 1024 * 1024; // khớp với giới hạn 5MB ở backend
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ProductDetail({ product: p, isAdmin, onClose, tenThuongHieu ,tenChatLieu, onImagesChanged }) {
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState('');
  const fileRef = useRef(null);
  const [variants, setVariants] = useState([]);
  const [varLoading, setVarLoading] = useState(false);




  const productId = p?.id;

  const loadVariants = async () => {
    setVarLoading(true);
    try {
      const data = await chiTietSanPhamApi.getBySanPham(productId);
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Không thể tải biến thể:', err);
    } finally {
      setVarLoading(false);
    }
  };

  useEffect(() => {
    if (productId) loadVariants();
  }, [productId]);

  const loadImages = async (keepId) => {
    setImgLoading(true);
    try {
      const data = await hinhAnhApi.getBySanPham(productId);
      const list = Array.isArray(data) ? data : [];
      setImages(list);
      const idx = keepId ? list.findIndex((i) => i.id === keepId) : 0;
      setActiveIdx(idx >= 0 ? idx : 0);
    } catch (err) {
      setImgError(err.message || 'Không thể tải ảnh sản phẩm!');
    } finally {
      setImgLoading(false);
    }
  };

  useEffect(() => {
    if (productId) loadImages();
  }, [productId]);

  if (!p) return null;

  const fmt = (v) => v != null ? Number(v).toLocaleString('vi-VN') + '₫' : '—';
  const current = images[activeIdx];
  // Ảnh hiển thị lớn: ưu tiên ảnh từ bảng HINH_ANH, không có thì dùng ảnh cũ trong sản phẩm
  const mainSrc = current ? toSrc(current.urlAnh) : (p.urlAnh || p.image || '');

  // ── Thêm ảnh ──
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // cho phép chọn lại cùng 1 file
    if (files.length === 0) return;

    for (const f of files) {
      if (!ALLOWED.includes(f.type)) return setImgError(`"${f.name}" không phải ảnh JPG, PNG, WEBP, GIF`);
      if (f.size > MAX_SIZE) return setImgError(`"${f.name}" lớn hơn 5MB`);
    }

    setBusy(true);
    setImgError('');
    try {
      const added = await hinhAnhApi.upload(productId, files);
      await loadImages(Array.isArray(added) && added[0] ? added[0].id : undefined);
      onImagesChanged?.();
    } catch (err) {
      setImgError(err.response?.data?.message || err.message || 'Upload ảnh thất bại!');
    } finally {
      setBusy(false);
    }
  };

  // ── Đặt ảnh chính ──
  const handleSetMain = async (img) => {
    setBusy(true);
    setImgError('');
    try {
      await hinhAnhApi.setAnhChinh(img.id);
      await loadImages();
      onImagesChanged?.();
    } catch (err) {
      setImgError(err.message || 'Không thể đặt ảnh chính!');
    } finally {
      setBusy(false);
    }
  };

  // ── Xóa ảnh ──
  const handleDelete = async (img) => {
    if (!window.confirm('Xóa ảnh này?')) return;
    setBusy(true);
    setImgError('');
    try {
      await hinhAnhApi.delete(img.id);
      await loadImages();
      onImagesChanged?.();
    } catch (err) {
      setImgError(err.message || 'Xóa ảnh thất bại!');
    } finally {
      setBusy(false);
    }
  };

  const stock = variants.reduce((s, v) => s + (v.soLuong || 0), 0);

// Size/màu còn hàng, size sắp xếp theo số
  const sizeList = [...new Set(variants.filter((v) => v.soLuong > 0).map((v) => v.tenKichThuoc))]
      .sort((a, b) => Number(a) - Number(b));

  const colorList = [
    ...new Map(
        variants.filter((v) => v.soLuong > 0).map((v) => [v.mauSacId, { name: v.tenMau, hex: v.maHex }])
    ).values(),
  ];
  return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Chi Tiết Sản Phẩm</span>
              <h3 className="font-black text-sm text-white mt-0.5">{p.tenSanPham || p.name}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center font-bold transition">✕</button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Cột ảnh ── */}
            <div>
              <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-square">
                {mainSrc
                    ? <img src={mainSrc} alt={p.tenSanPham || p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-zinc-600 text-4xl">👟</div>}

                {imgLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {current?.anhChinh && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-[#c6f500] text-black font-black text-[10px]">⭐ Ảnh chính</span>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((img, i) => (
                    <div key={img.id} className="relative group">
                      <button
                          type="button"
                          onClick={() => setActiveIdx(i)}
                          className={`block w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                              i === activeIdx ? 'border-[#c6f500]' : 'border-zinc-700 hover:border-zinc-500'
                          }`}
                      >
                        <img src={toSrc(img.urlAnh)} alt={img.tenAnh} className="w-full h-full object-cover" />
                      </button>
                      {img.anhChinh && (
                          <span className="absolute -top-1 -left-1 text-[10px]">⭐</span>
                      )}
                      {isAdmin && (
                          <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleDelete(img)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-40"
                              title="Xóa ảnh"
                          >✕</button>
                      )}
                    </div>
                ))}

                {/* Nút thêm ảnh */}
                {isAdmin && (
                    <>
                      <button
                          type="button"
                          disabled={busy}
                          onClick={() => fileRef.current?.click()}
                          className="w-14 h-14 rounded-xl border-2 border-dashed border-zinc-600 hover:border-[#c6f500] text-zinc-400 hover:text-[#c6f500] text-xl font-bold flex items-center justify-center transition disabled:opacity-40"
                          title="Thêm ảnh"
                      >
                        {busy ? <div className="w-4 h-4 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" /> : '＋'}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
                    </>
                )}
              </div>

              {!imgLoading && images.length === 0 && (
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Chưa có ảnh nào{isAdmin ? ', bấm ＋ để thêm.' : '.'}
                  </p>
              )}

              {/* Đặt ảnh chính cho ảnh đang xem */}
              {isAdmin && current && !current.anhChinh && (
                  <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSetMain(current)}
                      className="mt-2 px-3 py-1.5 bg-zinc-800 hover:bg-[#c6f500]/10 border border-zinc-700 hover:border-[#c6f500]/50 text-[#c6f500] text-[11px] font-bold rounded-lg transition disabled:opacity-40"
                  >
                    ⭐ Đặt làm ảnh chính
                  </button>
              )}

              {imgError && (
                  <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2">
                    <span className="flex-1">{imgError}</span>
                    <button onClick={() => setImgError('')} className="font-bold hover:text-white">✕</button>
                  </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {(p.flashSale || p.isFlashSale) && (
                    <span className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 font-bold text-[11px]">🔥 Flash Sale</span>
                )}
                <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                    stock === 0 ? 'bg-red-500/15 text-red-400'
                        : stock <= 10 ? 'bg-amber-400/15 text-amber-400'
                            : 'bg-[#c6f500]/15 text-[#c6f500]'
                }`}>
                {stock === 0 ? 'Hết hàng' : `Tồn: ${stock} đôi`}
              </span>
              </div>
            </div>

            {/* ── Cột thông tin (giữ nguyên như cũ) ── */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-zinc-500 mb-0.5">Tên sản phẩm</div>
                <div className="font-bold text-white text-sm leading-snug">{p.tenSanPham || p.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-zinc-500 mb-0.5">Thương hiệu</div>
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold">
                  {tenThuongHieu || p.brand || '—'}
                </span>
                </div>
                <div>
                  <div className="text-zinc-500 mb-0.5">chất liệu</div>
                  <div className="font-mono text-[#c6f500] font-bold">{tenChatLieu}</div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-0.5">Giá bán</div>
                  <div className="font-black text-[#c6f500]">{fmt(p.giaBan ?? p.price)}</div>
                </div>
                {isAdmin && (
                    <>
                      <div>
                        <div className="text-zinc-500 mb-0.5">Giá mua</div>
                        <div className="text-zinc-300 line-through">{fmt(p.giaGoc ?? p.originalPrice)}</div>
                      </div>

                    </>
                )}
              </div>

              <div>
                <div className="text-zinc-500 mb-1.5">Size còn hàng</div>
                <div className="flex flex-wrap gap-1.5">
                  {sizeList.map((s) => (
                      <span key={s} className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-[11px]">{s}</span>
                  ))}
                  {sizeList.length === 0 && <span className="text-zinc-600">—</span>}
                </div>
              </div>

              <div>
                <div className="text-zinc-500 mb-1.5">Màu sắc</div>
                <div className="flex flex-wrap gap-1.5">
                  {colorList.map((c) => (
                      <span key={c.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px]">
        <span className="w-2.5 h-2.5 rounded-full border border-zinc-600" style={{ background: c.hex || '#888' }} />
                        {c.name}
      </span>
                  ))}
                  {colorList.length === 0 && <span className="text-zinc-600">—</span>}
                </div>
              </div>

            </div>
          </div>
          <ProductVariants
              product={p}
              isAdmin={isAdmin}
              variants={variants}
              loading={varLoading}
              onChanged={async () => {
                await loadVariants();     // tải lại bảng, size, màu, tồn kho trong modal
                onImagesChanged?.();      // làm mới danh sách sản phẩm bên ngoài
              }}
          />


          <div className="px-6 pb-5 flex justify-end border-t border-zinc-800 pt-4">
            <button onClick={onClose} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition">Đóng</button>
          </div>
        </div>


      </div>
  );
}
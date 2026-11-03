import React, { useState } from 'react';
import { sanPhamApi } from '../api';

const emptyForm = {
    maSanPham: '', tenSanPham: '',
    danhMucId: '', thuongHieuId: '', xuatXuId: '', chatLieuId: '',
    giaBan: '', giaGoc: '', moTa: '',
};

// Chuyển sản phẩm từ API sang state của form
const toForm = (p) => ({
    maSanPham:    p.maSanPham ?? '',
    tenSanPham:   p.tenSanPham ?? '',
    danhMucId:    p.danhMucId ?? '',
    thuongHieuId: p.thuongHieuId ?? '',
    xuatXuId:     p.xuatXuId ?? '',
    chatLieuId:   p.chatLieuId ?? '',
    giaBan:       p.giaBan ?? '',
    giaGoc:       p.giaGoc ?? '',
    moTa:         p.moTa ?? '',
});

const inputCls =
    'w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition';

function Field({ label, children, className = '' }) {
    return (
        <div className={className}>
            <label className="block font-bold text-zinc-300 uppercase mb-1">{label}</label>
            {children}
        </div>
    );
}

function SelectField({ label, value, onChange, options, labelKey, placeholder }) {
    return (
        <Field label={label}>
            <select value={value} onChange={onChange} className={inputCls}>
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o.id} value={o.id}>{o[labelKey]}</option>
                ))}
            </select>
        </Field>
    );
}

/**
 * Modal Thêm / Sửa sản phẩm.
 *
 * Props:
 *   mode      — 'add' | 'edit'
 *   product   — sản phẩm đang sửa (chỉ dùng khi mode = 'edit')
 *   brands, danhMucs, xuatXus, chatLieus — dữ liệu cho các select
 *   onClose   — đóng modal
 *   onSaved   — (sanPham, mode) => void, gọi sau khi lưu thành công
 */
export default function ProductForm({
                                        mode, product, brands, danhMucs, xuatXus, chatLieus, onClose, onSaved,
                                    }) {
    const isAdd = mode === 'add';
    const [form, setForm] = useState(isAdd ? emptyForm : toForm(product));
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const validate = () => {
        if (!form.maSanPham.trim())  return 'Vui lòng nhập mã sản phẩm!';
        if (!form.tenSanPham.trim()) return 'Vui lòng nhập tên sản phẩm!';
        if (!form.danhMucId)         return 'Vui lòng chọn danh mục!';
        if (!form.thuongHieuId)      return 'Vui lòng chọn thương hiệu!';
        if (!form.xuatXuId)          return 'Vui lòng chọn xuất xứ!';
        if (form.giaBan === '' || isNaN(+form.giaBan) || +form.giaBan <= 0)
            return 'Giá bán không hợp lệ!';
        if (form.giaGoc !== '' && (isNaN(+form.giaGoc) || +form.giaGoc < +form.giaBan))
            return 'Giá gốc phải lớn hơn hoặc bằng giá bán!';
        return '';
    };

    const handleSave = async () => {
        const err = validate();
        if (err) return setError(err);

        setSaving(true);
        setError('');
        try {
            const payload = {
                maSanPham:    form.maSanPham.trim(),
                tenSanPham:   form.tenSanPham.trim(),
                danhMucId:    Number(form.danhMucId),
                thuongHieuId: Number(form.thuongHieuId),
                xuatXuId:     Number(form.xuatXuId),
                chatLieuId:   form.chatLieuId ? Number(form.chatLieuId) : null,
                giaBan:       Number(form.giaBan),
                giaGoc:       form.giaGoc !== '' ? Number(form.giaGoc) : null,
                moTa:         form.moTa.trim(),
            };
            const saved = isAdd
                ? await sanPhamApi.create(payload)
                : await sanPhamApi.update(product.id, payload);
            await onSaved(saved, mode);
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Lưu sản phẩm thất bại!');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
                    <h3 className="font-black text-sm uppercase text-white">
                        {isAdd ? '➕ Thêm Sản Phẩm Mới' : '✏️ Sửa Sản Phẩm'}
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 text-xs">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                            <span>⚠️</span><span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="Mã sản phẩm *">
                            <input value={form.maSanPham} onChange={setField('maSanPham')}
                                   disabled={!isAdd} maxLength={20} placeholder="SP013"
                                   className={`${inputCls} font-mono disabled:opacity-50`} />
                        </Field>
                        <Field label="Tên sản phẩm *" className="sm:col-span-2">
                            <input value={form.tenSanPham} onChange={setField('tenSanPham')}
                                   maxLength={150} placeholder="Nike Air Jordan 1..." className={inputCls} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SelectField label="Danh mục *" value={form.danhMucId} onChange={setField('danhMucId')}
                                     options={danhMucs} labelKey="tenDanhMuc" placeholder="-- Chọn danh mục --" />
                        <SelectField label="Thương hiệu *" value={form.thuongHieuId} onChange={setField('thuongHieuId')}
                                     options={brands} labelKey="tenThuongHieu" placeholder="-- Chọn thương hiệu --" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SelectField label="Xuất xứ *" value={form.xuatXuId} onChange={setField('xuatXuId')}
                                     options={xuatXus} labelKey="tenXuatXu" placeholder="-- Chọn xuất xứ --" />
                        <SelectField label="Chất liệu" value={form.chatLieuId} onChange={setField('chatLieuId')}
                                     options={chatLieus} labelKey="tenChatLieu" placeholder="-- Chọn chất liệu --" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Giá bán mặc định (₫) *">
                            <input type="number" min="0" value={form.giaBan} onChange={setField('giaBan')}
                                   placeholder="2890000" className={`${inputCls} !text-[#c6f500]`} />
                        </Field>
                        <Field label="Giá gốc mặc định (₫)">
                            <input type="number" min="0" value={form.giaGoc} onChange={setField('giaGoc')}
                                   placeholder="3400000" className={inputCls} />
                        </Field>
                    </div>
                    <p className="text-[10px] text-zinc-500 -mt-2">
                        Biến thể để trống giá sẽ dùng hai giá này. Giá nhập nhập ở từng biến thể.
                    </p>

                    <Field label={`Mô tả (${form.moTa.length}/500)`}>
                        <textarea rows={3} maxLength={500} value={form.moTa} onChange={setField('moTa')}
                                  placeholder="Mô tả ngắn về sản phẩm..." className={`${inputCls} resize-none`} />
                    </Field>

                    {isAdd && (
                        <p className="text-[11px] text-zinc-500">
                            💡 Sau khi lưu, cửa sổ chi tiết sẽ mở để bạn thêm ảnh và biến thể (màu, size, số lượng).
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3 justify-end border-t border-zinc-800 pt-4">
                    <button onClick={onClose} disabled={saving}
                            className="px-5 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-700 transition">
                        Hủy
                    </button>
                    <button onClick={handleSave} disabled={saving}
                            className="px-6 py-2.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black text-xs rounded-xl transition shadow disabled:opacity-50">
                        {saving ? 'Đang lưu...' : isAdd ? '➕ Thêm Sản Phẩm' : '💾 Lưu Thay Đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
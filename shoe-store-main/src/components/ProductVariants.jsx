import React, { useEffect, useState } from 'react';
import chiTietSanPhamApi from '../api/chiTietSanPhamApi';
import mauSacApi from '../api/mauSacApi';
import kichThuocApi from '../api/kichThuocApi';

const fmt = (v) => (v != null ? Number(v).toLocaleString('vi-VN') + '₫' : '—');
const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb;
const toNum = (s) => (s === '' || s == null ? null : Number(s));
const badNum = (n) => n !== null && (isNaN(n) || n < 0);
const inputCls = 'bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[#c6f500]';

export default function ProductVariants({ product: p, isAdmin, variants, loading, onChanged }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ soLuong: '', giaBan: '', giaGoc: '', giaNhap: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const startEdit = (v) => {
        setEditId(v.id);
        setForm({
            soLuong: String(v.soLuong ?? 0),
            giaBan: v.giaBan != null ? String(v.giaBan) : '',
            giaGoc: v.giaGoc != null ? String(v.giaGoc) : '',
            giaNhap: v.giaNhap != null ? String(v.giaNhap) : '',
        });
        setError('');
    };

    const saveEdit = async (v) => {
        const qty = Number(form.soLuong);
        if (form.soLuong === '' || !Number.isInteger(qty) || qty < 0) return setError('Số lượng phải là số nguyên ≥ 0');
        const giaBan = toNum(form.giaBan), giaGoc = toNum(form.giaGoc), giaNhap = toNum(form.giaNhap);
        if ([giaBan, giaGoc, giaNhap].some(badNum)) return setError('Giá không hợp lệ');

        setBusy(true); setError('');
        try {
            await chiTietSanPhamApi.update(v.id, { soLuong: qty, giaBan, giaGoc, giaNhap });
            setEditId(null);
            await onChanged?.();
        } catch (e) { setError(errMsg(e, 'Cập nhật thất bại!')); }
        finally { setBusy(false); }
    };

    const handleDelete = async (v) => {
        if (!window.confirm(`Xóa chi tiết ${v.tenMau} - size ${v.tenKichThuoc}?`)) return;
        setBusy(true); setError('');
        try { await chiTietSanPhamApi.delete(v.id); await onChanged?.(); }
        catch (e) { setError(errMsg(e, 'Xóa thất bại!')); }
        finally { setBusy(false); }
    };

    const sorted = [...variants].sort(
        (a, b) => a.tenMau.localeCompare(b.tenMau) || Number(a.tenKichThuoc) - Number(b.tenKichThuoc)
    );
    const cols = isAdmin ? 8 : 6;
    const priceInput = (key, w = 'w-24') => (
        <input type="number" min="0" value={form[key]}
               placeholder={key === 'giaBan' ? String(p.giaBan ?? '') : key === 'giaGoc' ? String(p.giaGoc ?? '') : ''}
               onChange={(e) => setForm({ ...form, [key]: e.target.value })}
               onKeyDown={(e) => e.key === 'Enter' && saveEdit(editingVariant)}
               className={`${w} text-right ${inputCls}`} />
    );
    const editingVariant = variants.find((v) => v.id === editId);

    return (
        <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase text-zinc-300">Chi tiết ({variants.length})</h4>
                {isAdmin && !showAdd && (
                    <button onClick={() => { setShowAdd(true); setNotice(''); }}
                            className="px-3 py-1.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black text-[11px] font-black rounded-lg transition">
                        ＋ Thêm chi tiết
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2">
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError('')} className="font-bold hover:text-white">✕</button>
                </div>
            )}
            {notice && <div className="mb-2 p-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px]">{notice}</div>}

            {isAdmin && showAdd && (
                <AddVariantForm
                    product={p}
                    onCancel={() => setShowAdd(false)}
                    onDone={async (skipped) => {
                        setShowAdd(false);
                        if (skipped?.length) setNotice(`Đã bỏ qua size ${skipped.join(', ')} vì chi tiết đã tồn tại.`);
                        await onChanged?.();
                    }}
                />
            )}

            <div className="border border-zinc-800 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase">
                    <tr>
                        <th className="px-3 py-2">Mã</th>
                        <th className="px-3 py-2">Màu</th>
                        <th className="px-3 py-2 text-center">Size</th>
                        <th className="px-3 py-2 text-center">SL</th>
                        <th className="px-3 py-2 text-right">Giá bán</th>
                        <th className="px-3 py-2 text-right">Giá gốc</th>
                        {isAdmin && <th className="px-3 py-2 text-right">Giá nhập</th>}
                        {isAdmin && <th className="px-3 py-2 text-center">Thao tác</th>}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                    {loading && <tr><td colSpan={cols} className="px-3 py-4 text-center text-zinc-500">Đang tải...</td></tr>}
                    {!loading && variants.length === 0 && (
                        <tr><td colSpan={cols} className="px-3 py-4 text-center text-zinc-500">Chưa có chi tiết nào.</td></tr>
                    )}
                    {sorted.map((v) => {
                        const editing = editId === v.id;
                        const ban = v.giaBanHieuLuc, goc = v.giaGocHieuLuc;
                        return (
                            <tr key={v.id}>
                                <td className="px-3 py-2 font-mono text-zinc-500">{v.maChiTiet}</td>
                                <td className="px-3 py-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle border border-zinc-600"
                          style={{ background: v.maHex || '#888' }} />
                                    {v.tenMau}
                                </td>
                                <td className="px-3 py-2 text-center font-bold text-white">{v.tenKichThuoc}</td>

                                <td className="px-3 py-2 text-center">
                                    {editing ? (
                                        <input type="number" min="0" autoFocus value={form.soLuong}
                                               onChange={(e) => setForm({ ...form, soLuong: e.target.value })}
                                               className={`w-16 text-center ${inputCls}`} />
                                    ) : (
                                        <span className={`px-2 py-0.5 rounded-lg font-bold ${
                                            v.soLuong === 0 ? 'bg-red-500/15 text-red-400'
                                                : v.soLuong <= 10 ? 'bg-amber-400/15 text-amber-400'
                                                    : 'bg-[#c6f500]/15 text-[#c6f500]'}`}>{v.soLuong}</span>
                                    )}
                                </td>

                                <td className="px-3 py-2 text-right">
                                    {editing ? priceInput('giaBan') : (
                                        <span className="text-zinc-200">
                        {fmt(ban)}
                                            {v.giaBan == null && <span className="text-zinc-600 text-[10px] ml-1">(mặc định)</span>}
                      </span>
                                    )}
                                </td>

                                <td className="px-3 py-2 text-right">
                                    {editing ? priceInput('giaGoc') : (
                                        goc != null && ban != null && goc > ban
                                            ? <span className="text-zinc-500 line-through">{fmt(goc)}</span>
                                            : <span className="text-zinc-600">—</span>
                                    )}
                                </td>

                                {isAdmin && (
                                    <td className="px-3 py-2 text-right">
                                        {editing ? priceInput('giaNhap') : (
                                            <span className={v.giaNhap == null ? 'text-zinc-600' : 'text-sky-300'}>{fmt(v.giaNhap)}</span>
                                        )}
                                    </td>
                                )}

                                {isAdmin && (
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {editing ? (
                                                <>
                                                    <button disabled={busy} onClick={() => saveEdit(v)}
                                                            className="px-2.5 py-1 bg-[#c6f500] text-black text-[10px] font-black rounded-lg disabled:opacity-50">💾</button>
                                                    <button disabled={busy} onClick={() => setEditId(null)}
                                                            className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded-lg">Hủy</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button disabled={busy} onClick={() => startEdit(v)}
                                                            className="px-2.5 py-1 bg-zinc-900 hover:bg-[#c6f500]/10 border border-zinc-700 text-[#c6f500] text-[10px] font-bold rounded-lg disabled:opacity-50">✏️</button>
                                                    <button disabled={busy} onClick={() => handleDelete(v)}
                                                            className="px-2.5 py-1 bg-zinc-900 hover:bg-red-500/10 border border-zinc-700 text-zinc-500 hover:text-red-400 text-[10px] font-bold rounded-lg disabled:opacity-50">🗑️</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ───────────────── Form thêm chi tiết ─────────────────
function AddVariantForm({ product: p, onCancel, onDone }) {
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [mauId, setMauId] = useState('');
    const [price, setPrice] = useState({ giaBan: '', giaGoc: '', giaNhap: '' });
    const [qtyBySize, setQtyBySize] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([mauSacApi.getAll(), kichThuocApi.getAll()])
            .then(([c, s]) => { setColors(Array.isArray(c) ? c : []); setSizes(Array.isArray(s) ? s : []); })
            .catch((e) => setError(errMsg(e, 'Không thể tải màu/size!')));
    }, []);

    const toggleSize = (id) => setQtyBySize((q) => {
        const n = { ...q }; if (id in n) delete n[id]; else n[id] = ''; return n;
    });
    const selectedIds = Object.keys(qtyBySize);

    const submit = async () => {
        if (!mauId) return setError('Vui lòng chọn màu!');
        if (selectedIds.length === 0) return setError('Vui lòng chọn ít nhất 1 size!');
        const items = [];
        for (const id of selectedIds) {
            const qty = Number(qtyBySize[id]);
            if (qtyBySize[id] === '' || !Number.isInteger(qty) || qty < 0)
                return setError('Số lượng mỗi size phải là số nguyên ≥ 0');
            items.push({ kichThuocId: Number(id), soLuong: qty });
        }
        const giaBan = toNum(price.giaBan), giaGoc = toNum(price.giaGoc), giaNhap = toNum(price.giaNhap);
        if ([giaBan, giaGoc, giaNhap].some(badNum)) return setError('Giá không hợp lệ!');
        if (giaNhap === null) return setError('Vui lòng nhập giá nhập!');

        setSaving(true); setError('');
        try {
            const res = await chiTietSanPhamApi.createBulk({
                sanPhamId: p.id, mauSacId: Number(mauId), giaBan, giaGoc, giaNhap, items,
            });
            await onDone(res?.skipped);
        } catch (e) { setError(errMsg(e, 'Thêm chi tiết thất bại!')); }
        finally { setSaving(false); }
    };

    const cls = `w-full ${inputCls} py-1.5`;
    const priceField = (key, label, placeholder) => (
        <div>
            <label className="block font-bold text-zinc-400 mb-1">{label}</label>
            <input type="number" min="0" value={price[key]} placeholder={placeholder}
                   onChange={(e) => setPrice({ ...price, [key]: e.target.value })} className={cls} />
        </div>
    );

    return (
        <div className="mb-3 p-4 rounded-xl border border-zinc-700 bg-zinc-950/60 space-y-3 text-xs">
            <div className="font-black uppercase text-zinc-300">Thêm chi tiết mới</div>
            {error && <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}

            <div>
                <label className="block font-bold text-zinc-400 mb-1">Màu *</label>
                <select value={mauId} onChange={(e) => setMauId(e.target.value)} className={cls}>
                    <option value="">-- Chọn màu --</option>
                    {colors.map((c) => <option key={c.id} value={c.id}>{c.tenMau}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {priceField('giaNhap', 'Giá nhập (₫) *', '2000000')}
                {priceField('giaBan', 'Giá bán (trống = theo SP)', String(p.giaBan ?? ''))}
                {priceField('giaGoc', 'Giá gốc (trống = theo SP)', String(p.giaGoc ?? ''))}
            </div>

            <div>
                <label className="block font-bold text-zinc-400 mb-1.5">Size * (bấm để chọn nhiều)</label>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                        <button key={s.id} type="button" onClick={() => toggleSize(String(s.id))}
                                className={`w-10 h-10 rounded-xl font-bold border transition ${
                                    String(s.id) in qtyBySize
                                        ? 'bg-[#c6f500] text-black border-[#c6f500]'
                                        : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                            {s.tenKichThuoc}
                        </button>
                    ))}
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div>
                    <label className="block font-bold text-zinc-400 mb-1.5">Số lượng từng size</label>
                    <div className="flex flex-wrap gap-2">
                        {selectedIds.map((id) => (
                            <div key={id} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                                <span className="font-bold text-white w-6 text-center">{sizes.find((x) => String(x.id) === id)?.tenKichThuoc}</span>
                                <input type="number" min="0" value={qtyBySize[id]} placeholder="SL"
                                       onChange={(e) => setQtyBySize({ ...qtyBySize, [id]: e.target.value })}
                                       className={`w-16 text-center ${inputCls}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
                <button onClick={onCancel} disabled={saving} className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700">Hủy</button>
                <button onClick={submit} disabled={saving}
                        className="px-4 py-2 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black rounded-lg disabled:opacity-50">
                    {saving ? 'Đang lưu...' : `Lưu ${selectedIds.length || ''} chi tiết`}
                </button>
            </div>
        </div>
    );
}
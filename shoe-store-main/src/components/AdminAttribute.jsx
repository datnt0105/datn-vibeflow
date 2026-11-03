import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import Pagination from './Pagination';
// ── Cấu hình 6 thuộc tính ─────────────────────────────────────────────────────
const ATTRIBUTE_CONFIG = [
  {
    key: 'thuong-hieu',
    label: 'Thương Hiệu',
    icon: '🏷️',
    endpoint: '/thuong-hieu',
    nameField: 'tenThuongHieu',
    codeField: 'maThuongHieu',
    namePlaceholder: 'Nike, Adidas, Jordan...',
    codePlaceholder: 'NIKE, ADIDAS...',
  },
  {
    key: 'chat-lieu',
    label: 'Chất Liệu',
    icon: '🧵',
    endpoint: '/chat-lieu',
    nameField: 'tenChatLieu',
    codeField: 'maChatLieu',
    namePlaceholder: 'Da thật, Vải canvas...',
    codePlaceholder: 'DA_THAT, VAI...',
  },
  {
    key: 'danh-muc',
    label: 'Danh Mục',
    icon: '📂',
    endpoint: '/danh-muc',
    nameField: 'tenDanhMuc',
    codeField: 'maDanhMuc',
    namePlaceholder: 'Giày thể thao, Giày da...',
    codePlaceholder: 'GIAY_THE_THAO...',
  },
  {
    key: 'kich-thuoc',
    label: 'Kích Thước',
    icon: '📏',
    endpoint: '/kich-thuoc',
    nameField: 'tenKichThuoc',
    codeField: 'maKichThuoc',
    namePlaceholder: '38, 39, 40, 41...',
    codePlaceholder: 'SIZE_38, SIZE_39...',
    hasDesc: false,
  },
  {
    key: 'mau-sac',
    label: 'Màu Sắc',
    icon: '🎨',
    endpoint: '/mau-sac',
    nameField: 'tenMau',
    codeField: 'maMau',
    namePlaceholder: 'Đen, Trắng, Đỏ...',
    codePlaceholder: 'DEN, TRANG, DO...',
    descField: 'maHex',        // thêm
    descLabel: 'Mã Hex',       // thêm
    descType: 'color',         // thêm
  },
  {
    key: 'xuat-xu',
    label: 'Xuất Xứ',
    icon: '🌍',
    endpoint: '/xuat-xu',
    nameField: 'tenXuatXu',
    codeField: 'maXuatXu',
    namePlaceholder: 'Việt Nam, Trung Quốc...',
    codePlaceholder: 'VN, CN, US...',
  },
];

// ── Component bảng thuộc tính ────────────────────────────────────────────────
function AttributeTable({ config, isAdmin }) {
  const { endpoint, nameField, codeField, namePlaceholder, codePlaceholder } = config;

  const [togglingId, setTogglingId] = useState(null);
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');


  const descField = config.descField || 'moTa';
  const descLabel = config.descLabel || 'Mô Tả';
  const isColor   = config.descType === 'color';
  const HEX_RE    = /^#[0-9A-Fa-f]{6}$/;

  const hasDesc = config.hasDesc !== false;
  const colCount = hasDesc ? 6 : 5;

  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Modal: null | 'add' | 'edit' | 'delete'
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);

  const [search, setSearch]     = useState('');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formMoTa, setFormMoTa] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving]     = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await axiosClient.get(`${endpoint}/page`, {
        params: { page, size: pageSize, q: debouncedSearch },
      });
      setItems(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
    } catch (err) {
      setError(err.message || `Không thể tải dữ liệu ${config.label}!`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, debouncedSearch]);


  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getName = (item) => item[nameField] || item.ten || '—';
  const getCode = (item) => item[codeField] || item.ma || '—';

  const openAdd = () => {
    setFormName(''); setFormCode(''); setFormMoTa(''); setFormError('');
    setModal('add');
  };

  const openEdit = (item) => {
    setFormName(getName(item));
    setFormCode(getCode(item));
    setFormMoTa(item[descField] || '');
    setFormError('');
    setSelected(item);
    setModal('edit');
  };

  const openDelete = (item) => { setSelected(item); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  //  update status
  const handleToggleStatus = async (item) => {
    if (togglingId) return;
    const current = item.trangThai !== false;   // null/undefined coi như đang active
    const next = !current;
    setTogglingId(item.id);

    // Cập nhật giao diện ngay, lỗi thì hoàn lại
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, trangThai: next } : x)));
    try {
      await axiosClient.patch(`${endpoint}/${item.id}/trang-thai`, { trangThai: next });
    } catch (err) {
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, trangThai: current } : x)));
      setError(err.message || 'Đổi trạng thái thất bại!');
    } finally {
      setTogglingId(null);
    }
  };
  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formName.trim()) { setFormError('Vui lòng nhập tên!'); return; }
    if (isColor && formMoTa.trim() && !HEX_RE.test(formMoTa.trim())) {
      setFormError('Mã hex không hợp lệ (ví dụ: #FF0000)!');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        [nameField]: formName.trim(),
        [codeField]: formCode.trim() || undefined,
        ...(hasDesc && { [descField]: formMoTa.trim() || undefined }),
        trangThai: true,
      };
      if (modal === 'add') {
        await axiosClient.post(endpoint, payload);
      } else {
        await axiosClient.put(`${endpoint}/${selected.id}`, payload);
      }
      await fetchItems();
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Lưu thất bại!');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  // const handleDelete = async () => {
  //   setSaving(true);
  //   try {
  //     await axiosClient.delete(`${endpoint}/${selected.id}`);
  //     await fetchItems();
  //     closeModal();
  //   } catch (err) {
  //     setError(err.message || 'Xóa thất bại!');
  //     closeModal();
  //   } finally {
  //     setSaving(false);
  //   }
  // };


  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);


  useEffect(() => { fetchItems(); }, [fetchItems]);



  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
          </svg>
          <input
            type="text"
            placeholder={`Tìm ${config.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition"
          />
        </div>
        <button
          onClick={fetchItems}
          disabled={loading}
          title="Tải lại"
          className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition disabled:opacity-50"
        >
          {loading ? '⏳' : '🔄'}
        </button>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#c6f500] hover:bg-[#b0dc00] text-black text-xs font-black rounded-xl transition shadow"
          >
            <span>＋</span><span>Thêm</span>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <span>⚠️</span><span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto font-bold hover:text-white">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-bold w-10">#</th>
              <th className="px-4 py-3 font-bold">Tên</th>
              <th className="px-4 py-3 font-bold">Mã</th>
              {hasDesc && (
                  <th className="px-4 py-3 font-bold hidden sm:table-cell">{descLabel}</th>
              )}
              <th className="px-4 py-3 font-bold text-center">Trạng Thái</th>
              <th className="px-4 py-3 font-bold text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-zinc-500">
                    <div className="w-4 h-4 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  {items.length === 0
                    ? `Chưa có ${config.label.toLowerCase()} nào.`
                    : 'Không tìm thấy kết quả phù hợp.'}
                </td>
              </tr>
            )}
            {items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-zinc-900/40 transition">
                <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                <td className="px-4 py-3 font-bold text-white">{getName(item)}</td>
                <td className="px-4 py-3 font-mono text-[#c6f500]">{getCode(item)}</td>
                {hasDesc && (
                <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell max-w-[200px] truncate">
                  {isColor ? (
                      item[descField] ? (
                          <span className="inline-flex items-center gap-2">
        <span
            className="w-4 h-4 rounded border border-zinc-600"
            style={{ backgroundColor: item[descField] }}
        />
        <span className="font-mono">{item[descField]}</span>
      </span>
                      ) : '—'
                  ) : (
                      item[descField] || '—'
                  )}
                </td>)}
                <td className="px-4 py-3 text-center">
                  {(() => {
                    const active = item.trangThai !== false;
                    return (
                        <div className="inline-flex items-center gap-2">
                          <button
                              type="button"
                              role="switch"
                              aria-checked={active}
                              disabled={!isAdmin || togglingId === item.id}
                              onClick={() => handleToggleStatus(item)}
                              title={isAdmin ? (active ? 'Bấm để ẩn' : 'Bấm để kích hoạt lại') : 'Chỉ admin được đổi'}
                              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
            disabled:opacity-50 ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed'}
            ${active ? 'bg-[#c6f500]' : 'bg-zinc-700'}`}
                          >
          <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow transition-transform duration-200
              ${active ? 'translate-x-5 bg-black' : 'translate-x-0 bg-zinc-400'}`}
          />
                          </button>

                        </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    {isAdmin && (
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-[#c6f500]/10 border border-zinc-700 hover:border-[#c6f500]/50 text-[#c6f500] text-[10px] font-bold rounded-lg transition"
                      >
                        ✏️ Sửa
                      </button>
                    )}
                    {/*{isAdmin && (*/}
                    {/*  <button*/}
                    {/*    onClick={() => openDelete(item)}*/}
                    {/*    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/40 text-zinc-500 hover:text-red-400 text-[10px] font-bold rounded-lg transition"*/}
                    {/*  >*/}
                    {/*    🗑️*/}
                    {/*  </button>*/}
                    {/*)}*/}
                    {!isAdmin && (
                      <span className="text-zinc-600 text-[10px]">Chỉ xem</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tổng số */}
      {totalElements > 0 && (
          <>
            <p className="text-[11px] text-zinc-600 text-right">
              {totalElements} {config.label.toLowerCase()}
            </p>
            <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                loading={loading}
                onPage={setPage}
                onPageSize={(n) => { setPageSize(n); setPage(0); }}
            />
          </>
      )}

      {/* ── Modal Thêm / Sửa ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="font-black text-sm uppercase text-white">
                {modal === 'add' ? `➕ Thêm ${config.label}` : `✏️ Sửa ${config.label}`}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center font-bold transition">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                  <span>⚠️</span><span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-zinc-300 uppercase mb-1.5">
                  Tên {config.label} <span className="text-red-400">*</span>
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={namePlaceholder}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 uppercase mb-1.5">Mã</label>
                <input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder={codePlaceholder}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-[#c6f500] transition"
                />
              </div>
              {hasDesc && (
              <div>
                <label className="block font-bold text-zinc-300 uppercase mb-1.5">{descLabel}</label>
                {isColor ? (
                    <div className="flex items-center gap-2">
                      <input
                          type="color"
                          value={HEX_RE.test(formMoTa) ? formMoTa : '#000000'}
                          onChange={(e) => setFormMoTa(e.target.value.toUpperCase())}
                          className="w-12 h-10 bg-zinc-950 border border-zinc-700 rounded-xl cursor-pointer p-1"
                      />
                      <input
                          value={formMoTa}
                          onChange={(e) => setFormMoTa(e.target.value.toUpperCase())}
                          placeholder="#000000"
                          maxLength={7}
                          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-[#c6f500] transition"
                      />
                    </div>
                ) : (
                    <textarea
                        value={formMoTa}
                        onChange={(e) => setFormMoTa(e.target.value)}
                        placeholder="Mô tả ngắn (tùy chọn)..."
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition resize-none"
                    />
                )}
              </div> )}
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end border-t border-zinc-800 pt-4">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-700 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black text-xs rounded-xl transition shadow disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                {modal === 'add' ? '➕ Thêm' : '💾 Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Xác nhận Xóa ── */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center space-y-3 mb-6">
              <div className="text-4xl">🗑️</div>
              <h3 className="font-black text-base uppercase text-white">Xác Nhận Xóa</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bạn chắc chắn muốn xóa<br />
                <span className="font-bold text-white">"{getName(selected)}"</span>?<br />
                <span className="text-red-400">Hành động này không thể hoàn tác.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-700 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Component chính ──────────────────────────────────────────────────────────
export default function AdminAttribute({ isAdmin }) {
  const [activeAttr, setActiveAttr] = useState('thuong-hieu');
  const current = ATTRIBUTE_CONFIG.find((c) => c.key === activeAttr);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-800">
        <h2 className="text-lg font-black uppercase text-white">Quản Lý Thuộc Tính</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Quản lý các thuộc tính dùng cho sản phẩm</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {ATTRIBUTE_CONFIG.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveAttr(c.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeAttr === c.key
                ? 'bg-[#c6f500] text-black shadow'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Nội dung thuộc tính đang chọn */}
      {current && (
        <AttributeTable key={current.key} config={current} isAdmin={isAdmin} />
      )}
    </div>
  );
}

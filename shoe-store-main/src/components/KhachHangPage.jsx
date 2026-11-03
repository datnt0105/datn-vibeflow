import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import {
  ConfirmDialog, Field, GhostButton, Icon, IconButton, KpiCard, Modal, PageHeader, Pagination, PrimaryButton,
  SelectInput, Switch, TableStateRow, TextInput, Toast, percent, useDebounced, usePagedList, useToast,
} from './admin/ui.jsx';
import khachHangApi from "../api/khachHangApi.js";

/**
 * SCR-ADM-KH-01 Quản lý khách hàng — route /admin/khach-hang (ADMIN, NHAN_VIEN)
 * Mockup: .f5/specs/mockups/v1.0.0/scr-adm-kh-01-khach-hang-list.html · Quy tắc: ADR-002
 *   - NHAN_VIEN được thêm / sửa; chỉ ADMIN được khóa / mở khóa.
 *   - Thêm mới: mật khẩu mặc định "1". SĐT bắt buộc + không trùng.
 */
const EMPTY_FORM = { hoTen: '', sdt: '', email: '', ngaySinh: '', gioiTinh: null, trangThai: true };
const SDT_REGEX = /^0\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toParams = (sp) => ({
  q: sp.get('q') || undefined,
  gioiTinh: sp.get('gioiTinh') || undefined,
  trangThai: sp.get('trangThai') || undefined,
  page: Number(sp.get('page')) || 1,
  size: Number(sp.get('size')) || 10,
});

const formatDate = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');
const formatGioiTinh = (g) => (g == null ? '—' : g ? 'Nam' : 'Nữ');

function validate(f) {
  const e = {};
  if (!f.hoTen.trim()) e.hoTen = 'Vui lòng nhập họ tên!';
  else if (f.hoTen.trim().length > 100) e.hoTen = 'Họ tên tối đa 100 ký tự!';
  if (!f.sdt.trim()) e.sdt = 'Vui lòng nhập số điện thoại!';
  else if (!SDT_REGEX.test(f.sdt.trim())) e.sdt = 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0!';
  if (f.email.trim() && !EMAIL_REGEX.test(f.email.trim())) e.email = 'Email không đúng định dạng!';
  if (f.ngaySinh && f.ngaySinh >= new Date().toISOString().slice(0, 10)) e.ngaySinh = 'Ngày sinh phải trước ngày hiện tại!';
  return e;
}

/** Lỗi từ BE → lỗi theo ô: 400 có errors{field}; 409 nhận diện theo nội dung message */
function serverFieldErrors(err) {
  if (err?.data?.errors) return err.data.errors;
  if (err?.status === 409) {
    if (/email/i.test(err.message)) return { email: err.message };
    if (/điện thoại/i.test(err.message)) return { sdt: err.message };
  }
  return null;
}

export default function KhachHangPage() {
  const isAdmin = (useAuthStore((s) => s.session?.role) || '').toUpperCase() === 'ADMIN';
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, state, error, reload } = usePagedList(khachHangApi.search, searchParams, toParams);
  const [stats, setStats] = useState(null);
  const [toast, showToast] = useToast();

  // Tìm kiếm: gõ → debounce 300ms → ghi lên URL
  const [q, setQ] = useState(searchParams.get('q') || '');
  const debouncedQ = useDebounced(q);

  const loadStats = () => khachHangApi.thongKe().then(setStats).catch(() => setStats(null));
  useEffect(() => { loadStats(); }, []);

  const updateParams = (patch, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, String(v))));
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    if ((searchParams.get('q') || '') !== debouncedQ) updateParams({ q: debouncedQ.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const resetFilters = () => { setQ(''); setSearchParams(new URLSearchParams()); };

  // ── Modal thêm / sửa ───────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', kh }
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (kh) => {
    setForm({ hoTen: kh.hoTen || '', sdt: kh.sdt || '', email: kh.email || '', ngaySinh: kh.ngaySinh || '', gioiTinh: kh.gioiTinh, trangThai: kh.trangThai });
    setErrors({});
    setModal({ mode: 'edit', kh });
  };
  const closeModal = () => !saving && setModal(null);
  const setField = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })); };

  const submit = async () => {
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    const payload = {
      hoTen: form.hoTen.trim(), sdt: form.sdt.trim(), email: form.email.trim() || null,
      ngaySinh: form.ngaySinh || null, gioiTinh: form.gioiTinh, trangThai: form.trangThai,
    };
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        const kh = await khachHangApi.create(payload);
        showToast(`Thêm khách hàng ${kh.maKhachHang} thành công`);
      } else {
        await khachHangApi.update(modal.kh.id, payload);
        showToast('Cập nhật khách hàng thành công');
      }
      setModal(null);
      reload();
      loadStats();
    } catch (err) {
      const fe = serverFieldErrors(err);
      if (fe) setErrors(fe); else showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Khóa / mở khóa (chỉ ADMIN) ─────────────────────────────────────────────
  const [confirm, setConfirm] = useState(null);
  const [toggling, setToggling] = useState(false);
  const doToggle = async () => {
    const kh = confirm;
    setToggling(true);
    try {
      await khachHangApi.updateTrangThai(kh.id, !kh.trangThai);
      showToast(kh.trangThai ? `Đã khóa tài khoản ${kh.maKhachHang}` : `Đã mở khóa tài khoản ${kh.maKhachHang}`);
      setConfirm(null);
      reload();
      loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setToggling(false);
    }
  };

  const params = toParams(searchParams);
  const cols = 9;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý khách hàng"
        subtitle="Tra cứu, cập nhật thông tin và quản lý trạng thái tài khoản khách hàng mua giày tại VibeFlow."
        action={<PrimaryButton icon="plus" onClick={openAdd}>Thêm khách hàng</PrimaryButton>}
      />

      <section aria-label="Thống kê khách hàng" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Tổng khách hàng" value={stats?.tong} icon="users" hint="Tất cả tài khoản đã đăng ký" />
        <KpiCard label="Đang hoạt động" value={stats?.hoatDong} icon="userCheck" tone="green"
          hint={stats && <><b className="text-emerald-400 font-mono">{percent(stats.hoatDong, stats.tong)}</b> tổng số khách hàng</>} />
        <KpiCard label="Đã khóa" value={stats?.daKhoa} icon="userX" tone="red"
          hint={stats && <><b className="text-red-400 font-mono">{percent(stats.daKhoa, stats.tong)}</b> tổng số khách hàng</>} />
        <KpiCard label="Mới trong tháng" value={stats?.moiTrongThang} icon="userPlus" tone="lime" highlight hint="Đăng ký từ đầu tháng này" />
      </section>

      <section aria-labelledby="kh-table-title" className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 id="kh-table-title" className="text-base font-bold text-white">Danh sách khách hàng</h2>
          <p className="text-xs text-zinc-500">Kết quả: <b className="text-zinc-200 font-mono">{data.totalElements.toLocaleString('vi-VN')}</b> khách hàng</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-5 py-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Icon name="search" /></span>
            <label htmlFor="f-q" className="sr-only">Tìm kiếm khách hàng</label>
            <TextInput id="f-q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo mã, họ tên, SĐT, email…" className="pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="f-gt" className="text-xs text-zinc-400">Giới tính</label>
            <SelectInput id="f-gt" value={searchParams.get('gioiTinh') || ''} onChange={(e) => updateParams({ gioiTinh: e.target.value })} className="w-28">
              <option value="">Tất cả</option>
              <option value="true">Nam</option>
              <option value="false">Nữ</option>
            </SelectInput>
            <label htmlFor="f-tt" className="text-xs text-zinc-400">Trạng thái</label>
            <SelectInput id="f-tt" value={searchParams.get('trangThai') || ''} onChange={(e) => updateParams({ trangThai: e.target.value })} className="w-36">
              <option value="">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Đã khóa</option>
            </SelectInput>
            <GhostButton icon="refresh" onClick={resetFilters}>Đặt lại</GhostButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Danh sách khách hàng, trang {params.page} trên {Math.max(data.totalPages, 1)}</caption>
            <thead className="bg-zinc-900/60 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">STT</th>
                <th scope="col" className="px-4 py-3 font-semibold">Mã KH</th>
                <th scope="col" className="px-4 py-3 font-semibold">Họ tên</th>
                <th scope="col" className="px-4 py-3 font-semibold">Số điện thoại</th>
                <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                <th scope="col" className="px-4 py-3 font-semibold">Ngày sinh</th>
                <th scope="col" className="px-4 py-3 font-semibold">Giới tính</th>
                <th scope="col" className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {state !== 'ready' || data.content.length === 0 ? (
                <TableStateRow colSpan={cols} state={state === 'ready' ? 'empty' : state} error={error} onRetry={reload}
                  emptyText="Không tìm thấy khách hàng phù hợp" />
              ) : data.content.map((kh, i) => (
                <tr key={kh.id} className={`border-t border-zinc-800/80 hover:bg-zinc-900/60 ${kh.trangThai ? '' : 'text-zinc-500'}`}>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{(data.page - 1) * data.size + i + 1}</td>
                  <td className="px-4 py-3 font-mono font-bold text-white">{kh.maKhachHang}</td>
                  <td className={`px-4 py-3 font-semibold ${kh.trangThai ? 'text-white' : ''}`}>{kh.hoTen}</td>
                  <td className="px-4 py-3 font-mono">{kh.sdt || '—'}</td>
                  <td className="px-4 py-3">{kh.email || '—'}</td>
                  <td className="px-4 py-3 font-mono">{formatDate(kh.ngaySinh)}</td>
                  <td className="px-4 py-3">{formatGioiTinh(kh.gioiTinh)}</td>
                  <td className="px-4 py-3">
                    {/* ADR-002: chỉ ADMIN được khóa / mở khóa — role khác thấy switch ở trạng thái disabled */}
                    <div className="flex justify-center">
                      <Switch checked={kh.trangThai} disabled={!isAdmin} onChange={() => setConfirm(kh)}
                        label={`${kh.trangThai ? 'Khóa' : 'Mở khóa'} tài khoản ${kh.maKhachHang} – ${kh.hoTen}`}
                        title={isAdmin ? undefined : (kh.trangThai ? 'Hoạt động' : 'Đã khóa')} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton icon="pencil" label={`Sửa khách hàng ${kh.maKhachHang} – ${kh.hoTen}`} onClick={() => openEdit(kh)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {state === 'ready' && data.totalElements > 0 && (
          <Pagination page={data.page} size={data.size} totalElements={data.totalElements} totalPages={data.totalPages}
            unit="khách hàng" onPage={(p) => updateParams({ page: p }, false)} onSize={(s) => updateParams({ size: s })} />
        )}
      </section>

      <Modal open={!!modal} onClose={closeModal} onSubmit={submit}
        title={modal?.mode === 'edit' ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}
        footer={<>
          <GhostButton onClick={closeModal} disabled={saving}>Hủy</GhostButton>
          <PrimaryButton type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</PrimaryButton>
        </>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="m-ma" label="Mã KH">
            <TextInput id="m-ma" readOnly value={modal?.mode === 'edit' ? modal.kh.maKhachHang : 'Tự sinh'} className="font-mono" />
          </Field>
          <Field id="m-ten" label="Họ tên" required error={errors.hoTen}>
            <TextInput id="m-ten" name="hoTen" autoFocus maxLength={100} value={form.hoTen} onChange={setField('hoTen')}
              placeholder="VD: Nguyễn Văn An" error={errors.hoTen} aria-required="true" />
          </Field>
          <Field id="m-sdt" label="Số điện thoại" required error={errors.sdt}>
            <TextInput id="m-sdt" name="sdt" type="tel" inputMode="numeric" maxLength={10} value={form.sdt} onChange={setField('sdt')}
              placeholder="0xxxxxxxxx" error={errors.sdt} className="font-mono" aria-required="true" />
          </Field>
          <Field id="m-email" label="Email" error={errors.email}>
            <TextInput id="m-email" name="email" type="email" maxLength={100} value={form.email} onChange={setField('email')}
              placeholder="ten@email.com" error={errors.email} />
          </Field>
          <Field id="m-ns" label="Ngày sinh" error={errors.ngaySinh}>
            <TextInput id="m-ns" name="ngaySinh" type="date" value={form.ngaySinh} onChange={setField('ngaySinh')}
              error={errors.ngaySinh} className="font-mono [color-scheme:dark]" />
          </Field>
          <fieldset>
            <legend className="mb-1.5 block text-xs font-medium text-zinc-400">Giới tính</legend>
            <div className="flex h-10 items-center gap-5 text-sm">
              {[[true, 'Nam'], [false, 'Nữ']].map(([val, text]) => (
                <label key={text} className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gioiTinh" checked={form.gioiTinh === val}
                    onChange={() => setForm((f) => ({ ...f, gioiTinh: val }))} className="h-4 w-4 accent-[#c6f500]" />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>
          {modal?.mode === 'add' && (
            <>
              <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-3">
                <div>
                  <p id="m-tt-label" className="text-sm font-medium text-white">Trạng thái tài khoản</p>
                  <p id="m-tt-desc" className="text-xs text-zinc-500">
                    {form.trangThai ? 'Hoạt động — khách có thể đăng nhập và đặt hàng' : 'Đã khóa — khách không thể đăng nhập'}
                  </p>
                </div>
                <Switch checked={form.trangThai} onChange={(v) => setForm((f) => ({ ...f, trangThai: v }))} labelledBy="m-tt-label" describedBy="m-tt-desc" />
              </div>
              <p className="sm:col-span-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sky-300 bg-sky-500/10">
                <Icon name="info" />Mật khẩu mặc định là <b className="font-mono">1</b> — khách nên đổi sau lần đăng nhập đầu
              </p>
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} loading={toggling} onCancel={() => !toggling && setConfirm(null)} onConfirm={doToggle}
        tone={confirm?.trangThai ? 'danger' : 'primary'} icon={confirm?.trangThai ? 'alert' : 'unlock'}
        title={confirm && `${confirm.trangThai ? 'Khóa' : 'Mở khóa'} tài khoản khách hàng ${confirm.maKhachHang} – ${confirm.hoTen}?`}
        description={confirm?.trangThai
          ? 'Khách hàng sẽ không thể đăng nhập và đặt hàng trực tuyến cho đến khi được mở khóa. Lịch sử hóa đơn vẫn được giữ nguyên.'
          : 'Khách hàng có thể đăng nhập và đặt hàng trở lại.'}
        confirmText={confirm?.trangThai ? 'Khóa' : 'Mở khóa'} />

      <Toast toast={toast} />
    </div>
  );
}

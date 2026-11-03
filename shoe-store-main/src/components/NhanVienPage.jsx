import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import {
  ConfirmDialog, Field, GhostButton, Icon, IconButton, KpiCard, Modal, PageHeader, Pagination, PrimaryButton,
  SelectInput, Switch, TableStateRow, TextInput, Toast, percent, useDebounced, usePagedList, useToast,
} from './admin/ui.jsx';
import nhanVienApi from "../api/nhanVienApi.js";
/**
 * SCR-ADM-NV-01 Quản lý nhân viên — route /admin/nhan-vien (CHỈ ADMIN)
 * Mockup: .f5/specs/mockups/v1.0.0/scr-adm-nv-01-nhan-vien-list.html · Quy tắc: ADR-003
 *   - Mật khẩu mặc định / đặt lại = "1". SĐT, email bắt buộc + không trùng.
 *   - Không tự khóa / tự đổi vai trò / tự đặt lại mật khẩu; không khóa / hạ quyền ADMIN cuối cùng (BE trả 409).
 */
const EMPTY_FORM = { hoTen: '', sdt: '', email: '', vaiTroId: '', trangThai: true };
const SDT_REGEX = /^0\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toParams = (sp) => ({
  q: sp.get('q') || undefined,
  vaiTroId: sp.get('vaiTroId') || undefined,
  trangThai: sp.get('trangThai') || undefined,
  page: Number(sp.get('page')) || 1,
  size: Number(sp.get('size')) || 10,
});

const initialsOf = (name = '') => name.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase();

function validate(f) {
  const e = {};
  if (!f.hoTen.trim()) e.hoTen = 'Vui lòng nhập họ tên!';
  else if (f.hoTen.trim().length > 100) e.hoTen = 'Họ tên tối đa 100 ký tự!';
  if (!f.sdt.trim()) e.sdt = 'Vui lòng nhập số điện thoại!';
  else if (!SDT_REGEX.test(f.sdt.trim())) e.sdt = 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0!';
  if (!f.email.trim()) e.email = 'Vui lòng nhập email!';
  else if (!EMAIL_REGEX.test(f.email.trim())) e.email = 'Email không đúng định dạng!';
  if (!f.vaiTroId) e.vaiTroId = 'Vui lòng chọn vai trò!';
  return e;
}

function serverFieldErrors(err) {
  if (err?.data?.errors) return err.data.errors;
  if (err?.status === 409) {
    if (/email/i.test(err.message)) return { email: err.message };
    if (/điện thoại/i.test(err.message)) return { sdt: err.message };
  }
  return null;
}

function VaiTroBadge({ vaiTro, muted }) {
  if (!vaiTro) return <span className="text-zinc-500">—</span>;
  const isAdmin = vaiTro.maVaiTro === 'ADMIN';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${
      isAdmin ? 'text-[#c6f500] border-[#c6f500]/60' : 'text-zinc-300 border-zinc-700 bg-zinc-900'} ${muted ? 'opacity-60' : ''}`}>
      {isAdmin && <Icon name="shield" className="w-3 h-3" />}{vaiTro.tenVaiTro}
    </span>
  );
}

export default function NhanVienPage() {
  const currentId = useAuthStore((s) => s.session?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, state, error, reload } = usePagedList(nhanVienApi.search, searchParams, toParams);
  const [stats, setStats] = useState(null);
  const [vaiTros, setVaiTros] = useState([]);
  const [toast, showToast] = useToast();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const debouncedQ = useDebounced(q);

  const loadStats = () => nhanVienApi.thongKe().then(setStats).catch(() => setStats(null));
  useEffect(() => {
    loadStats();
    nhanVienApi.vaiTro().then(setVaiTros).catch(() => setVaiTros([]));
  }, []);

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
  const isSelf = (nv) => nv && currentId != null && Number(nv.id) === Number(currentId);

  // ── Modal thêm / sửa ───────────────────────────────────────────────────────
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editingSelf = modal?.mode === 'edit' && isSelf(modal.nv);

  const defaultVaiTroId = () => String(vaiTros.find((v) => v.maVaiTro === 'NHAN_VIEN')?.id ?? '');
  const openAdd = () => { setForm({ ...EMPTY_FORM, vaiTroId: defaultVaiTroId() }); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (nv) => {
    setForm({ hoTen: nv.hoTen || '', sdt: nv.sdt || '', email: nv.email || '', vaiTroId: String(nv.vaiTro?.id ?? ''), trangThai: nv.trangThai });
    setErrors({});
    setModal({ mode: 'edit', nv });
  };
  const closeModal = () => !saving && setModal(null);
  const setField = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })); };

  const submit = async () => {
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    const payload = {
      hoTen: form.hoTen.trim(), sdt: form.sdt.trim(), email: form.email.trim(),
      vaiTroId: Number(form.vaiTroId), trangThai: form.trangThai,
    };
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        const nv = await nhanVienApi.create(payload);
        showToast(`Thêm nhân viên ${nv.maNhanVien} thành công`);
      } else {
        await nhanVienApi.update(modal.nv.id, payload);
        showToast('Cập nhật nhân viên thành công');
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

  // ── Xác nhận: khóa / mở khóa / đặt lại mật khẩu ────────────────────────────
  const [confirm, setConfirm] = useState(null); // { kind: 'lock' | 'reset', nv }
  const [busy, setBusy] = useState(false);
  const doConfirm = async () => {
    const { kind, nv } = confirm;
    setBusy(true);
    try {
      if (kind === 'reset') {
        await nhanVienApi.resetMatKhau(nv.id);
        showToast(`Đã đặt lại mật khẩu cho ${nv.maNhanVien}`);
      } else {
        await nhanVienApi.updateTrangThai(nv.id, !nv.trangThai);
        showToast(nv.trangThai ? `Đã khóa tài khoản ${nv.maNhanVien}` : `Đã mở khóa tài khoản ${nv.maNhanVien}`);
        loadStats();
      }
      setConfirm(null);
      reload();
    } catch (err) {
      setConfirm(null);
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmProps = (() => {
    if (!confirm) return {};
    const { kind, nv } = confirm;
    const who = `${nv.maNhanVien} – ${nv.hoTen}`;
    if (kind === 'reset') {
      return { tone: 'primary', icon: 'key', title: `Đặt lại mật khẩu cho ${who}?`, description: 'Mật khẩu sẽ về mặc định 1.', confirmText: 'Đặt lại' };
    }
    return nv.trangThai
      ? { tone: 'danger', icon: 'alert', title: `Khóa tài khoản nhân viên ${who}?`, description: 'Nhân viên sẽ không thể đăng nhập hệ thống quản trị.', confirmText: 'Khóa' }
      : { tone: 'primary', icon: 'unlock', title: `Mở khóa tài khoản nhân viên ${who}?`, description: 'Nhân viên có thể đăng nhập hệ thống quản trị trở lại.', confirmText: 'Mở khóa' };
  })();

  const params = toParams(searchParams);
  const cols = 8;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nhân viên"
        subtitle="Quản lý tài khoản đăng nhập trang quản trị: phân vai trò, khóa / mở khóa và đặt lại mật khẩu cho nhân viên cửa hàng."
        action={<PrimaryButton icon="plus" onClick={openAdd}>Thêm nhân viên</PrimaryButton>}
      />

      <section aria-label="Thống kê nhân viên" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Tổng nhân viên" value={stats?.tong} icon="idCard" hint="Tài khoản truy cập trang quản trị" />
        <KpiCard label="Đang hoạt động" value={stats?.hoatDong} icon="userCheck" tone="green"
          hint={stats && <><b className="text-emerald-400 font-mono">{percent(stats.hoatDong, stats.tong)}</b> tổng số nhân viên</>} />
        <KpiCard label="Đã khóa" value={stats?.daKhoa} icon="userX" tone="red"
          hint={stats && <><b className="text-red-400 font-mono">{percent(stats.daKhoa, stats.tong)}</b> · không thể đăng nhập</>} />
        <KpiCard label="Quản trị viên" value={stats?.quanTriVien} icon="shield" tone="lime" highlight
          hint={stats && <>Vai trò <b className="font-mono text-white">ADMIN</b> · {stats.tong - stats.quanTriVien} nhân viên bán hàng</>} />
      </section>

      <section aria-labelledby="nv-table-title" className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 id="nv-table-title" className="text-base font-bold text-white">Danh sách nhân viên</h2>
          <p className="text-xs text-zinc-500">Kết quả: <b className="text-zinc-200 font-mono">{data.totalElements.toLocaleString('vi-VN')}</b> nhân viên</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-5 py-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Icon name="search" /></span>
            <label htmlFor="f-q" className="sr-only">Tìm kiếm nhân viên</label>
            <TextInput id="f-q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo mã, họ tên, SĐT, email…" className="pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="f-vt" className="text-xs text-zinc-400">Vai trò</label>
            <SelectInput id="f-vt" value={searchParams.get('vaiTroId') || ''} onChange={(e) => updateParams({ vaiTroId: e.target.value })} className="w-40">
              <option value="">Tất cả</option>
              {vaiTros.map((v) => <option key={v.id} value={v.id}>{v.tenVaiTro}</option>)}
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
            <caption className="sr-only">Danh sách nhân viên, trang {params.page} trên {Math.max(data.totalPages, 1)}</caption>
            <thead className="bg-zinc-900/60 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">STT</th>
                <th scope="col" className="px-4 py-3 font-semibold">Mã NV</th>
                <th scope="col" className="px-4 py-3 font-semibold">Họ tên</th>
                <th scope="col" className="px-4 py-3 font-semibold">Số điện thoại</th>
                <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                <th scope="col" className="px-4 py-3 font-semibold">Vai trò</th>
                <th scope="col" className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {state !== 'ready' || data.content.length === 0 ? (
                <TableStateRow colSpan={cols} state={state === 'ready' ? 'empty' : state} error={error} onRetry={reload}
                  emptyText="Không tìm thấy nhân viên phù hợp" />
              ) : data.content.map((nv, i) => {
                const self = isSelf(nv);
                return (
                  <tr key={nv.id} className={`border-t border-zinc-800/80 hover:bg-zinc-900/60 ${nv.trangThai ? '' : 'text-zinc-500'}`}>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{(data.page - 1) * data.size + i + 1}</td>
                    <td className="px-4 py-3 font-mono font-bold text-white">{nv.maNhanVien}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 shrink-0 rounded-full text-[11px] font-black flex items-center justify-center ${self ? 'bg-[#c6f500] text-black' : 'bg-zinc-800 text-zinc-300'}`}>
                          {initialsOf(nv.hoTen)}
                        </span>
                        <span className={`font-semibold ${nv.trangThai ? 'text-white' : ''}`}>{nv.hoTen}</span>
                        {self && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border border-[#c6f500]/60 text-[#c6f500]">Bạn</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">{nv.sdt || '—'}</td>
                    <td className="px-4 py-3">{nv.email}</td>
                    <td className="px-4 py-3"><VaiTroBadge vaiTro={nv.vaiTro} muted={!nv.trangThai} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Switch checked={nv.trangThai} disabled={self} onChange={() => setConfirm({ kind: 'lock', nv })}
                          title={self ? 'Không thể khóa tài khoản đang đăng nhập' : undefined}
                          label={`${nv.trangThai ? 'Khóa' : 'Mở khóa'} tài khoản ${nv.maNhanVien} – ${nv.hoTen}`} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton icon="pencil" label={`Sửa nhân viên ${nv.maNhanVien} – ${nv.hoTen}`} onClick={() => openEdit(nv)} />
                        <IconButton icon="key" label={`Đặt lại mật khẩu ${nv.maNhanVien} – ${nv.hoTen}`} disabled={self}
                          title={self ? 'Đổi mật khẩu của bạn tại trang hồ sơ cá nhân' : undefined}
                          onClick={() => setConfirm({ kind: 'reset', nv })} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {state === 'ready' && data.totalElements > 0 && (
          <Pagination page={data.page} size={data.size} totalElements={data.totalElements} totalPages={data.totalPages}
            unit="nhân viên" onPage={(p) => updateParams({ page: p }, false)} onSize={(s) => updateParams({ size: s })} />
        )}
      </section>

      <Modal open={!!modal} onClose={closeModal} onSubmit={submit}
        title={modal?.mode === 'edit' ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
        footer={<>
          <GhostButton onClick={closeModal} disabled={saving}>Hủy</GhostButton>
          <PrimaryButton type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</PrimaryButton>
        </>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="m-ma" label="Mã NV">
            <TextInput id="m-ma" readOnly value={modal?.mode === 'edit' ? modal.nv.maNhanVien : 'Tự sinh'} className="font-mono" />
          </Field>
          <Field id="m-ten" label="Họ tên" required error={errors.hoTen}>
            <TextInput id="m-ten" name="hoTen" autoFocus maxLength={100} value={form.hoTen} onChange={setField('hoTen')}
              placeholder="VD: Nguyễn Văn An" error={errors.hoTen} aria-required="true" />
          </Field>
          <Field id="m-sdt" label="Số điện thoại" required error={errors.sdt}>
            <TextInput id="m-sdt" name="sdt" type="tel" inputMode="numeric" maxLength={10} value={form.sdt} onChange={setField('sdt')}
              placeholder="0xxxxxxxxx" error={errors.sdt} className="font-mono" aria-required="true" />
          </Field>
          <Field id="m-email" label="Email" required error={errors.email} help="Dùng làm tên đăng nhập">
            <TextInput id="m-email" name="email" type="email" maxLength={100} value={form.email} onChange={setField('email')}
              placeholder="ten@vibeflow.com" error={errors.email} aria-required="true" />
          </Field>
          <Field id="m-vt" label="Vai trò" required error={errors.vaiTroId}>
            <SelectInput id="m-vt" name="vaiTroId" value={form.vaiTroId} onChange={setField('vaiTroId')} disabled={editingSelf}
              error={errors.vaiTroId} aria-required="true">
              <option value="" disabled>— Chọn vai trò —</option>
              {vaiTros.map((v) => <option key={v.id} value={v.id}>{v.tenVaiTro}</option>)}
            </SelectInput>
          </Field>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-zinc-400" aria-hidden="true">Trạng thái</span>
            <div className="flex h-10 items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3.5">
              <p id="m-tt-label" className="text-sm font-medium text-white">{form.trangThai ? 'Hoạt động' : 'Đã khóa'}</p>
              <Switch checked={form.trangThai} disabled={editingSelf} onChange={(v) => setForm((f) => ({ ...f, trangThai: v }))}
                labelledBy="m-tt-label" describedBy="m-tt-desc" />
            </div>
          </div>
          <p id="m-tt-desc" className="sm:col-span-2 -mt-2 text-xs text-zinc-500">
            {editingSelf ? 'Không thể khóa hoặc đổi vai trò của tài khoản đang đăng nhập'
              : form.trangThai ? 'Hoạt động — nhân viên có thể đăng nhập trang quản trị' : 'Đã khóa — nhân viên không thể đăng nhập'}
          </p>
          {modal?.mode === 'add' && (
            <p className="sm:col-span-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sky-300 bg-sky-500/10">
              <Icon name="info" />Mật khẩu mặc định là <b className="font-mono">1</b> — nhân viên nên đổi sau lần đăng nhập đầu
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} loading={busy} onCancel={() => !busy && setConfirm(null)} onConfirm={doConfirm} {...confirmProps} />
      <Toast toast={toast} />
    </div>
  );
}

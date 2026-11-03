import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Bộ component dùng chung cho các màn quản trị (Khách hàng, Nhân viên, ...).
 * Giao diện theo mockup đã duyệt: .f5/specs/mockups/v1.0.0/scr-adm-*.html
 */

// ── Icons (stroke, 24x24 — cùng bộ với mockup) ───────────────────────────────
const ICON_PATHS = {
  plus: 'M12 5v14M5 12h14',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  unlock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.9-1',
  key: 'M15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM12 11v10M12 17h3M12 14h2',
  x: 'M18 6 6 18M6 6l12 12',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  userCheck: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM16 11l2 2 4-4',
  userX: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 8l5 5M22 8l-5 5',
  userPlus: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  idCard: 'M3 5h18v14H3zM7 15c.5-1.5 1.7-2 3-2s2.5.5 3 2M10 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM15 9h3M15 12h3',
  alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  check: 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3',
  searchX: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35M8.5 8.5l5 5M13.5 8.5l-5 5',
  chevLeft: 'M15 18l-6-6 6-6',
  chevRight: 'M9 18l6-6-6-6',
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  cart: 'M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6',
  package: 'M16.5 9.4 7.5 4.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7zM3.3 7 12 12l8.7-5M12 22V12',
  receipt: 'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM8 8h8M8 12h8M8 16h5',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  returnIcon: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01',
  chart: 'M3 3v18h18M7 16l4-4 4 4 5-6',
  store: 'M3 9l1-5h16l1 5M3 9h18v11H3zM9 20v-6h6v6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
};

export function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// ── Trang: tiêu đề + nút chính ───────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({ icon, children, className = '', ...props }) {
  return (
    <button type="button" {...props}
      className={`inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-[#c6f500] hover:bg-[#b0dc00] text-black text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f500]/60 ${className}`}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

export function GhostButton({ icon, children, className = '', ...props }) {
  return (
    <button type="button" {...props}
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f500]/60 ${className}`}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

// ── KPI ──────────────────────────────────────────────────────────────────────
const TONE_TEXT = { lime: 'text-[#c6f500]', green: 'text-emerald-400', red: 'text-red-400', zinc: 'text-zinc-400' };

export function KpiCard({ label, value, hint, icon, tone = 'zinc', highlight = false }) {
  return (
    <div className="rounded-2xl p-5 border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">{label}</p>
        <span className={TONE_TEXT[tone]}><Icon name={icon} /></span>
      </div>
      <p className={`mt-2 text-3xl font-black tabular-nums ${highlight ? 'text-[#c6f500]' : 'text-white'}`}>
        {value == null ? <span className="inline-block w-12 h-7 rounded bg-zinc-800 animate-pulse" /> : value.toLocaleString('vi-VN')}
      </p>
      {hint && <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

export const percent = (part, total) => (total ? `${((part * 100) / total).toFixed(1).replace('.', ',')}%` : '0%');

// ── Badge trạng thái ─────────────────────────────────────────────────────────
export function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Đã khóa
    </span>
  );
}

export function IconButton({ icon, label, tone = 'default', disabled, title, ...props }) {
  const color = tone === 'danger' ? 'text-red-400 hover:bg-red-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800';
  return (
    <button type="button" aria-label={label} title={title || label} aria-disabled={disabled || undefined}
      {...props}
      onClick={disabled ? undefined : props.onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f500]/60 ${disabled ? 'opacity-30 cursor-not-allowed text-zinc-500' : color}`}>
      <Icon name={icon} />
    </button>
  );
}

// ── Form fields ──────────────────────────────────────────────────────────────
// Không gắn sẵn w-full: nếu caller truyền w-28/w-36 thì hai class width cùng lúc sẽ xung đột (thứ tự CSS quyết định)
const widthOf = (className) => (/(^|\s)w-/.test(className) ? '' : 'w-full');
const inputCls = (error) =>
  `h-10 rounded-lg border bg-black px-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-zinc-900 read-only:text-zinc-400 ${
    error ? 'border-red-500 focus:ring-red-500/30' : 'border-zinc-800 focus:border-[#c6f500] focus:ring-[#c6f500]/20'
  }`;

export function Field({ id, label, required, error, help, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-400">
          <Icon name="alert" className="w-3.5 h-3.5 shrink-0" />{error}
        </p>
      ) : help ? (
        <p className="mt-1.5 text-xs text-zinc-500">{help}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ id, error, className = '', ...props }) {
  return (
    <input id={id} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-err` : undefined}
      className={`${inputCls(error)} ${widthOf(className)} ${className}`} {...props} />
  );
}

export function SelectInput({ id, error, children, className = '', ...props }) {
  return (
    <select id={id} aria-invalid={!!error || undefined} className={`${inputCls(error)} ${widthOf(className)} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Switch({ checked, onChange, disabled, label, title, labelledBy, describedBy }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} title={title || label}
      aria-labelledby={labelledBy} aria-describedby={describedBy}
      aria-disabled={disabled || undefined} onClick={disabled ? undefined : () => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f500]/60 ${
        checked ? 'bg-[#c6f500]' : 'bg-zinc-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className={`inline-block h-5 w-5 rounded-full bg-black transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

// ── Modal / Confirm ──────────────────────────────────────────────────────────
function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

export function Modal({ open, title, onClose, children, footer, onSubmit }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onMouseDown={onClose}>
      <form role="dialog" aria-modal="true" aria-labelledby="modal-title" noValidate
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
        className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 id="modal-title" className="text-base font-bold text-white">{title}</h2>
          <IconButton icon="x" label="Đóng" onClick={onClose} />
        </div>
        <div className="px-5 py-5">{children}</div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-800">{footer}</div>
      </form>
    </div>
  );
}

export function ConfirmDialog({ open, tone = 'danger', icon = 'alert', title, description, confirmText, loading, onConfirm, onCancel }) {
  useEscape(open, onCancel);
  const okRef = useRef(null);
  useEffect(() => { if (open) okRef.current?.focus(); }, [open]);
  if (!open) return null;
  const danger = tone === 'danger';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onMouseDown={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-5 shadow-2xl">
        <div className="flex gap-4">
          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${danger ? 'text-red-400 bg-red-500/15' : 'text-amber-400 bg-amber-500/15'}`}>
            <Icon name={icon} className="w-5 h-5" />
          </span>
          <div>
            <h2 id="confirm-title" className="text-base font-bold text-white">{title}</h2>
            <p id="confirm-desc" className="mt-1.5 text-sm text-zinc-400">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onCancel} disabled={loading}>Hủy</GhostButton>
          <button ref={okRef} type="button" onClick={onConfirm} disabled={loading}
            className={`inline-flex h-10 items-center rounded-xl px-4 text-sm font-bold transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 ${
              danger ? 'bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-400' : 'bg-[#c6f500] hover:bg-[#b0dc00] text-black focus-visible:ring-[#c6f500]/60'}`}>
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = useCallback((message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [toast, show];
}

export function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-[60]">
      <div className={`flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-2xl border-l-4 ${ok ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
        <span className={ok ? 'text-emerald-400' : 'text-red-400'}><Icon name={ok ? 'check' : 'alert'} className="w-5 h-5" /></span>
        <p className="text-sm font-medium text-white">{toast.message}</p>
      </div>
    </div>
  );
}

// ── Bảng: trạng thái rỗng / đang tải / lỗi ───────────────────────────────────
export function TableStateRow({ colSpan, state, error, onRetry, emptyText }) {
  if (state === 'loading') {
    return Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-t border-zinc-800/80">
        <td colSpan={colSpan} className="px-4 py-4"><div className="h-4 rounded bg-zinc-800/80 animate-pulse" /></td>
      </tr>
    ));
  }
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-zinc-400">
          <Icon name={state === 'error' ? 'alert' : 'searchX'} className={`w-8 h-8 ${state === 'error' ? 'text-red-400' : 'text-zinc-600'}`} />
          <p className="text-sm font-semibold text-zinc-300">{state === 'error' ? 'Lỗi tải dữ liệu' : emptyText}</p>
          {state === 'error' && <p className="text-xs">{error}</p>}
          {state === 'error' && <GhostButton icon="refresh" onClick={onRetry}>Thử lại</GhostButton>}
        </div>
      </td>
    </tr>
  );
}

// ── Phân trang ───────────────────────────────────────────────────────────────
export function Pagination({ page, size, totalElements, totalPages, unit, onPage, onSize }) {
  const from = totalElements === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, totalElements);
  const pages = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) pages.push(p);
  const btn = 'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition';
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-800 text-xs text-zinc-400">
      <p>Hiển thị <b className="text-zinc-200">{from}–{to}</b> của <b className="text-zinc-200">{totalElements.toLocaleString('vi-VN')}</b> {unit}</p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span>Số dòng/trang</span>
          <select value={size} onChange={(e) => onSize(Number(e.target.value))}
            className="h-8 rounded-lg border border-zinc-800 bg-black px-2 text-xs text-white">
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <nav className="flex items-center gap-1" aria-label="Phân trang">
          <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPage(page - 1)}
            className={`${btn} text-zinc-400 hover:bg-zinc-800 disabled:opacity-30`}><Icon name="chevLeft" /></button>
          {pages.map((p) => (
            <button key={p} type="button" aria-label={`Trang ${p}`} aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)}
              className={`${btn} ${p === page ? 'bg-[#c6f500] text-black' : 'text-zinc-300 hover:bg-zinc-800'}`}>{p}</button>
          ))}
          <button type="button" aria-label="Trang sau" disabled={page >= totalPages} onClick={() => onPage(page + 1)}
            className={`${btn} text-zinc-400 hover:bg-zinc-800 disabled:opacity-30`}><Icon name="chevRight" /></button>
        </nav>
      </div>
    </div>
  );
}

// ── Hook: danh sách có tìm/lọc/phân trang đồng bộ query string ────────────────
/**
 * filters lưu trên URL (?q=&page=&size=...) để F5 / Back giữ nguyên trạng thái (screen-list.md §1 quy tắc 6).
 * @param {Function} fetcher (params) => Promise<PageResponse>
 * @param {URLSearchParams} searchParams từ useSearchParams()
 * @param {Function} toParams (searchParams) => params gửi API
 */
export function usePagedList(fetcher, searchParams, toParams) {
  const [data, setData] = useState({ content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 });
  const [state, setState] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const key = searchParams.toString();

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetcher(toParams(searchParams));
      setData(res);
      setState('ready');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { load(); }, [load]);
  return { data, state, error, reload: load };
}

/** Debounce giá trị (ô tìm kiếm) */
export function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

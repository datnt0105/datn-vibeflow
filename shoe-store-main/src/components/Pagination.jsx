// components/Pagination.jsx
import React from 'react';

function getPageNumbers(current, total, max = 5) {
    let start = Math.max(0, current - Math.floor(max / 2));
    let end = Math.min(total, start + max);
    start = Math.max(0, end - max);
    return Array.from({ length: end - start }, (_, i) => start + i);
}

const btn = 'px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg font-bold disabled:opacity-40 hover:bg-zinc-800 transition';

export default function Pagination({ page, totalPages, pageSize, loading, onPage, onPageSize }) {
    if (totalPages <= 0) return null;
    const first = page === 0;
    const last = page >= totalPages - 1;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-500">
                <span>Hiển thị</span>
                <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[#c6f500]">
                    {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span>/ trang · Trang {page + 1} / {totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
                <button className={btn} onClick={() => onPage(0)} disabled={first || loading}>«</button>
                <button className={btn} onClick={() => onPage(page - 1)} disabled={first || loading}>‹</button>

                {getPageNumbers(page, totalPages).map((n) => (
                    <button key={n} onClick={() => onPage(n)} disabled={loading}
                            className={`w-8 h-8 rounded-lg font-bold border transition ${
                                n === page
                                    ? 'bg-[#c6f500] text-black border-[#c6f500]'
                                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                            }`}>
                        {n + 1}
                    </button>
                ))}

                <button className={btn} onClick={() => onPage(page + 1)} disabled={last || loading}>›</button>
                <button className={btn} onClick={() => onPage(totalPages - 1)} disabled={last || loading}>»</button>
            </div>
        </div>
    );
}
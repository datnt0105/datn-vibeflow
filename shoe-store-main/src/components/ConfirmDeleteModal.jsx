import React from 'react';

export default function ConfirmDeleteModal({ name, onCancel, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
                <div className="text-center space-y-3 mb-6">
                    <div className="text-4xl">🗑️</div>
                    <h3 className="font-black text-base uppercase text-white">Xác Nhận Xóa</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Bạn chắc chắn muốn xóa sản phẩm<br />
                        <span className="font-bold text-white">"{name}"</span>?<br />
                        <span className="text-red-400">Hành động này không thể hoàn tác.</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                            className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-700 transition">
                        Hủy
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition disabled:opacity-50">
                        {loading ? 'Đang xóa...' : 'Xóa Sản Phẩm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
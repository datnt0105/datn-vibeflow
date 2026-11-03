import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  getCurrentSession,
  setAuthSession,
  clearAuthSession,
  updateAccessToken as updateStorageToken,
} from '../api/authStorage';

/**
 * Zustand Store quản lý xác thực toàn cục — có persist vào localStorage.
 *
 * Lưu ý Zustand v5: persist hydrate bất đồng bộ.
 * Dùng `_hasHydrated` để ProtectedRoute biết khi nào đã đọc xong localStorage,
 * tránh redirect nhầm về /login khi F5.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,        // sẽ được restore từ localStorage sau khi hydrate
      _hasHydrated: false,  // cờ báo persist đã đọc xong localStorage

      // Được gọi tự động bởi onRehydrateStorage bên dưới
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      // Đăng nhập: lưu session vào state + localStorage
      login: (sessionData) => {
        setAuthSession(sessionData);
        set({ session: sessionData });
      },

      // Đăng xuất: xóa session
      logout: () => {
        clearAuthSession();
        set({ session: null });
      },

      // Cập nhật access token mới sau khi refresh thành công
      setAccessToken: (newAccessToken) => {
        updateStorageToken(newAccessToken);
        const currentSession = get().session;
        if (currentSession) {
          set({ session: { ...currentSession, accessToken: newAccessToken } });
        }
      },
    }),
    {
      name: 'vibeflow_session',
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist session, không persist _hasHydrated
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        // Được gọi sau khi persist đọc xong localStorage
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// Lắng nghe sự kiện token hết hạn từ axiosClient → chỉ cần xóa state Zustand
// (redirect đã được xử lý bởi axiosClient dùng window.location)
if (typeof window !== 'undefined') {
  window.addEventListener('vibeflow:auth-expired', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;

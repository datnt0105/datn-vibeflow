import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  clearAuthSession
} from './authStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

/**
 * Xóa session + redirect về trang đăng nhập.
 * Dùng window.location vì axiosClient nằm ngoài React.
 */
const forceLogout = () => {
  clearAuthSession();
  if (typeof window !== 'undefined') {
    // Thông báo để Zustand store xóa state
    window.dispatchEvent(new CustomEvent('vibeflow:auth-expired'));
    // Redirect đúng cổng đăng nhập
    const isAdminPath = window.location.pathname.startsWith('/admin');
    window.location.href = isAdminPath ? '/admin/login' : '/login';
  }
};

// ── Request Interceptor: gắn Bearer token ─────────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config;

    // Lỗi mạng / server không phản hồi
    if (!error.response) {
      return Promise.reject({
        success: false,
        status: 0,
        message: 'Không thể kết nối đến máy chủ. Hãy kiểm tra backend đang chạy!',
        originalError: error,
      });
    }

    const { status } = error.response;
    const requestUrl  = originalRequest?.url || '';

    // Các endpoint auth không kích hoạt refresh (tránh loop vô hạn)
    const isAuthEndpoint = [
      '/auth/login', '/auth/admin/login', '/auth/customer/login',
      '/auth/refresh', '/auth/customer/register',
    ].some((u) => requestUrl.includes(u));

    // ── 401 và 403: thử refresh token ─────────────────────────────────────────
    // Backend cũ (chưa fix) trả 403 thay vì 401 khi token hết hạn
    // → xử lý cả 2 để tương thích
    const needsRefresh = (status === 401 || status === 403)
      && !isAuthEndpoint
      && !originalRequest._retry;

    if (needsRefresh) {
      const refreshToken = getRefreshToken();

      // Không có refresh token → logout ngay
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(formatError(error));
      }

      // Đang có request khác refresh → đưa vào queue chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh bằng axios thường (không qua interceptor)
        const refreshRes = await axios.post(
          `${BASE_URL}/auth/refresh`,
          null,
          { params: { refreshToken }, timeout: 10000 }
        );

        const newToken = refreshRes.data?.accessToken;
        if (!newToken) throw new Error('Server không trả về access token mới');

        // Lưu token mới, retry tất cả request đang chờ
        updateAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);

      } catch {
        // Refresh thất bại (refresh token hết hạn) → logout
        processQueue(new Error('Refresh failed'), null);
        forceLogout();
        return Promise.reject(formatError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatError(error));
  }
);

function formatError(error) {
  const status = error.response?.status || 500;
  const data   = error.response?.data;
  let message  = 'Đã có lỗi xảy ra!';
  if (typeof data === 'string' && data.length < 300) message = data;
  else if (data?.message) message = data.message;
  else if (error.message)  message = error.message;
  return { success: false, status, message, data, originalError: error };
}

export default axiosClient;

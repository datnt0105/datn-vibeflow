// Quản lý lưu trữ phiên đăng nhập và Token trong localStorage
const SESSION_KEY = 'vibeflow_session';
const ACCESS_TOKEN_KEY = 'vibeflow_access_token';
const REFRESH_TOKEN_KEY = 'vibeflow_refresh_token';

/**
 * Lấy Access Token từ localStorage (hỗ trợ cả key độc lập và trong object session)
 * @returns {string|null}
 */
export const getAccessToken = () => {
  const direct = localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('accessToken');
  if (direct) return direct;

  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    return session?.accessToken || null;
  } catch {
    return null;
  }
};

/**
 * Lấy Refresh Token từ localStorage
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  const direct = localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('refreshToken');
  if (direct) return direct;

  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    return session?.refreshToken || null;
  } catch {
    return null;
  }
};

/**
 * Lưu toàn bộ phiên đăng nhập (thông tin user + tokens) sau khi đăng nhập thành công
 * @param {Object} sessionData Dữ liệu trả về từ AuthController
 */
export const setAuthSession = (sessionData) => {
  if (!sessionData) return;

  const accessToken = sessionData.accessToken;
  const refreshToken = sessionData.refreshToken;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

/**
 * Cập nhật Access Token mới khi refresh token thành công
 * @param {string} newAccessToken
 */
export const updateAccessToken = (newAccessToken) => {
  if (!newAccessToken) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  localStorage.setItem('accessToken', newAccessToken);

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      session.accessToken = newAccessToken;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Không thể cập nhật accessToken trong vibeflow_session:', e);
  }
};

/**
 * Lấy toàn bộ thông tin phiên làm việc hiện tại
 * @returns {Object|null}
 */
export const getCurrentSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Kiểm tra xem người dùng hiện tại đã đăng nhập chưa
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Xóa sạch thông tin phiên đăng nhập và các token
 */
export const clearAuthSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

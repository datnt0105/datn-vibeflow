import axiosClient from './axiosClient';
import { setAuthSession, clearAuthSession } from './authStorage';

/**
 * Service API Xác thực & Phân quyền dựa trên:
 * datn\src\main\java\com\example\datn\controller\AuthController.java
 */
export const authApi = {
  // =========================================================================
  // I. DÀNH CHO NHÂN VIÊN / QUẢN TRỊ (ADMIN & NHÂN VIÊN)
  // =========================================================================

  /**
   * Đăng nhập Quản Trị / Nhân Viên
   * Backend: POST /api/auth/admin/login (hoặc /api/auth/login)
   * 
   * @param {string|Object} usernameOrPayload Email hoặc object { username, password }
   * @param {string} [password] Mật khẩu (nếu tham số 1 là email)
   * @returns {Promise<Object>} Thông tin nhân viên, role, accessToken, refreshToken
   */
  loginAdmin: async (usernameOrPayload, password) => {
    const params =
      typeof usernameOrPayload === 'object' && usernameOrPayload !== null
        ? usernameOrPayload
        : { username: usernameOrPayload, password };

    // Spring Boot AuthController sử dụng @RequestParam nên gửi qua query params
    const data = await axiosClient.post('/auth/admin/login', null, { params });

    // Lưu session nếu đăng nhập thành công
    if (data?.accessToken) {
      setAuthSession(data);
    }
    return data;
  },

  /**
   * Lấy thông tin chi tiết Nhân Viên đang đăng nhập
   * Backend: GET /api/auth/admin/me
   * Token được tự động gắn bởi axiosClient Request Interceptor
   * 
   * @returns {Promise<Object>} Thông tin chi tiết của nhân viên và vai trò
   */
  getAdminProfile: () => {
    return axiosClient.get('/auth/admin/me');
  },

  // =========================================================================
  // II. DÀNH CHO KHÁCH HÀNG (CUSTOMER)
  // =========================================================================

  /**
   * Đăng nhập Khách Hàng
   * Backend: POST /api/auth/customer/login
   * 
   * @param {string|Object} usernameOrPayload Email khách hàng hoặc object { username, password }
   * @param {string} [password] Mật khẩu
   * @returns {Promise<Object>} Thông tin khách hàng, role: 'KHACH_HANG', accessToken, refreshToken
   */
  loginCustomer: async (usernameOrPayload, password) => {
    const params =
      typeof usernameOrPayload === 'object' && usernameOrPayload !== null
        ? usernameOrPayload
        : { username: usernameOrPayload, password };

    const data = await axiosClient.post('/auth/customer/login', null, { params });

    if (data?.accessToken) {
      setAuthSession(data);
    }
    return data;
  },

  /**
   * Đăng ký tài khoản Khách Hàng mới
   * Backend: POST /api/auth/customer/register
   * 
   * @param {Object} payload { email, password, hoTen, sdt }
   * @returns {Promise<Object>} { success: true, message, maKhachHang, email }
   */
  registerCustomer: ({ email, password, hoTen, sdt }) => {
    return axiosClient.post('/auth/customer/register', null, {
      params: { email, password, hoTen, sdt },
    });
  },

  /**
   * Lấy thông tin chi tiết Khách Hàng đang đăng nhập
   * Backend: GET /api/auth/customer/me
   * 
   * @returns {Promise<Object>} Thông tin chi tiết của khách hàng
   */
  getCustomerProfile: () => {
    return axiosClient.get('/auth/customer/me');
  },

  // =========================================================================
  // III. API CHUNG (DÙNG CHO CẢ 2 BÊN)
  // =========================================================================

  /**
   * Lấy thông tin người dùng hiện tại (Tự nhận diện Nhân viên hoặc Khách hàng)
   * Backend: GET /api/auth/me
   * 
   * @returns {Promise<Object>} Thông tin tài khoản tương ứng
   */
  getCurrentUser: () => {
    return axiosClient.get('/auth/me');
  },

  /**
   * Cấp lại Access Token mới bằng Refresh Token
   * Backend: POST /api/auth/refresh
   * 
   * @param {string} refreshToken
   * @returns {Promise<Object>} { success: true, accessToken: "..." }
   */
  refreshToken: (refreshToken) => {
    return axiosClient.post('/auth/refresh', null, {
      params: { refreshToken },
    });
  },

  /**
   * Đăng xuất khỏi hệ thống: Xóa session và token khỏi localStorage
   */
  logout: () => {
    clearAuthSession();
    return Promise.resolve({ success: true, message: 'Đã đăng xuất thành công!' });
  },
};

export default authApi;

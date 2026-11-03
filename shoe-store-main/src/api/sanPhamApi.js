import axiosClient from './axiosClient';

/**
 * API Quản Lý Sản Phẩm
 * Base: /api/san-pham (proxy Vite → localhost:8080)
 */
export const sanPhamApi = {
  // Lấy tất cả sản phẩm
  getAll: (params) => axiosClient.get('/san-pham', { params }),

  // Tìm kiếm theo từ khóa
  search: (q) => axiosClient.get('/san-pham/search', { params: { q } }),

  // Chi tiết theo id
  getById: (id) => axiosClient.get(`/san-pham/${id}`),

  // Thêm mới — chỉ ADMIN
  create: (data) => axiosClient.post('/san-pham', data),

  // Cập nhật — chỉ ADMIN
  update: (id, data) => axiosClient.put(`/san-pham/${id}`, data),

  // Xóa mềm — chỉ ADMIN
  delete: (id) => axiosClient.delete(`/san-pham/${id}`),
  updateStatus: (id, trangThai) =>
      axiosClient.patch(`/san-pham/${id}/trang-thai`, { trangThai }),
};

export default sanPhamApi;

import axiosClient from './axiosClient';

/**
 * Service API Quản lý khách hàng dựa trên:
 * datn\src\main\java\com\example\datn\controller\KhachHangController.java
 * FE route: /admin/khach-hang — API: /api/admin/khach-hang (baseURL '/api' đã có sẵn trong axiosClient)
 */
export const khachHangApi = {
  /**
   * Danh sách + tìm kiếm + phân trang
   * @param {{ q?: string, gioiTinh?: boolean, trangThai?: boolean, page?: number, size?: number }} params
   * @returns {Promise<{ content: Array, page: number, size: number, totalElements: number, totalPages: number }>}
   */
  search(params) {
    return axiosClient.get('/khach-hang', { params });
  },

  /** KPI: { tong, hoatDong, daKhoa, moiTrongThang } */
  thongKe() {
    return axiosClient.get('/khach-hang/thong-ke');
  },

  /** Thêm khách hàng — mật khẩu mặc định "1" do BE đặt */
  create(data) {
    return axiosClient.post('/khach-hang', data);
  },

  /** Cập nhật thông tin — không đổi trạng thái */
  update(id, data) {
    return axiosClient.put(`/khach-hang/${id}`, data);
  },

  /** Khóa / mở khóa — chỉ ADMIN */
  updateTrangThai(id, trangThai) {
    return axiosClient.patch(`/khach-hang/${id}/trang-thai`, { trangThai });
  },
};

export default khachHangApi;

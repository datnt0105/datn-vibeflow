import axiosClient from './axiosClient';

/**
 * Service API Quản lý nhân viên (chỉ ADMIN) dựa trên:
 * datn\src\main\java\com\example\datn\controller\NhanVienController.java
 * FE route: /admin/nhan-vien — API: /api/admin/nhan-vien, /api/admin/vai-tro
 */
export const nhanVienApi = {
  /**
   * Danh sách + tìm kiếm + phân trang
   * @param {{ q?: string, vaiTroId?: number, trangThai?: boolean, page?: number, size?: number }} params
   */
  search(params) {
    return axiosClient.get('/nhan-vien', { params });
  },

  /** KPI: { tong, hoatDong, daKhoa, quanTriVien } */
  thongKe() {
    return axiosClient.get('/nhan-vien/thong-ke');
  },

  /** Vai trò gán được cho nhân viên (không có KHACH_HANG): [{ id, maVaiTro, tenVaiTro }] */
  vaiTro() {
    return axiosClient.get('/nhan-vien/vai-tro');
  },

  /** Thêm nhân viên — mật khẩu mặc định "1" do BE đặt */
  create(data) {
    return axiosClient.post('/nhan-vien', data);
  },

  update(id, data) {
    return axiosClient.put(`/nhan-vien/${id}`, data);
  },

  updateTrangThai(id, trangThai) {
    return axiosClient.patch(`/nhan-vien/${id}/trang-thai`, { trangThai });
  },

  /** Đặt lại mật khẩu về "1" */
  resetMatKhau(id) {
    return axiosClient.post(`/nhan-vien/${id}/reset-mat-khau`);
  },
};

export default nhanVienApi;

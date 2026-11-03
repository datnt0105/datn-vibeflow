import axiosClient from './axiosClient';

const chiTietSanPhamApi = {
    getBySanPham: (sanPhamId) => axiosClient.get(`/chi-tiet-san-pham/san-pham/${sanPhamId}`),
    // create, update, delete: bạn bổ sung sau
    createBulk: (data) => axiosClient.post('/chi-tiet-san-pham/bulk', data),
    update: (id, data) => axiosClient.put(`/chi-tiet-san-pham/${id}`, data),
    delete: (id) => axiosClient.delete(`/chi-tiet-san-pham/${id}`),
};

export default chiTietSanPhamApi;
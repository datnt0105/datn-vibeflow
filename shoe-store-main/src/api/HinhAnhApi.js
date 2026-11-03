import axiosClient from './axiosClient'; // chỉnh lại đường dẫn theo project của bạn

const hinhAnhApi = {
    getBySanPham: (sanPhamId) => axiosClient.get(`/hinh-anh/san-pham/${sanPhamId}`),

    upload: (sanPhamId, files) => {
        const fd = new FormData();
        fd.append('sanPhamId', sanPhamId);
        files.forEach((f) => fd.append('files', f));
        return axiosClient.post('/hinh-anh/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    setAnhChinh: (id) => axiosClient.put(`/hinh-anh/${id}/anh-chinh`),
    delete: (id) => axiosClient.delete(`/hinh-anh/${id}`),
};

export default hinhAnhApi;
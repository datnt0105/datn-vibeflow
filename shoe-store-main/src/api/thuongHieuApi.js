

import axiosClient from './axiosClient';

/**
 * API Quản Lý Sản Phẩm
 * Base: /api/san-pham (proxy Vite → localhost:8080)
 */
export const thuongHieuApi = {
    // Lấy tất cả sản phẩm
    getAll: () => axiosClient.get('/thuong-hieu'),


};

export default thuongHieuApi;

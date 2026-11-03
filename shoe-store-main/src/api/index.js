// Barrel export cho thư mục api
import axiosClient from './axiosClient';
import authApi from './authApi';
import sanPhamApi from './sanPhamApi';

export * from './authStorage';
export { axiosClient, authApi, sanPhamApi };

export default axiosClient;

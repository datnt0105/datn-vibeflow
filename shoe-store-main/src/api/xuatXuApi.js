import axiosClient from './axiosClient';
const xuatXuApi = { getAll: () => axiosClient.get('/xuat-xu') };
export default xuatXuApi;
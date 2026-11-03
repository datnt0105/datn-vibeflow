import axiosClient from './axiosClient';
const danhMucApi = { getAll: () => axiosClient.get('/danh-muc') };
export default danhMucApi;
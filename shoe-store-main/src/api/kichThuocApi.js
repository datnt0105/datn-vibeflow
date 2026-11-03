import axiosClient from './axiosClient';
const kichThuocApi = { getAll: () => axiosClient.get('/kich-thuoc') };
export default kichThuocApi;
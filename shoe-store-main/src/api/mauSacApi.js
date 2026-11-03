import axiosClient from './axiosClient';
const mauSacApi = { getAll: () => axiosClient.get('/mau-sac') };
export default mauSacApi;

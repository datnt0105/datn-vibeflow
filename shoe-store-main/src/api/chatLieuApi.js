// api/chatLieuApi.js
import axiosClient from './axiosClient'; // chỉnh lại đường dẫn theo project của bạn

const chatLieuApi = {
    // Danh sách chất liệu đang hoạt động (dùng cho select, chip)
    getAll: () => axiosClient.get('/chat-lieu'),

    getById: (id) => axiosClient.get(`/chat-lieu/${id}`),

    // data: { maChatLieu, tenChatLieu, moTa }
    create: (data) => axiosClient.post('/chat-lieu', data),

    update: (id, data) => axiosClient.put(`/chat-lieu/${id}`, data),

    // Xóa mềm
    delete: (id) => axiosClient.delete(`/chat-lieu/${id}`),
};

export default chatLieuApi;
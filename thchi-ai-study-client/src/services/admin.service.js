import axios from "axios";
import api from "../lib/axios";

const adminService = {
  getUsers: async (params) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },
  getUserDetail: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (payload) => {
    const response = await api.post("/admin/users", payload);
    return response.data;
  },
  updateUserStatus: async (id, status) => {
    const response = await api.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  },
  getTransactions: async (params) => {
    const response = await api.get("/admin/transactions", { params });
    return response.data;
  },
  // Posts
  getPosts: async (params) => {
    const response = await api.get("/admin/posts", { params });
    return response.data;
  },
  deletePost: async (id) => {
    const response = await api.delete(`/admin/posts/${id}`);
    return response.data;
  },
  updatePostStatus: async (id, status) => {
    const response = await api.patch(`/admin/posts/${id}/status`, { status });
    return response.data;
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },
  getTopCourses: async () => {
    const response = await api.get("/admin/top-courses");
    return response.data;
  },
  getLatestTransactions: async () => {
    const response = await api.get("/admin/transaction-latest");
    return response.data;
  },
  getMonthlyRevenue: async () => {
    const response = await api.get("/admin/monthly-revenue");
    return response.data;
  },
  getTopTopics: async () => {
    const response = await api.get("/admin/top-topics");
    return response.data;
  },
  // Topics
  createTopic: async ({ data, courseId }) => {
    const response = await api.post(`/topic`, { ...data, courseId });
    return response.data;
  },
  // Topic Word
  getTopicWordById: async (topicId) => {
    const response = await api.get(`/topic-word/${topicId}/admin`);
    return response.data;
  },
  createTopicWord: async ({ topicId, data }) => {
    const response = await api.post(`/topic-word/${topicId}/words`, data);
    return response.data;
  },
  updateWordInTopicWord: async ({ topicId, wordId, data }) => {
    const response = await api.patch(
      `/topic-word/${topicId}/words/${wordId}`,
      data,
    );
    return response.data;
  },
  deleteTopicWord: async ({ topicId, wordId }) => {
    const response = await api.delete(`/topic-word/${topicId}/words/${wordId}`);
    return response.data;
  },
  // Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/upload/image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      },
    );
    return response.data; // { url, publicId }
  },
  uploadAudio: async (file) => {
    const formData = new FormData();
    formData.append("audio", file);
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/upload/audio`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      },
    );
    return response.data; // { url, publicId }
  },
  // AI
  generateVocabularyAI: async ({ topic, level, quantity }) => {
    const response = await api.post("/ai/topic/word/ai-generate", {
      topic,
      level,
      quantity,
    });
    return response.data;
  },

  // ── RankTierConfig ─────────────────────────────────────────────────────────
  getRankTierConfigs: async () => {
    const response = await api.get("/admin/rank-tier-configs");
    return response.data;
  },
  createRankTierConfig: async (payload) => {
    const response = await api.post("/admin/rank-tier-configs", payload);
    return response.data;
  },
  updateRankTierConfig: async (id, payload) => {
    const response = await api.patch(`/admin/rank-tier-configs/${id}`, payload);
    return response.data;
  },
  deleteRankTierConfig: async (id) => {
    const response = await api.delete(`/admin/rank-tier-configs/${id}`);
    return response.data;
  },
};

export default adminService;

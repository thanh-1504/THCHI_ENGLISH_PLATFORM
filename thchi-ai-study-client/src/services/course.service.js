import api from "../lib/axios";

const courseService = {
  // ── Admin Courses ─────────────────────────────────────────────────────────
  getAdminCourses: async (params) => {
    const response = await api.get("/admin/courses", { params });
    return response.data;
  },

  getAdminCourseDetail: async (id) => {
    const response = await api.get(`/admin/courses/${id}`);
    return response.data;
  },

  getAdminCourseTopics: async (id, params) => {
    const response = await api.get(`/admin/courses/${id}/topics`, { params });
    return response.data;
  },

  createCourse: async (data) => {
    const response = await api.post("/admin/courses", data);
    return response.data;
  },

  updateCourse: async (id, data) => {
    const response = await api.patch(`/admin/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // ── Image Upload ──────────────────────────────────────────────────────────
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteImage: async (publicId) => {
    const response = await api.delete("/upload/image", {
      data: { publicId },
    });
    return response.data;
  },

  uploadAudio: async (file) => {
    const formData = new FormData();
    formData.append("audio", file);
    const response = await api.post("/upload/audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ── Admin Topics ──────────────────────────────────────────────────────────
  createTopic: async ({ courseId, data }) => {
    const response = await api.post(`/admin/course/${courseId}/topic`, data);
    return response.data;
  },

  updateTopic: async (id, data) => {
    const response = await api.patch(`/topic/${id}`, data);
    return response.data;
  },

  deleteTopic: async (id) => {
    const response = await api.delete(`/topic/${id}`);
    return response.data;
  },

  getTopicWords: async (topicId) => {
    const response = await api.get(`/topic-word/${topicId}/admin`);
    return response.data;
  },

  addTopicWord: async (topicId, wordData) => {
    const response = await api.post(`/topic-word/${topicId}/words`, wordData);
    return response.data;
  },

  removeTopicWord: async (topicId, wordId) => {
    const response = await api.delete(`/topic-word/${topicId}/words/${wordId}`);
    return response.data;
  },
};

export default courseService;

import api from "../lib/axios";

const postService = {
  getPosts: async () => {
    const response = await api.get("/posts");
    return response.data;
  },

  getMyPosts: async () => {
    const response = await api.get("/posts/my");
    return response.data;
  },

  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (data) => {
    const response = await api.post("/posts", data);
    return response.data;
  },

  updatePost: async (id, data) => {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  reviewPost: async (id, data) => {
    const response = await api.patch(`/posts/${id}/review`, data);
    return response.data;
  },

  likePost: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  createCommentOnPost: async (id, data) => {
    const response = await api.post(`/posts/${id}/comment`, data);
    return response.data;
  },

  updateCommentOnPost: async (id, data) => {
    const response = await api.patch(`/posts/comment/${id}`, data);
    return response.data;
  },

  deleteCommentOnPost: async (id) => {
    const response = await api.delete(`/posts/comment/${id}`);
    return response.data;
  },
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
};

export default postService;

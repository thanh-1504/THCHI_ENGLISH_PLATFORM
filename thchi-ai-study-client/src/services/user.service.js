import api from "../lib/axios";

const userService = {
  getMyStreak: async () => {
    const response = await api.get("/user/my-streak");
    return response.data;
  },
  getMyStreakGoalStatus: async () => {
    const response = await api.get("/user/my-streak-goal-status");
    return response.data;
  },
  createStreakGoal: async (configId) => {
    const response = await api.post("/user/streak-goal", { configId });
    return response.data;
  },
  getStreakGoalConfigs: async () => {
    const response = await api.get("/user/streak-goal-configs");
    return response.data;
  },
  update: async (data) => {
    const response = await api.patch("/user", data);
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
    const response = await api.delete("/upload/image", { data: { publicId } });
    return response.data;
  },
};

export default userService;

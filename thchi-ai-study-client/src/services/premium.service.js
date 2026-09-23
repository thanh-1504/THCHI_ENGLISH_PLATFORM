import api from "../lib/axios";

const premiumService = {
  getAllPlans: async (page = 1, limit = 10) => {
    const response = await api.get(`/premium?page=${page}&limit=${limit}`);
    return response.data;
  },

  createPremiumPlan: async (payload) => {
    const response = await api.post("/premium", payload);
    return response.data;
  },

  updatePremiumPlan: async (id, payload) => {
    const response = await api.patch(`/premium/${id}`, payload);
    return response.data;
  },

  togglePlanStatus: async (id) => {
    const response = await api.patch(`/premium/${id}/status`);
    return response.data;
  },

  createPaymentUrl: async (payload) => {
    const response = await api.post("/vnpay/create-payment", payload);
    return response.data; 
  },
};

export default premiumService;

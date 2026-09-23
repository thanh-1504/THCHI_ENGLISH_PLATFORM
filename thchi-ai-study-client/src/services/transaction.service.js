import api from "../lib/axios";

const transactionService = {
  create: async (payload) => {
    const response = await api.post("/transaction", payload);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/transaction/history");
    return response.data;
  },

  getDetail: async (id) => {
    const response = await api.get(`/transaction/${id}`);
    return response.data;
  },
};

export default transactionService;

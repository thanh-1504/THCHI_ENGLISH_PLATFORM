import api from "../lib/axios";

const reviewService = {
  createReviewSession: async () => {
    const response = await api.post("/review-session");
    return response.data;
  },

  getReviewSessionById: async (id) => {
    const response = await api.get(`/review-session/${id}`);
    return response.data;
  },

  createReviewSessionLog: async (reviewSessionId, createReviewSessionLog) => {
    const response = await api.post(
      `/review-session/${reviewSessionId}/log`,
      createReviewSessionLog,
    );
    return response.data;
  },

  complete: async (sessionId, payload) => {
    const response = await api.post(
      `/review-session/${sessionId}/complete`,
      payload,
    );
    return response.data;
  },
};

export default reviewService;

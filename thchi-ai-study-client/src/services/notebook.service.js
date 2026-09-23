import api from "../lib/axios";

const notebookService = {
  getNotebook: async () => {
    const response = await api.get("/notebook");
    return response.data;
  },

  getNotebookByStatus: async (status) => {
    const response = await api.get(`/notebook/word-status/${status}`);
    return response.data;
  },

  searchWord: async (word) => {
    const response = await api.get(`/notebook/search`, { params: { word } });
    return response.data;
  },

  getWordsDue: async () => {
    const response = await api.get("/notebook/words-due");
    return response.data;
  },

  getNextReviewAt: async () => {
    const response = await api.get("/notebook/next-review-at");
    return response.data;
  },

  getLevelStats: async () => {
    const response = await api.get("/notebook/level-stats");
    return response.data;
  },

  saveWords: async (wordIds) => {
    if (!wordIds || wordIds.length === 0) return { saved: 0 };
    const response = await api.post("/notebook/entries", { wordIds });
    return response.data;
  },

  updateWordsStatus: async (payload) => {
    const response = await api.post("/notebook/entries/update", payload);
    return response.data;
  },

  deleteWord: async (wordId) => {
    const response = await api.delete(`/notebook/entries/${wordId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/notebook/stats");
    return response.data;
  },
};

export default notebookService;

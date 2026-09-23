import api from "../lib/axios";

const aiService = {
  chat: async (message, historyChat = []) => {
    const response = await api.post("/ai/chat", { message, historyChat });
    return response.data.reply;
  },

  generateSentence: async (payload) => {
    const response = await api.post("/ai/generate-sentence", payload);
    return response.data;
  },
  generateSentenceFromNotebook: async (payload) => {
    const response = await api.post("/ai/generate-sentence-notebook", payload);
    return response.data;
  },
  generateSpeakingSentence: async (payload) => {
    const response = await api.post("/ai/generate-speaking-sentence", payload);
    return response.data;
  },
  generateSpeakingSentenceFromNotebook: async (payload) => {
    const response = await api.post("/ai/generate-speaking-sentence-notebook", payload);
    return response.data;
  },
  generateQuizlet: async (payload) => {
    const response = await api.post("/ai/generate-quizlet", payload);
    return response.data;
  },
  getRandomNotebookWords: async () => {
    const response = await api.get("/notebook/random-words");
    return response.data;
  },
  gradeWriting: async (payload) => {
    const response = await api.post("/ai/grade-writing", payload);
    return response.data;
  },
  gradeSpeaking: async (payload) => {
    const response = await api.post("/ai/grade-speaking", payload);
    return response.data;
  },
  getPracticeUsage: async () => {
    const response = await api.get("/ai/practice-usage");
    return response.data;
  },
  completeQuizlet: async () => {
    const response = await api.post("/ai/complete-quizlet");
    return response.data;
  },
};

export default aiService;

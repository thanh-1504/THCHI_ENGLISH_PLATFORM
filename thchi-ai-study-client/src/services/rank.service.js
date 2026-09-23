import api from "../lib/axios";

const rankService = {
  getLeaderboard: async () => {
    try {
      const response = await api.get("/rank/leaderboard");
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  addXp: async (xp) => {
    const response = await api.post("/rank/add-xp", { xp });
    return response.data;
  },
};

export default rankService;

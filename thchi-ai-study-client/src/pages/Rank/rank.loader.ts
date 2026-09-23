import rankService from "../../services/rank.service";

export const rankLoader = {
  getLeaderboard: () => {
    return rankService.getLeaderboard();
  },
};

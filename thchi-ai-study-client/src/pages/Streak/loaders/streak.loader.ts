import userService from "../../../services/user.service";

export const streakLoader = {
  getMyStreak: () => {
    return userService.getMyStreak();
  },
};

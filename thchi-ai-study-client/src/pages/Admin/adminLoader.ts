import adminService from "../../services/admin.service";

export const adminLoader = {
  getTopicWordById: (topicId: string) => {
    if (topicId) {
      return adminService.getTopicWordById(topicId);
    }
    return null;
  },
};

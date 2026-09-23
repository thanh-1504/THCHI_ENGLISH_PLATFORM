import learnServices from "../../services/learn.service";

export const learnLoader = {
  getCourses: () => {
    return learnServices.getCourses();
  },
  getCourse: (id: string) => {
    return learnServices.getCourse(id);
  },
  getTopicIncludeWord: (topicId: string) => {
    return learnServices.getTopicIncludeWord(topicId);
  },
};

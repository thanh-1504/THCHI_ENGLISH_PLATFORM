import { create } from "zustand";
const useTopicStore = create((get, set) => ({
  topicInfo: {
    name: "",
    subtitle: "",
    thumbnailFile: null,
    thumbnailImage: "",
  },
  wordList: [],
  addWord: () =>
    set((state) => ({
      wordList: [
        ...state.wordList,
        {
          id: Date.now().toString(),
          word: "",
          phonestic: "",
          wordType: "",
          meaning: "",
          example: "",
          audioFile: null,
          imageFile: null,
          imagePreview: "",
          level: "",
        },
      ],
    })),
  updateWord: (id, field, value) =>
    set((state) => ({
      wordList: state.wordList.map((word) =>
        word.id === id ? { ...word, [field]: value } : word,
      ),
    })),
  getFormData: () => get(),
}));
export default useTopicStore;

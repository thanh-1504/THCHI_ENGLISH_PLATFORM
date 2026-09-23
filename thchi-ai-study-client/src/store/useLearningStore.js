import { create } from "zustand";

const useLearningStore = create((set) => ({
  currentIndex: 0,
  setCurrentIndex: (value) => set({ currentIndex: value }),
  wordsToReview: [],
  setWordsToReview: (words) => set({ wordsToReview: words }),
  addWordToReview: (word) =>
    set((state) => {
      const index = state.wordsToReview.findIndex((w) => w.id === word.id);

      if (index !== -1) {
        const next = [...state.wordsToReview];

        next[index] = {
          ...next[index],
          wrongCount: next[index].wrongCount + 1,
        };

        return {
          wordsToReview: next,
        };
      }

      return {
        wordsToReview: [
          ...state.wordsToReview,
          {
            ...word,
            wrongCount: 1,
          },
        ],
      };
    }),
  clearWordsToReview: () => set({ wordsToReview: [] }),
}));
export default useLearningStore;

import { create } from "zustand";

const useNotebookStore = create((set) => ({
  inputValue: "",
  hasSearch: false,
  notebookActive: false,
  isActiveLevel: 1,
  selectedWords: [],
  words: [],
  setWords: (newWords) => set({ words: newWords }),
  removeWords: (wordIdsToRemove) =>
    set((state) => ({
      words: state.words.filter((word) => !wordIdsToRemove.includes(word.id)),
    })),
  setInputValue: (value) => set({ inputValue: value }),
  setHasSearch: (value) => set({ hasSearch: value }),
  clearSelectedWords: () => set({ selectedWords: [] }),
  setIsActiveLevel: (value) => set({ isActiveLevel: value }),
  toggleWordSelection: (wordId) =>
    set((state) => {
      const selectedWords = state.selectedWords || [];
      const alreadySelected = selectedWords.includes(wordId);
      if (alreadySelected) {
        return {
          selectedWords: selectedWords.filter((id) => id !== wordId),
        };
      } else {
        return {
          selectedWords: [...selectedWords, wordId],
        };
      }
    }),
}));
export default useNotebookStore;

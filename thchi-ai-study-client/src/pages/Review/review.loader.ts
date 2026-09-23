import notebookService from "../../services/notebook.service";

export const reviewLoader = async () => {
  const notebook = await notebookService.getNotebook();
  if (!notebook)
    return {
      isNotebookEmpty: true,
      wordsDue: [],
      nextReviewAt: null,
    };
  const [wordsDue, nextReviewData, levelStats] = await Promise.all([
    notebookService.getWordsDue(),
    notebookService.getNextReviewAt(),
    notebookService.getLevelStats(),
  ]);
  return {
    isNotebookEmpty: false,
    wordsDue,
    nextReviewAt: nextReviewData?.nextReviewAt ?? null,
    upcomingCount: nextReviewData?.upcomingCount ?? 0,
    levelStats: levelStats ?? {},
  };
};

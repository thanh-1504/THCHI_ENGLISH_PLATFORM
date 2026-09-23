export const buildLearningStep = (words: []) => {
  return words.flatMap((word) => {
    return [
      { type: "FLASHCARD", word },
      { type: "FILL_IN_BLANK", word },
      { type: "LISTEN_AND_TYPE", word },
    ];
  });
};

export const buildReviewStep = (wordsDue: []) => {
  const steps = [
    "LISTEN_AND_TYPE",
    "FILL_IN_BLANK",
    "LISTEN_CHOOSE_ANSWER",
    "CHOOSE_MEANING",
  ];

  return wordsDue.map((word) => {
    const randomStep = steps[Math.floor(Math.random() * steps.length)];
    return {
      word,
      type: randomStep,
    };
  });
};

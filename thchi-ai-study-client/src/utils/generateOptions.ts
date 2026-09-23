const generateOptions = (currentWord: any, allWords: any[]) => {
  const correctMeaning = currentWord.definitions[0]?.meaning;
  const otherWords = allWords.filter((w) => w.id !== currentWord.id);
  const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
  const incorrectOptions = shuffledOthers
    .slice(0, 2)
    .map((w) => w.definitions[0]?.meaning);
  return [correctMeaning, ...incorrectOptions].sort(() => 0.5 - Math.random());
};
export default generateOptions;

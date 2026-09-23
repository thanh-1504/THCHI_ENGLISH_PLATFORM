const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500 border-emerald-100";
  if (score >= 50) return "text-amber-500 border-amber-100";
  return "text-red-500 border-red-100";
};

const getWordScoreColor = (score: number) => {
  if (score >= 80) return "bg-[#e6f9ed] text-emerald-700 border-emerald-100";
  if (score >= 50) return "bg-yellow-50 text-yellow-700 border-yellow-100";
  return "bg-[#ffeced] text-red-600 border-red-100";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Tốt";
  if (score >= 50) return "Khá";
  return "Sai";
};

const playWordSound = (word: string) => {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
};
export { getScoreColor, getScoreLabel, getWordScoreColor, playWordSound };

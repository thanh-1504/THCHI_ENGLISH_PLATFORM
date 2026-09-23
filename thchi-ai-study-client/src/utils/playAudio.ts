const playAudio = (word: any) => {
  if (!word) return;
  if (word.audioUrl) {
    const audio = new Audio(word.audioUrl);
    return audio.play();
  }
  const utterance = new SpeechSynthesisUtterance(word.term);
  utterance.lang = "en-US"; 
  utterance.rate = 0.9; 
  window.speechSynthesis.speak(utterance);
};
export default playAudio;

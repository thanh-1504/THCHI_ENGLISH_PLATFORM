import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ListenChooseAnswer = ({
  word,
  options = [],
  onAnswerChange,
  disabled,
}) => {
  const [selectedOption, setSelectedOption] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    if (word?.audioUrl) {
      playAudio();
    }
  }, [word]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.log("Lỗi phát audio:", err));
    } else if (!word?.audioUrl) {
      const utterance = new SpeechSynthesisUtterance(word?.term);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelect = (option) => {
    if (disabled) return;
    setSelectedOption(option);
    onAnswerChange(option);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-fade-in">
      {word?.audioUrl && <audio ref={audioRef} src={word.audioUrl} />}

      {/* Tiêu đề */}
      <h3 className="text-gray-500 font-medium text-lg mb-8">
        Nghe và chọn đáp án đúng
      </h3>

      {/* Nút Loa phát âm */}
      <button
        onClick={playAudio}
        type="button"
        className="w-24 h-24 mb-10 bg-white rounded-full flex items-center justify-center shadow-[0_4px_14px_0_rgba(0,0,0,0.08)] border border-gray-100 hover:scale-105 active:scale-95 transition-transform"
      >
        <Volume2
          size={40}
          className="text-yellow-400 ml-1"
          fill="currentColor"
        />
      </button>

      {/* Danh sách đáp án tiếng Việt */}
      <div className="w-full space-y-4">
        {options.map((option, index) => {
          const isSelected = selectedOption === option;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={`w-full py-4 px-6 rounded-2xl text-center text-lg font-medium transition-all duration-200 border-2
                ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-50 text-gray-800"
                    : "border-gray-100 bg-white text-gray-700 shadow-sm hover:border-gray-200"
                }
                ${disabled && !isSelected ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ListenChooseAnswer;

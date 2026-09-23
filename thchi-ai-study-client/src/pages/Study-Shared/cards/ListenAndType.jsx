import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import playAudio from "../../../utils/playAudio";

const ListendAndType = ({ word, onNext, onAnswerChange }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    playAudio(word);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [word]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onAnswerChange(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-4 my-4 items-center">
      <span className="text-gray-500 font-medium">Nghe và viết lại</span>

      {/* Audio Button */}
      <div>
        <button
          onClick={() => playAudio(word)}
          className="
            w-14 h-14
            rounded-full
            bg-white
            flex items-center justify-center
            border border-gray-100
            shadow-[0_4px_10px_rgba(0,0,0,0.08)]
            active:translate-y-[3px]
            active:shadow-none
            transition-all
            duration-150
            cursor-pointer
          "
        >
          <Volume2 size={28} className="text-yellow-400" strokeWidth={2.5} />
        </button>
      </div>

      {/* Input */}
      <div className="w-full">
        <input
          autoFocus
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Gõ lại từ bạn nghe được..."
          className="
            border-2 border-gray-100 rounded-lg p-4 bg-white outline-none
            focus:border-2
            focus:border-green-600
            transition-all
            duration-150
            w-full
            text-center
            text-lg
            font-medium
            text-gray-800
          "
        />
      </div>
    </div>
  );
};

export default ListendAndType;

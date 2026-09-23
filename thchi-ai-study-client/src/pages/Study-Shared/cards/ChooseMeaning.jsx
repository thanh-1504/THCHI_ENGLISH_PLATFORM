import { useState } from "react";
import Highlighter from "react-highlight-words";

const ChooseMeaning = ({ word, options = [], onAnswerChange, disabled }) => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleSelect = (option) => {
    if (disabled) return;
    setSelectedOption(option);
    onAnswerChange(option);
  };

  const exampleSentence =
    word?.examples?.[0]?.sentence || "Không có câu ví dụ cho từ này.";

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-fade-in">
      {/* Tiêu đề */}
      <h3 className="text-gray-500 font-medium text-lg mb-6">
        Chọn nghĩa của từ được gạch chân
      </h3>

      {/* Khung chứa câu ví dụ */}
      <div className="w-full py-6 px-4 mb-8 bg-white rounded-2xl border border-green-500 text-center text-lg text-gray-800 shadow-sm">
        <Highlighter
          highlightClassName="underline font-bold bg-transparent text-gray-800"
          searchWords={[word?.term || ""]}
          autoEscape={true}
          textToHighlight={exampleSentence}
        />
      </div>

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

export default ChooseMeaning;

import { useEffect, useRef, useState } from "react";

const FillInTheBlank = ({ word, onNext, onAnswerChange }) => {
  const definition = word?.definitions?.[0]
    ? `${word.definitions[0].meaning} (${word.definitions[0].wordType.toLowerCase()})`
    : "";

  const letters = word?.term?.split("") ?? [];

  const hints = new Set(
    letters.map((_, i) => i).filter((_, rank) => rank !== 0 && rank % 3 === 2),
  );

  const [values, setValues] = useState(letters.map(() => ""));
  const inputRefs = useRef([]);

  useEffect(() => {
    setValues(letters.map(() => ""));
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  }, [word?.term]);

  const handleChange = (index, e) => {
    const char = e.target.value.slice(-1);
    const next = [...values];
    next[index] = char;
    setValues(next);

    const answer = next.join("");
    onAnswerChange(answer);

    if (char && index < letters.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // const handleCheck = () => {
  //   const answer = values.join("");
  //   if (answer.toLowerCase() === word.term.toLowerCase()) {
  //     onNext();
  //   } else {
  //     alert("Sai rồi, thử lại!");
  //   }
  // };

  return (
    <div className="flex flex-col items-center gap-4 my-4 animate-fade-in">
      <span className="text-gray-400 text-sm tracking-wide">Điền từ</span>

      <p className="text-xl sm:text-2xl font-semibold text-gray-800 text-center px-4">
        {definition}
      </p>

      <div className="flex items-end gap-[6px] border-2 border-[#6fcf97] rounded-2xl px-4 sm:px-6 py-4 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] w-full max-w-sm justify-center flex-wrap">
        {letters.map((letter, index) => {
          const isHint = hints.has(index);

          return (
            <div key={index} className="flex flex-col items-center gap-[2px]">
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={2}
                value={values[index]}
                placeholder={isHint ? letter : ""} 
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-[22px] h-[26px] text-center text-[18px] font-medium text-gray-700 bg-transparent border-none outline-none p-0 leading-none caret-green-500 
                  ${isHint ? "placeholder:text-gray-400 placeholder:opacity-60" : ""}
                `}
              />
              <div className="h-[2.5px] w-[20px] rounded-full transition-colors bg-gray-300" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FillInTheBlank;

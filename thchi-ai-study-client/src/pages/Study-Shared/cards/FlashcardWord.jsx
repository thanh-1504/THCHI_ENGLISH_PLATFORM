import { Pointer, Volume2 } from "lucide-react";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import playAudio from "../../../utils/playAudio";

const FlashcardWord = ({ word }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { term, definitions, examples, phonetic } = word;
  return (
    <div className="relative mt-12 mb-8">
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => playAudio(word)}
          className="
            w-14 h-14
            rounded-full
            bg-white
            flex items-center justify-center
            border border-gray-100
            shadow-[0_4px_10px_rgba(0,0,0,0.08)]
            active:translate-y-0.75
            active:shadow-none
            transition-all
            duration-150
            cursor-pointer
          "
        >
          <Volume2 size={28} className="text-yellow-400" strokeWidth={2.5} />
        </button>
      </div>

      {/* Card container: perspective + preserve-3d + rotate khi flip */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`
          relative
          cursor-pointer
          min-h-72 sm:min-h-90
          perspective-[1000px]
          [transform-style:preserve-3d]
          transition-transform
          duration-500
          ${isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"}
        `}
      >
        {/* ===== FRONT ===== */}
        <div
          className="
            absolute inset-0
            bg-white
            rounded-xl
            shadow-[0_8px_30px_rgba(0,0,0,0.05)]
            flex flex-col items-center
            px-8 pt-10 pb-8
            backface-hidden
          "
        >
          <img
            src={
              word?.imageUrl ??
              "https://images.unsplash.com/photo-1455390582262-044cdead277a"
            }
            alt="Examination"
            className="w-full max-w-[300px] h-[160px] sm:h-[220px] object-cover rounded-2xl select-none"
          />

          <div className="mt-5 text-center max-w-72">
            <p className="text-xl leading-relaxed text-gray-800">
              <Highlighter
                highlightClassName="underline font-bold bg-transparent text-gray-800"
                searchWords={[word?.term || ""]}
                textToHighlight={examples[0]?.sentence ?? ""}
              />
            </p>
          </div>

          <div className="absolute bottom-4 right-5 opacity-50">
            <Pointer size={36} className="text-[#F1C27D]" fill="#F1C27D" />
          </div>
        </div>

        {/* ===== BACK ===== */}
        <div
          className="
            absolute inset-0
            bg-white
            rounded-xl
            shadow-[0_8px_30px_rgba(0,0,0,0.05)]
            flex flex-col items-center justify-center gap-2
            px-8
            backface-hidden
            [transform:rotateY(180deg)]
          "
        >
          <p className="text-3xl font-bold text-gray-800">{term}</p>
          <p className="text-gray-400 text-lg">{phonetic}</p>
          <p className="text-xl text-gray-600 mt-1">
            {definitions[0].meaning} ({definitions[0].wordType})
          </p>

          <div className="absolute bottom-4 right-5 opacity-50">
            <Pointer size={36} className="text-[#F1C27D]" fill="#F1C27D" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardWord;

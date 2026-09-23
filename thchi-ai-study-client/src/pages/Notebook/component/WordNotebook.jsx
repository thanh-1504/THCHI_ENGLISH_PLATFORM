import { Check } from "lucide-react";
import useNotebookStore from "../../../store/useNotebookStore";

const WordNotebook = ({ word }) => {
  const { toggleWordSelection, selectedWords } = useNotebookStore();
  const isPendingChange = selectedWords.includes(word.id);
  const isOriginallyActive = word.status === "ACTIVE";
  const isChecked = isOriginallyActive ? !isPendingChange : isPendingChange;

  return (
    <div className="flex items-start gap-x-3 py-3.5 sm:py-3">
      <button
        type="button"
        onClick={() => toggleWordSelection(word.id)}
        className={`
          w-8 h-8 rounded-full shrink-0 mt-0.5
          flex items-center justify-center
          transition-all duration-200 hover:cursor-pointer
          ${isChecked ? "bg-text-green" : "border-2 border-gray-300 bg-white"}
        `}
      >
        {isChecked && (
          <Check size={16} strokeWidth={3} className="text-white" />
        )}
      </button>

      <div className="flex-1 min-w-0 flex items-start justify-between gap-x-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-x-1 flex-wrap">
            <span className="font-bold text-gray-900 text-base leading-tight">
              {word.term ?? ""}
            </span>
            {word?.definitions[0]?.wordType && (
              <span className="text-gray-900 text-base font-normal">
                ({word.definitions[0].wordType})
              </span>
            )}
          </div>
          {word.phonetic && (
            <p className="text-text-green text-sm mt-0.5 leading-tight">
              {word.phonetic}
            </p>
          )}
        </div>

        <div className="text-right text-gray-900 text-sm sm:text-base shrink-0 max-w-[42%] leading-snug pt-0.5">
          {word?.definitions[0]?.meaning ?? ""}
        </div>
      </div>
    </div>
  );
};

export default WordNotebook;

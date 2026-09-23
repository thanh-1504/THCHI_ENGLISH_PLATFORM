import { CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";

import notebookService from "../../services/notebook.service";
import useNotebookStore from "../../store/useNotebookStore";
import LEVELS from "../../utils/notebook.level";
import EmptyLevel from "./component/EmptyLevel";
import StarRow from "./component/StarRow";
import WordNotebook from "./component/WordNotebook";

const NotebookActive = () => {
  const params = useParams();
  const loaderWords = useLoaderData();
  const [activeLevel, setActiveLevel] = useState("LEVEL_1");
  const [isAnimating, setIsAnimating] = useState(false);
  const [resultSearch, setResultSearch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    words,
    inputValue,
    setInputValue,
    hasSearch,
    setHasSearch,
    selectedWords,
    setWords,
    removeWords,
    clearSelectedWords,
  } = useNotebookStore();

  const handleLevelChange = (levelKey) => {
    if (levelKey === activeLevel) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveLevel(levelKey);
      setIsAnimating(false);
    }, 220);
  };

  const wordsByLevel = (words ?? []).filter((w) => w.level === activeLevel);

  const handleSearchWord = async () => {
    if (!inputValue.trim()) return;

    setHasSearch(true);
    setIsLoading(true);
    setResultSearch(null);

    try {
      const res = await notebookService.searchWord(inputValue);
      if (res && res.word) {
        setResultSearch(res.word);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatusWord = async () => {
    try {
      await notebookService.updateWordsStatus({
        wordIds: selectedWords,
        status:
          params.status.trim().toUpperCase() === "ACTIVE"
            ? "SLEEPING"
            : "ACTIVE",
      });
      removeWords(selectedWords);
      clearSelectedWords();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (loaderWords) {
      setWords(loaderWords);
    }
  }, [loaderWords, setWords]);

  return (
    <div className="relative min-h-screen bg-white">
      {/* Sticky sub-header: levels + search */}
      <div className="sticky top-[70px] z-40 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
        {/* Level tabs */}
        <div className="w-full pt-2">
          <div className="flex w-full">
            {LEVELS.map((lvl) => {
              const isActive = activeLevel === lvl.key;
              return (
                <button
                  key={lvl.key}
                  type="button"
                  onClick={() => handleLevelChange(lvl.key)}
                  className="flex-1 flex flex-col items-center cursor-pointer select-none min-w-0 px-0.5"
                >
                  <p
                    className={`text-[11px] sm:text-sm w-full text-center transition-colors duration-200 leading-tight ${
                      isActive
                        ? "text-gray-900 font-semibold"
                        : "text-gray-400 font-medium"
                    }`}
                  >
                    {lvl.label}
                  </p>
                  <div className="h-[14px] flex items-center justify-center mt-0.5">
                    {isActive && <StarRow filledCount={lvl.filledStars} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Unified color bar */}
          <div className="flex w-full items-end mt-0.5">
            {LEVELS.map((lvl) => {
              const isActive = activeLevel === lvl.key;
              return (
                <div
                  key={lvl.key}
                  className={`flex-1 ${lvl.color} transition-all duration-300 ${
                    isActive ? "h-[14px]" : "h-[5px]"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-3 sm:px-20 py-3 flex items-center justify-center gap-2 sm:gap-3">
          <div className="relative flex items-center bg-gray-input-search rounded-full h-11 sm:h-12 w-full max-w-[600px]">
            <input
              onChange={(e) => {
                const val = e.target.value;
                setInputValue(val);
                if (val === "") {
                  setHasSearch(false);
                  setResultSearch(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim()) {
                  handleSearchWord();
                }
              }}
              className="flex-1 h-full bg-transparent rounded-full pl-4 sm:pl-6 pr-2 outline-none font-semibold text-sm sm:text-base placeholder:text-sm placeholder:font-semibold placeholder:text-gray-400"
              type="text"
              placeholder="Gõ vào đây từ bạn muốn tìm"
              value={inputValue}
            />
            {inputValue && (
              <CircleX
                onClick={() => {
                  setInputValue("");
                  setHasSearch(false);
                  setResultSearch(null);
                }}
                size={18}
                className="text-gray-400 cursor-pointer mr-2 shrink-0 hover:text-gray-600 transition-colors"
              />
            )}
            <div className="h-full min-w-[88px] sm:min-w-[112px] pr-0.5">
              <button
                type="button"
                onClick={handleSearchWord}
                disabled={isLoading}
                className="bg-text-green w-full relative cursor-pointer text-white font-semibold text-sm sm:text-base px-4 sm:px-8 h-full rounded-full shrink-0 disabled:opacity-80"
              >
                {!isLoading && "Search"}
                {isLoading && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-2 justify-center items-center">
                    <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 bg-white rounded-full animate-bounce" />
                  </div>
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdateStatusWord}
            disabled={selectedWords.length === 0}
            className={`font-semibold text-sm sm:text-base px-5 sm:px-8 h-11 sm:h-12 rounded-full shrink-0 transition-all duration-200 ${
              selectedWords.length > 0
                ? "bg-text-green text-white cursor-pointer"
                : "bg-[#d9d9d9] text-white cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>

        {hasSearch && !isLoading && !resultSearch && (
          <div className="pb-6 flex flex-col items-center text-center px-4">
            <img
              className="w-40 sm:w-52 h-40 sm:h-52 object-cover"
              src="/ThChi.png"
              alt="ThChi"
            />
            <div className="font-semibold text-lg sm:text-xl mt-2">
              <p>
                Thchi không tìm được từ này trong danh sách từ đã ôn của bạn.
              </p>
              <p className="text-base font-normal text-gray-400 mt-1">
                Bạn thử tìm từ khác nha.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Word list */}
      {!hasSearch && (
        <div className="px-3 sm:px-10 pb-24 sm:pb-10">
          <div
            className={`flex flex-col transition-all duration-200 ${
              isAnimating
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            {wordsByLevel.length > 0 ? (
              wordsByLevel.map((word) => (
                <WordNotebook key={word.id} word={word} />
              ))
            ) : (
              <EmptyLevel />
            )}
          </div>
        </div>
      )}

      {hasSearch && !isLoading && resultSearch && (
        <div className="px-3 sm:px-10 pb-24 sm:pb-10">
          <WordNotebook key={resultSearch.term} word={resultSearch} />
        </div>
      )}
    </div>
  );
};

export default NotebookActive;

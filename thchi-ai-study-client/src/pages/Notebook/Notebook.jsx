import { CircleX } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import RecommendationUI from "../../components/RecommendationUI";
import StatsCard from "../../components/StatsCard";
import notebookService from "../../services/notebook.service";
import useNotebookStore from "../../store/useNotebookStore";
import WordNotebook from "./component/WordNotebook";

const Notebook = () => {
  const data = useLoaderData();
  const [resultSearch, setResultSearch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { inputValue, setInputValue, hasSearch, setHasSearch } =
    useNotebookStore();
  const { totalWordsActive, totalWordsSleeping } = data;

  const handleSearchWord = async () => {
    if (!inputValue.trim()) return;
    setHasSearch(true);
    setIsLoading(true);
    setResultSearch(null);

    try {
      const res = await notebookService.searchWord(inputValue);
      if (res && res.word) {
        setResultSearch({
          ...res.word,
          status: res.status,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!data) return;
  return (
    <div className="relative min-h-screen pt-6">
      {!data ? (
        <RecommendationUI></RecommendationUI>
      ) : (
        <>
          {
            <div className="mt-4">
              <h2 className="text-center font-semibold text-2xl">
                SỔ TAY THCHI CỦA BẠN
              </h2>
              <div className="mt-10 px-4 lg:px-20 flex items-center justify-center gap-3">
                <div className="relative flex items-center bg-gray-input-search rounded-full h-12 w-full max-w-[600px]">
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
                    className="flex-1 h-full bg-transparent rounded-full pl-6 pr-2 outline-none font-semibold placeholder:text-sm placeholder:font-semibold"
                    type="text"
                    placeholder="Gõ vào đây từ bạn muốn tìm"
                    value={inputValue}
                  />
                  <CircleX
                    onClick={() => {
                      setInputValue("");
                      setHasSearch(false);
                      setResultSearch(null);
                    }}
                    size={20}
                    className="text-gray-400 cursor-pointer mr-3 shrink-0 hover:text-gray-600 transition-colors"
                  />
                  <div className="h-full min-w-[112px]">
                    <button
                      onClick={handleSearchWord}
                      className="bg-text-green w-full relative cursor-pointer text-white font-semibold px-8 h-full rounded-full shrink-0"
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
                {/* <button
              onClick={handleUpdateStatusWord}
              className={`font-semibold px-8 h-12 rounded-full shrink-0 transition-all duration-200 ${
                selectedWords.length > 0
                  ? "bg-text-green text-white cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Save
            </button> */}
              </div>
              {hasSearch && !isLoading && !resultSearch && (
                <div className="mt-8 flex flex-col items-center text-center">
                  <img
                    className="w-52 h-52 object-cover"
                    src="/ThChi.png"
                    alt="ThChi"
                  />
                  <div className="font-semibold text-xl mt-2">
                    <p>
                      Thchi không tìm được từ này trong danh sách từ đã ôn của
                      bạn.
                    </p>
                    <p className="text-base font-normal text-gray-400 mt-1">
                      Bạn thử tìm từ khác nha.
                    </p>
                  </div>
                </div>
              )}
              {hasSearch && !isLoading && resultSearch && (
                <div className="px-10 pt-10 pb-20 flex flex-col gap-y-8">
                  <WordNotebook key={resultSearch.term} word={resultSearch} />
                </div>
              )}
            </div>
          }
          {!hasSearch && !isLoading && (
            <div className="mt-8 px-4 lg:px-10 flex flex-col lg:flex-row items-center justify-evenly gap-4 pb-4">
              <StatsCard
                number={totalWordsActive}
                variant="blue"
                label="từ ôn tập"
                path="word-status/active"
                className="w-full"
              />
              <StatsCard
                number={totalWordsSleeping}
                variant="yellow"
                label="từ ngủ đông"
                path="word-status/sleeping"
                className="w-full"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Notebook;

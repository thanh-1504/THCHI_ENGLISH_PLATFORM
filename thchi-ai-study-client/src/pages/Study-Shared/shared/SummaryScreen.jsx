import { AlertCircle, Check, Clock, X, Zap } from "lucide-react";

const SummaryScreen = ({
  type = "",
  correctCount = 1,
  totalCount = 1,
  xpEarned = 2,
  timeSpent = "00:20",
  onContinue,
  // wordResults: Array<{ word: { id, term, definitions: [{wordType, meaning}] }, isCorrect: boolean }>
  wordResults = [],
}) => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FAFAFA] px-6 py-10 animate-fade-in">
      

      <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight mb-5">
        Tuyệt vời!
      </h2>
      

      <div className="flex w-full max-w-md justify-center gap-3 mb-8">
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border-2 border-orange-400 bg-white shadow-sm">
          <div className="bg-orange-400 text-white text-[10px] sm:text-xs font-bold py-1.5 px-1 text-center uppercase tracking-wide">
            Số câu đúng
          </div>
          <div className="flex items-center justify-center py-3 sm:py-4 gap-1.5 text-orange-500 font-bold text-base sm:text-lg">
            <AlertCircle size={18} fill="currentColor" className="text-white" />
            <span>
              {correctCount}/{totalCount}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border-2 border-purple-400 bg-white shadow-sm">
          <div className="bg-purple-400 text-white text-[10px] sm:text-xs font-bold py-1.5 px-1 text-center uppercase tracking-wide">
            Điểm KN
          </div>
          <div className="flex items-center justify-center py-3 sm:py-4 gap-1 text-purple-500 font-bold text-base sm:text-lg">
            <Zap size={18} fill="currentColor" className="text-white" />
            <span>+{xpEarned}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border-2 border-sky-400 bg-white shadow-sm">
          <div className="bg-sky-400 text-white text-[10px] sm:text-xs font-bold py-1.5 px-1 text-center uppercase tracking-wide">
            Tốc độ
          </div>
          <div className="flex items-center justify-center py-3 sm:py-4 gap-1.5 text-sky-400 font-bold text-base sm:text-lg">
            <Clock size={18} />
            <span>{timeSpent}</span>
          </div>
        </div>
      </div>

      {wordResults.length > 0 && (
        <div className="w-full max-w-md mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            Kết quả các từ trong phiên
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {wordResults.map((item, index) => (
                <div
                  key={`${item.word.id}-${index}`}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">
                        {item.word.term}
                      </span>
                      {item.word.definitions?.[0]?.wordType && (
                        <span className="text-[10px] text-gray-400 font-medium uppercase">
                          ({item.word.definitions[0].wordType})
                        </span>
                      )}
                    </div>
                    {item.word.definitions?.[0]?.meaning && (
                      <span className="text-xs text-gray-500 mt-0.5">
                        {item.word.definitions[0].meaning}
                      </span>
                    )}
                  </div>

                  {item.isCorrect ? (
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 ml-3">
                      <Check size={15} className="text-green-500" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 ml-3">
                      <X size={15} className="text-red-500" strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* {wordResults.some((w) => !w.isCorrect) && (
            <p className="text-xs text-center text-gray-400 mt-2">
              Các từ sai sẽ được nhắc lại sau 1 tiếng.
            </p>
          )} */}
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-fit max-w-xs bg-(image:--my-gradient) text-white font-bold text-xl py-2 px-10 rounded-full 
        hover:brightness-105
        shadow-[0_4px_0_#1f8f2f] active:shadow-[0_0_0_#1f8f2f] active:translate-y-1
        transition-all
        duration-100
        cursor-pointer"
      >
        Tiếp tục
      </button>
    </div>
  );
};

export default SummaryScreen;

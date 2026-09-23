import { Volume2 } from "lucide-react";

const CircularProgress = ({ percent }) => {
  const radius = 52;
  const stroke = 9;
  const normalised = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalised;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-[120px] h-[120px]">
      <svg width="120" height="120" className="-rotate-90">
        <circle
          cx="60"
          cy="60"
          r={normalised}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx="60"
          cy="60"
          r={normalised}
          fill="none"
          stroke="#FACC15"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-gray-800">{percent}%</span>
        <span className="text-xs text-gray-400 mt-0.5">Hoàn thành</span>
      </div>
    </div>
  );
};


const SuggestRow = ({ word, type, meaning }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-800">{word}</p>
      <p className="text-xs text-gray-400">
        ({type}) {meaning}
      </p>
    </div>
    <button
      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all cursor-pointer"
      title="Phát âm"
    >
      <Volume2 size={14} />
    </button>
  </div>
);


const LearningProgress = ({
  learned = 8,
  total = 20,
  streak = 12,
  suggestions = [
    { word: "examination", type: "n", meaning: "kỳ thi, cuộc thi" },
    { word: "exam", type: "n", meaning: "bài kiểm tra, kỳ thi" },
  ],
}) => {
  const percent = Math.round((learned / total) * 100);

  return (
    <div className="flex flex-col gap-4 w-[220px] pt-2">
      {/* ── Card 1: Progress ── */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] px-5 py-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">
          Tiến độ học tập
        </h3>

        {/* Donut */}
        <div className="flex justify-center mb-4">
          <CircularProgress percent={percent} />
        </div>

        {/* Today stat */}
        <div className="mb-3">
          <p className="text-xs text-gray-500">Hôm nay bạn đã học</p>
          <p className="text-sm font-semibold mt-0.5">
            <span className="text-yellow-500">
              {learned} / {total}
            </span>{" "}
            <span className="text-gray-500 font-normal">từ</span>
          </p>
        </div>

        {/* Streak */}
        <div>
          <p className="text-xs text-gray-500">Chuỗi ngày hiện tại</p>
          <p className="text-sm font-semibold mt-0.5">
            <span className="text-yellow-500">{streak} ngày</span>{" "}
            <span>🔥</span>
          </p>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] px-5 py-5">
          <h3 className="text-sm font-bold text-gray-800 mb-1">
            Gợi ý cho bạn
          </h3>

          <div>
            {suggestions.map((s) => (
              <SuggestRow key={s.word} {...s} />
            ))}
          </div>

          <button className="mt-2 w-full text-center text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl py-2 hover:bg-gray-50 transition-colors cursor-pointer">
            Xem thêm →
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningProgress;

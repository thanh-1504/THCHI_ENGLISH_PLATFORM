import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

const mascotSrc = "https://d35aaqx5ub95lt.cloudfront.net/images/owl-bye.svg";

const LessonComplete = ({ words = [], onFinish }) => {
  const [checked, setChecked] = useState(() => new Set(words.map((w) => w.id)));

  const toggle = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedWords = words.filter((w) => checked.has(w.id));
  const allChecked = checked.size === words.length;

  const toggleAll = () => {
    if (allChecked) {
      setChecked(new Set());
    } else {
      setChecked(new Set(words.map((w) => w.id)));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center pt-10 pb-20 px-4">
      <div className="w-full max-w-lg mb-6">
        <h1 className="text-[22px] font-bold text-gray-800 text-center leading-snug">
          Chọn từ bạn muốn lưu vào Sổ tay
        </h1>

        <p className="text-center text-sm text-gray-400 mt-1">
          Đã chọn{" "}
          <span className="font-semibold text-green-500">{checked.size}</span>/
          {words.length} từ
        </p>
      </div>

      {/* ── Card container ── */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Mascot header */}
        <div className="flex items-center px-6 pt-5 pb-3 border-b border-gray-100 gap-3">
          <img
            src={mascotSrc}
            alt="mascot"
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          {/* Select all toggle */}
          <button
            onClick={toggleAll}
            className="ml-auto text-xs text-green-500 font-semibold hover:text-green-600 transition-colors cursor-pointer"
          >
            {allChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </button>
        </div>

        {/* Word list */}
        <ul className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto no-scrollbar">
          {words.map((word) => {
            const isChecked = checked.has(word.id);
            const meaning = word.definitions?.[0]?.meaning ?? "";
            const wordType = word.definitions?.[0]?.wordType ?? "";

            return (
              <li
                key={word.id}
                onClick={() => toggle(word.id)}
                className={`
                  flex items-center gap-4 px-6 py-4 cursor-pointer
                  transition-colors duration-150
                  ${isChecked ? "bg-white hover:bg-green-50/40" : "bg-gray-50/60 hover:bg-gray-100/60"}
                `}
              >
                {/* Checkbox icon */}
                <div className="flex-shrink-0">
                  {isChecked ? (
                    <CheckCircle2
                      size={26}
                      className="text-green-500 transition-all duration-200"
                      strokeWidth={2}
                    />
                  ) : (
                    <Circle
                      size={26}
                      className="text-gray-300 transition-all duration-200"
                      strokeWidth={2}
                    />
                  )}
                </div>

                {/* Word info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-base leading-tight ${isChecked ? "text-gray-800" : "text-gray-400"}`}
                  >
                    {word.term}
                  </p>
                  {wordType && (
                    <p
                      className={`text-xs mt-0.5 ${isChecked ? "text-gray-400" : "text-gray-300"}`}
                    >
                      ({wordType})
                    </p>
                  )}
                </div>

                {/* Meaning */}
                <p
                  className={`text-sm text-right max-w-[180px] ${isChecked ? "text-gray-600" : "text-gray-300"}`}
                >
                  {meaning}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Action button ── */}
      <div className="w-full max-w-lg mt-6 flex flex-col gap-3">
        <button
          onClick={() => onFinish(selectedWords)}
          className="
            bg-(image:--my-gradient) text-white font-semibold
            hover:brightness-105
            shadow-[0_5px_0_#1f8f2f] active:shadow-[0_0_0_#1f8f2f] active:translate-y-1
            transition-all
            duration-100
            w-[48%] px-4 py-2 rounded-full cursor-pointer
            mx-auto
          "
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default LessonComplete;

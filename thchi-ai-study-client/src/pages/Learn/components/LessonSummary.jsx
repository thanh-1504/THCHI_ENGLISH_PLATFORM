import { BookMarked, Clock, Zap } from "lucide-react";
import { formatTime } from "../../../utils/format";

const LessonSummary = ({
  savedCount = 0,
  totalWords = 0,
  xpEarned = 0,
  durationSecs = 0,
  onClose,
}) => {


  const stats = [
    {
      id: "saved",
      label: "ĐÃ LƯU",
      value: `${savedCount}/${totalWords}`,
      icon: (
        <BookMarked size={16} className="text-orange-500" fill="currentColor" />
      ),
      bg: "bg-orange-50",
      border: "border-orange-200",
      labelColor: "text-orange-500",
      valueColor: "text-orange-600",
    },
    {
      id: "xp",
      label: "ĐIỂM KN",
      value: `+${xpEarned}`,
      icon: <Zap size={16} className="text-purple-500" fill="currentColor" />,
      bg: "bg-purple-50",
      border: "border-purple-200",
      labelColor: "text-purple-500",
      valueColor: "text-purple-600",
    },
    {
      id: "speed",
      label: "TỐC ĐỘ",
      value: formatTime(durationSecs),
      icon: <Clock size={16} className="text-cyan-500" fill="currentColor" />,
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      labelColor: "text-cyan-500",
      valueColor: "text-cyan-600",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5F5F7]">
      {/* ── Card ── */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-[340px] flex flex-col items-center pt-20 pb-8 px-6 mx-4">
        {/* ── Mascot notebook in golden circle ── */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
          <div className="relative w-28 h-28">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 shadow-[0_0_24px_8px_rgba(251,191,36,0.45)]" />
            {/* Inner circle */}
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 flex items-center justify-center">
              <span
                role="img"
                aria-label="notebook"
                className="text-5xl select-none"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
              >
                📓
              </span>
            </div>
            {/* Sparkles */}
            {[
              { top: "2px", right: "6px", size: "text-xs" },
              { top: "14px", left: "2px", size: "text-[10px]" },
              { bottom: "4px", right: "4px", size: "text-[10px]" },
            ].map((style, i) => (
              <span
                key={i}
                className={`absolute ${style.size} text-yellow-200 select-none animate-pulse`}
                style={{
                  top: style.top,
                  right: style.right,
                  left: style.left,
                  bottom: style.bottom,
                  animationDelay: `${i * 200}ms`,
                }}
              >
                ✦
              </span>
            ))}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="w-full flex gap-3 mt-2 mb-7">
          {stats.map((s) => (
            <div
              key={s.id}
              className={`flex-1 rounded-2xl border ${s.bg} ${s.border} py-3 px-2 flex flex-col items-center gap-1`}
            >
              {/* Label */}
              <p
                className={`text-[10px] font-bold tracking-wider uppercase ${s.labelColor}`}
              >
                {s.label}
              </p>
              {/* Value row */}
              <div className="flex items-center gap-1">
                {s.icon}
                <span
                  className={`text-xl font-extrabold ${s.valueColor} leading-none`}
                >
                  {s.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tiếp tục button ── */}
        <button
          onClick={onClose}
          className="
            bg-(image:--my-gradient) text-white font-semibold
            hover:brightness-105
            shadow-[0_5px_0_#1f8f2f] active:shadow-[0_0_0_#1f8f2f] active:translate-y-1
            transition-all
            duration-100
            px-4 py-2 rounded-full cursor-pointer
            w-full
          "
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default LessonSummary;

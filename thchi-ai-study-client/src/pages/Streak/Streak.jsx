import { Check, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

const Streak = () => {
  const navigate = useNavigate();
  const data = useLoaderData();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const streakShieldCount = streakData?.streakShieldCount ?? 0;
  const isOnFire = currentStreak > 0;

  useEffect(() => {
    if (data) {
      setStreakData(data);
      setLoading(false);
    }
  }, [data]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#fffbf5]">
      {/* Close button */}
      <button
        onClick={() => navigate("/review")}
        className="
          absolute left-9 top-6
          flex w-10 h-10
          items-center justify-center
          rounded-full
          bg-white
          text-[#3d3d3d]
          shadow-[0_4px_0_#dedbd6]
          transition-all duration-200
          hover:bg-[#f8f8f8]
          active:translate-y-[2px]
          active:shadow-[0_0px_0_#dedbd6] cursor-pointer
        "
      >
        <X size={20} strokeWidth={3} />
      </button>

      {/* Share button */}
      <button
        className="
          absolute right-9 top-6
          flex h-10 w-10
          items-center justify-center
          rounded-full
          text-[#858585]
          transition-all
          hover:bg-white
          hover:text-[#555]
        "
      >
        <Upload size={23} strokeWidth={2.5} />
      </button>

      {/* Main content */}
      <div className="mx-auto flex max-w-[900px] flex-col items-center px-6">
        {/* Title */}
        <h1 className="text-2xl font-bold leading-none text-[#202b3d]">
          Streak
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-center text-md font-normal leading-tight text-[#687080]">
          Hãy cố gắng học cả tuần nhé. Tớ sẽ canh chừng bạn!
        </p>

        {/* Character + Streak */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {/* Character */}
          <img
            src="/ThChi_Streak.png"
            alt="Streak character"
            className="h-[136px] w-auto object-contain"
          />

          {/* Current streak */}
          {loading ? (
            <div className="h-[100px] w-[140px] animate-pulse rounded-2xl bg-black/5" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-0.5">
                <span
                  className={`text-[85px] font-black leading-none tracking-[-5px] ${
                    isOnFire ? "text-[#FF9600]" : "text-[#CBD5E1]"
                  }`}
                >
                  {currentStreak}
                </span>

                <img
                  src={isOnFire ? "/streak_fire.png" : "/streak_unfire.png"}
                  alt={isOnFire ? "Streak đang cháy" : "Streak chưa cháy"}
                  className="w-[60px] h-[60px] object-contain shrink-0"
                />
              </div>

              <p
                className={`text-lg font-bold ${
                  isOnFire ? "text-[#7A4A12]" : "text-[#64748B]"
                }`}
              >
                Ngày streak!
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-7 grid w-full max-w-[500px] grid-cols-2 gap-3">
          {/* Longest streak */}
          <div
            className="
              flex h-[66px]
              items-center
              rounded-[15px]
              border-[3px] border-[#ffe66d]
              bg-white
              px-4
              shadow-[0_2px_4px_rgba(0,0,0,0.04)]
            "
          >
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center justify-center
                rounded-full
                bg-[#ff9800]
              "
            >
              <Check size={27} strokeWidth={3.5} className="text-white" />
            </div>

            <div className="ml-4 flex flex-1 flex-col items-center">
              {loading ? (
                <div className="h-5 w-10 animate-pulse rounded bg-black/10" />
              ) : (
                <span className="text-xl font-bold leading-none text-[#293344]">
                  {longestStreak}
                </span>
              )}
              <span className="mt-2 text-md leading-none text-[#687080]">
                Chuỗi dài nhất
              </span>
            </div>
          </div>

          {/* Streak shield */}
          <div
            className="
              flex h-[66px]
              items-center
              rounded-[15px]
              border-[3px] border-[#b9d6ff]
              bg-white
              px-4
              shadow-[0_2px_4px_rgba(0,0,0,0.04)]
            "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <img
                src="/streak_shield.png"
                alt="Bảo vệ chuỗi"
                className="w-9 h-9 object-contain"
              />
            </div>

            <div className="ml-0 flex flex-1 flex-col items-center">
              {loading ? (
                <div className="h-5 w-10 animate-pulse rounded bg-black/10" />
              ) : (
                <span className="text-xl font-bold leading-none text-[#293344]">
                  {streakShieldCount}
                </span>
              )}
              <span className="mt-2 text-md leading-none text-[#687080]">
                Bảo vệ chuỗi
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streak;

import { Lock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import aiService from "../../services/ai.service";
import { FREE_LIMIT } from "../../utils/config.constant";
import practiceModes from "../../utils/practiceMode";
import PracticeCard from "./components/PracticeCard";

const Practice = () => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await aiService.getPracticeUsage();
        setUsage(data);
      } catch (error) {
        console.error("Không thể tải thông tin lượt luyện tập:", error);
      } finally {
        setIsLoadingUsage(false);
      }
    };
    fetchUsage();
  }, []);

  const remaining = usage?.isPremium
    ? Infinity
    : (usage?.remaining ?? FREE_LIMIT);
  const count = usage?.count ?? 0;
  const isLimitReached = !usage?.isPremium && remaining === 0;

  return (
    <div className="w-full py-6 px-6">
      {/* Header & Usage Badge */}
      <div className="relative flex flex-col md:flex-row items-center justify-center mb-7 gap-4">
        {/* Tiêu đề (Luôn ở giữa) */}
        <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
          <span className="text-yellow-400">✦</span>
          Luyện tập cùng AI
          <span className="text-yellow-400">✦</span>
        </h1>

        {/* Usage Badge (Kèm Tooltip) */}
        {/* Thêm group và relative vào thẻ div bọc ngoài để làm gốc cho tooltip */}
        <div className="md:absolute md:right-0 relative group">
          {isLoadingUsage ? (
            <div className="h-9 w-48 rounded-full bg-gray-100 animate-pulse" />
          ) : (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm border transition-all cursor-help
                ${
                  isLimitReached
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
            >
              <span className="text-base">
                <Star size={20} fill="yellow" className="text-yellow-500" />
              </span>
              {usage?.isPremium ? (
                <span>Luyện tập không giới hạn · Premium</span>
              ) : (
                <>
                  <span>
                    {remaining}/{FREE_LIMIT}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Hộp thoại Tooltip (Chỉ hiện khi hover vào div cha) */}
          {!isLoadingUsage && (
            <div className="absolute right-0 top-full mt-2.5 w-64 p-3 bg-gray-800 text-white text-xs rounded-xl shadow-lg opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 ">
              {/* Mũi tên chỉ lên của tooltip */}
              <div className="absolute -top-1.5 right-6 w-3 h-3 bg-gray-800 transform rotate-45 rounded-sm"></div>
              {/* Nội dung chú thích */}
              {usage?.isPremium
                ? "Tài khoản Premium của bạn có thể sử dụng tất cả tính năng luyện tập AI không giới hạn."
                : `Mỗi ngày bạn được cấp ${FREE_LIMIT} lượt miễn phí để sử dụng các tính năng luyện tập. Số lượt sẽ được tự động làm mới vào lúc 00:00 mỗi ngày.`}
            </div>
          )}
        </div>
      </div>

      {/* Out of turns warning */}
      {isLimitReached && (
        <div className="max-w-xl mx-auto mb-7 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          {/* Vùng Icon đã được cải thiện UI */}
          <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-red-100 rounded-full text-red-500 shadow-sm border border-red-200/50">
            <Lock size={24} strokeWidth={2.5} />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-red-700 text-sm">
              Bạn đã dùng hết 6 lượt luyện tập miễn phí hôm nay!
            </p>
            <p className="text-red-500 text-xs mt-0.5">
              Lượt luyện tập sẽ được khôi phục vào ngày mai. Nâng cấp Premium để
              luyện không giới hạn.
            </p>
          </div>
          <button
            onClick={() => navigate("/premium")}
            className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-bold shadow hover:brightness-105 active:scale-95 transition-all"
          >
            Nâng cấp Premium
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {practiceModes.map((mode) => (
          <PracticeCard key={mode.id} mode={mode} />
        ))}
      </div>
    </div>
  );
};

export default Practice;

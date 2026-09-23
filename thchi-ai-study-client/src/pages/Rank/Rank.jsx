import { BookOpen, Crown, Flame, Medal, Trophy } from "lucide-react";
import { useLoaderData } from "react-router-dom";
import RecommendationUI from "../../components/RecommendationUI";
import {
  CONFETTI,
  PODIUM_STYLES,
  TIER_LABELS,
} from "../../utils/config.constant";
import Avatar from "./components/Avatar";
import RankBadge from "./components/RankBadge";
import SkeletonPulse from "./components/SkeletonPulse";

const Rank = () => {
  const data = useLoaderData();
  const top3 = data?.top3 ?? [];
  const currentUser = data?.currentUser ?? null;
  const tier = data?.tier ?? "";
  const ranked = top3.map((u, i) => ({ ...u, rank: i + 1 }));

  const podiums = PODIUM_STYLES.map((style) => ({
    ...style,
    user: ranked.find((u) => u.rank === style.rank) ?? null,
  }));
  console.log(podiums)
  return (
    <>
      {!data ? (
        <RecommendationUI text="Hãy học 1 bài từ để thống kê bạn nhé" />
      ) : (
        <div className="relative min-h-screen bg-white overflow-hidden pb-10">
          {CONFETTI.map((dot, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-sm rotate-12 opacity-60 ${dot.color}`}
              style={{ top: dot.top, left: dot.left, right: dot.right }}
            />
          ))}

          {/* ════ PODIUM TOP 3 ══════════════════════════════════════════════════ */}
          <div className="pt-12 sm:pt-25 flex items-end justify-center gap-1 sm:gap-2 px-2 sm:px-8 mt-2">
            {podiums.map((item) => {
              if (!item.user) {
                return (
                  <div
                    key={item.rank}
                    className={`flex flex-col items-center ${item.containerMargin}`}
                  >
                    <div
                      className={`w-24 sm:w-36 ${item.platformHeight} ${item.platformBg} rounded-t-3xl flex items-center justify-center`}
                    >
                      <span
                        className={`text-4xl sm:text-6xl font-black ${item.numberColor}`}
                      >
                        {item.rank}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.rank}
                  className={`flex flex-col items-center ${item.containerMargin}`}
                >
                  {/* Avatar + Crown + Badge */}
                  <div className="relative mb-3">
                    {item.showCrown && (
                      <Crown
                        size={28}
                        fill="#FACC15"
                        strokeWidth={1.5}
                        className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-md"
                      />
                    )}
                    <Avatar
                      name={item.user?.name}
                      size="md"
                      ring={item.avatarRing}
                    />
                    <div className="absolute -bottom-1 -right-1">
                      <RankBadge rank={item.rank} />
                    </div>
                  </div>

                  {/* Name + XP */}
                  <p className="font-extrabold text-xs sm:text-base text-gray-800 mt-2 text-center max-w-[80px] sm:max-w-none truncate">
                    {item.user?.name ?? "—"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Trophy
                      size={12}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <p className="text-xs sm:text-sm font-bold text-orange-500">
                      {item.user.xpThisWeek.toLocaleString()} XP
                    </p>
                  </div>

                  {/* Platform */}
                  <div
                    className={`w-24 sm:w-36 ${item.platformHeight} ${item.platformBg} rounded-t-3xl mt-4 flex items-center justify-center relative overflow-hidden`}
                  >
                    <span className={`text-4xl sm:text-6xl font-black ${item.numberColor}`}>
                      {item.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ════ CURRENT USER CARD ═════════════════════════════════════════════ */}
          {currentUser ? (
            <div className="max-w-3xl mx-auto mt-4 relative z-20 bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 p-4 sm:p-6">
              {/* Row 1: Avatar + Name + Streak */}
              <div className="flex items-center gap-3 pl-2 sm:pl-4 mb-4 sm:mb-0">
                <Avatar name={currentUser.name} size="md" />
                <div>
                  <p className="font-extrabold text-base text-gray-800">
                    {currentUser.name || "Bạn"}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-orange-500 font-bold text-sm">
                    <Flame size={15} className="fill-orange-500" />
                    <span>{currentUser.streak} ngày streak</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Stats — 2 cols on mobile, inline on sm+ */}
              <div className="flex items-center sm:items-center border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                {/* Hạng (Rank tier) */}
                <div className="flex-1 flex flex-col items-center sm:border-l-2 border-gray-50 py-1 sm:py-0">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1 sm:mb-2">
                    Rank của bạn
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="bg-blue-50 p-1 sm:p-1.5 rounded-full">
                      <Medal
                        size={18}
                        className="text-blue-500 fill-blue-500"
                      />
                    </div>
                    <p className="font-black text-purple-600 text-sm sm:text-base">
                      {TIER_LABELS[currentUser.currentTier] ??
                        currentUser.currentTier}
                    </p>
                  </div>
                </div>

                {/* Tổng từ trong notebook */}
                <div className="flex-1 flex flex-col items-center border-l-2 border-gray-50 py-1 sm:py-0">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1 sm:mb-2">
                    Số từ đã học
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="bg-orange-50 p-1 sm:p-1.5 rounded-md">
                      <BookOpen
                        size={18}
                        className="text-orange-500 fill-orange-500"
                      />
                    </div>
                    <p className="font-black text-orange-500 text-sm sm:text-base">
                      {(currentUser.totalWordsSaved ?? 0).toLocaleString()} từ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mt-2 p-6 border border-gray-100 rounded-[2rem]">
              <div className="flex gap-4">
                <SkeletonPulse className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonPulse className="h-5 w-32" />
                  <SkeletonPulse className="h-4 w-24" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Rank;

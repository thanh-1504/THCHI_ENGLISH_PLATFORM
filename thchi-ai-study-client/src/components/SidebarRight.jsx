import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import notebookService from "../services/notebook.service";

const SidebarRight = () => {
  const navigate = useNavigate();
  const isShowCardStreak =
    localStorage.getItem("lastStreakCelebrationDate") ===
    new Date().toLocaleDateString();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(isShowCardStreak);
  useEffect(() => {
    notebookService
      .getStats()
      .then((data) => setStats(data))
      .catch(() => setStats({ totalWords: 0, currentStreak: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const totalWords = stats?.totalWords ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const isOnFire = currentStreak > 0;

  return (
    <div className="bg-[#f7f7f8] w-[20%] p-5 flex flex-col items-center gap-6 border-l border-gray-200 fixed top-[70px] right-0 min-h-[calc(100vh-70px)] hidden lg:block overflow-y-auto">
      {/* Card 1: Số từ đã học */}
      <div
        className={
          "relative w-full max-w-[280px] aspect-[16/10] rounded-[22px] overflow-hidden"
        }
      >
        <img
          src="/reviewwords.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center -translate-y-1">
          <p className="text-[#2fa84f] text-[17px] font-extrabold leading-snug">
            Bạn đã học được
          </p>
          {loading ? (
            <div className="h-7 w-20 bg-black/5 animate-pulse rounded-lg mt-1" />
          ) : (
            <p className="text-[#ffb020] text-[24px] font-black leading-tight mt-0.5">
              {totalWords.toLocaleString()} từ
            </p>
          )}
        </div>
      </div>

      {/* Card 2: Streak */}
      {isShowCardStreak && (
        <div
          onClick={() => navigate("/streak")}
          className={`relative w-full max-w-[280px] aspect-[16/10] rounded-[22px] overflow-hidden border-[3px] border-[#ffb020] flex flex-col items-center justify-center px-5 hover:cursor-pointer`}
          style={{
            background:
              "linear-gradient(180deg, #FFA51F 0%, #FFB83D 18%, #FFD078 35%, #FFE8BD 50%, #FFFFFF 70%, #FFFFFF 100%)",
            boxShadow: "0 6px 18px rgba(255, 166, 30, 0.18)",
          }}
        >
          <p className="text-[#8B5A00] text-[15px] font-extrabold tracking-wide mb-2">
            Bạn đã học liên tục
          </p>

          {loading ? (
            <div className="h-[60px] w-[85%] bg-white/50 animate-pulse rounded-xl" />
          ) : (
            <div className="flex items-end justify-center gap-2">
              <img
                src="/ThChi.png"
                alt="Nhân vật ThChi"
                className="w-[54px] h-[54px] object-contain shrink-0 -mb-0.5 drop-shadow-sm"
              />

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-0.5">
                  <span
                    className={`text-[36px] font-black tracking-tighter leading-none ${
                      isOnFire ? "text-[#FF9600]" : "text-[#CBD5E1]"
                    }`}
                  >
                    {currentStreak}
                  </span>

                  <img
                    src={isOnFire ? "/streak_fire.png" : "/streak_unfire.png"}
                    alt={isOnFire ? "Streak đang cháy" : "Streak chưa cháy"}
                    className="w-[36px] h-[36px] object-contain shrink-0 mb-0.5"
                  />
                </div>

                <p
                  className={`text-[12px] font-bold ${
                    isOnFire ? "text-[#7A4A12]" : "text-[#64748B]"
                  }`}
                >
                  Ngày streak!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarRight;

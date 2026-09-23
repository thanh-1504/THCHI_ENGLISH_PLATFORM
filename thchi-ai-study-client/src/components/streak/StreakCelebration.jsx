import { useEffect, useState } from "react";
import userService from "../../services/user.service";
import Button from "../Button";

const StreakCelebration = ({ handleContinue }) => {
  const [streak, setStreak] = useState(-1);
  const [data, setData] = useState();

  // Hàm xác định bộ lọc màu dựa trên streak
  const getFilterClass = (currentStreak) => {
    if (currentStreak === -1) return "grayscale opacity-50"; // Màu xám, hơi mờ
    if (currentStreak === 0) return "saturate-50 opacity-80"; // Màu cam nhạt
    return "saturate-100 opacity-100"; // Màu rực rỡ nguyên bản
  };

  useEffect(() => {
    const getUserStreak = async () => {
      const data = await userService.getMyStreak();
      if (data) setData(data);
    };
    getUserStreak();
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setStreak(0), 800);
    const timer2 = setTimeout(() => setStreak(1), 1600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  return (
    <div className="flex flex-col items-center justify-center font-sans bg-[#F5F5F7] min-h-screen">
      <img
        key={`fire-${streak}`}
        src="/streak-animation.svg"
        alt="Fire Streak"
        className={`w-64 h-64 transition-all duration-1000 ease-in-out animate-pop ${getFilterClass(streak)}`}
      />

      <h1
        key={`text-${streak}`}
        className={`text-6xl my-4 transition-colors duration-1000 ease-in-out animate-pop ${
          streak === -1
            ? "text-gray-400"
            : streak === 0
              ? "text-orange-400"
              : "text-orange-500"
        }`}
      >
        {data?.currentStreak ? data?.currentStreak : 0}
      </h1>

      <p className="text-gray-600 text-lg font-bold">Ngày streak</p>

      <Button style="mt-12 min-w-[180px] px-10 whitespace-nowrap" onClick={handleContinue}>
        Tiếp tục
      </Button>
    </div>
  );
};

export default StreakCelebration;

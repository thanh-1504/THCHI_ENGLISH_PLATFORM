import { useEffect, useState } from "react";
import userService from "../../services/user.service";
import Button from "../Button";

const StreakGoalSelection = ({ onDone }) => {
  const [configs, setConfigs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    userService.getStreakGoalConfigs().then((data) => {
      if (data?.length) {
        setConfigs(data);
        setSelectedId(data[0].id);
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!selectedId || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await userService.createStreakGoal(selectedId);
      if (onDone) onDone();
    } catch (error) {
      console.error("Lỗi khi tạo mục tiêu streak:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto px-12 font-sans text-center min-h-screen bg-white">
      <img
        src="/streak_calendar.png"
        alt="Streak Goal Mascot"
        className="w-45 h-45 mb-4 object-contain"
      />

      {/* Danh sách các lựa chọn */}
      <div className="w-full flex flex-col gap-3 mb-10">
        {configs.map((config) => {
          const isSelected = selectedId === config.id;

          return (
            <div
              key={config.id}
              onClick={() => setSelectedId(config.id)}
              className={`flex justify-between items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? "border-blue-400 bg-blue-50/50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <span
                className={`font-semibold ${isSelected ? "text-blue-500" : "text-gray-700"}`}
              >
                {config.targetDays} ngày
              </span>

              <span
                className={`font-semibold text-[15px] flex items-center gap-1.5 ${isSelected ? "text-blue-500" : "text-blue-400"}`}
              >
                +{config.shieldReward} Bảo vệ chuỗi
                <div className="w-7 h-7">
                  <img
                    className="object-contain"
                    src="/streak_shield.png"
                    alt="Bảo vệ chuỗi"
                  />
                </div>
              </span>
            </div>
          );
        })}
      </div>

      <Button
        style="w-full max-w-[350px]"
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedId}
      >
        {isSubmitting ? "Đang lưu..." : "Cam kết với mục tiêu"}
      </Button>
    </div>
  );
};

export default StreakGoalSelection;

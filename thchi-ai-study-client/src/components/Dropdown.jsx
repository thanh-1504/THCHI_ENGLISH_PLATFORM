import { Settings, Trophy } from "lucide-react";
import useUIStore from "../store/useUIStore";
const Dropdown = ({ style = "", items = [] }) => {
  const { setIsOpenAchievementModal, setIsOpenSettingModal } = useUIStore();
  items = [
    // {
    //   icon: <Trophy className="text-yellow-400" size={25} />,
    //   label: "Thành tích học tập",
    //   onClick: () => {
    //     setIsOpenAchievementModal(true);
    //   },
    // },
    {
      icon: <Settings className="text-gray-400" />,
      label: "Cài đặt tài khoản",
      onClick: () => {
        setIsOpenSettingModal(true);
      },
    },
    ...items,
  ];
  return (
    <div
      className={`absolute top-[calc(100%+25px)] right-4 min-w-[280px] flex flex-col gap-y-2 p-3 bg-white rounded-2xl z-50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-[dropdownFadeIn_0.18s_ease] ${style} `}
    >
      {items.length > 0 &&
        items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="flex bg-white justify-center items-center gap-x-3 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:cursor-pointer transition-all border-2 border-[#f5a623] hover:bg-[#fff8ec] text-left"
          >
            {item.icon}
            <span className="text-yellow-500 text-lg w-full max-w-40 truncate">
              {item.label}
            </span>
          </button>
        ))}
    </div>
  );
};
export default Dropdown;

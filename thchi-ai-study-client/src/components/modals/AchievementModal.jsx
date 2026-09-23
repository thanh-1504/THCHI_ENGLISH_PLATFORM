import { X } from "lucide-react";
import { createPortal } from "react-dom";
import ModalUserCard from "./shared/ModalUserCard";

const MOCK_USER = {
  accountType: "Free Account",
};

const achievements = [
  {
    id: 1,
    icon: "",
    title: "Sổ tay cấp độ 0",
    progress: "0/100 words",
    percent: 0,
  },
  {
    id: 2,
    icon: "",
    title: "Siêu trí nhớ cấp độ 0",
    progress: "0/100 words",
    percent: 0,
  },
];

const AchievementModal = ({ onClose }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl min-w-[50%] max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center bg-yellow-400 px-4 py-3 relative">
            <button
              onClick={onClose}
              className="
                absolute top-2
                p-1 rounded-full bg-white
                cursor-pointer
                shadow-[0_3px_0_rgba(0,0,0,0.102)]
                active:translate-y-[3px] active:shadow-none
                transition-all duration-150
              "
            >
              <X strokeWidth={3.5} className="text-yellow-400" />
            </button>
            <h2 className="mx-auto text-xl font-semibold text-gray-800 pr-9">
              Thành tích học tập
            </h2>
          </div>

          {/* Body */}
          <div className="overflow-y-auto no-scrollbar px-8 pb-6 flex flex-col items-center gap-6 pt-8">
            <ModalUserCard user={MOCK_USER} showEditName={false} />

            <div className="w-full flex flex-col gap-4 mt-2">
              {achievements.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border border-[#ed9720] rounded-2xl px-4 py-3"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-3xl shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-amber-500 mb-1 font-semibold text-sm">
                      {item.progress}
                    </p>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default AchievementModal;

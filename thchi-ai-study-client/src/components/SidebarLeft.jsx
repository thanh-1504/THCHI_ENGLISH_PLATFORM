import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const SidebarLeft = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isPremium = !!user?.accountPremium;

  return (
    <div className="bg-[#f0f0f0] w-[20%] fixed top-[70px] left-0 border-r border-gray-200 min-h-[calc(100vh-70px)] hidden lg:block">
      <div className="absolute bottom-20 w-full flex flex-col items-center gap-2">
        {!isPremium && (
          <button
            onClick={() => navigate("/premium")}
            className="bg-(image:--my-gradient) text-white font-bold px-8 py-3 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="underline underline-offset-4 decoration-2">
              Nhận ưu đãi
            </span>
            <span>&gt;</span>
          </button>
        )}

        <span className="text-xl text-[#ff9600] font-semibold">ThchiVocab</span>
      </div>
    </div>
  );
};

export default SidebarLeft;

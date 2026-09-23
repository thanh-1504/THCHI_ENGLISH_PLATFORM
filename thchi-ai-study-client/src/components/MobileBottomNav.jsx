import { NavLink } from "react-router";

const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:hidden">
      <ul className="flex items-center justify-around h-16">
        {/* Ôn tập */}
        <NavLink
          to="/review"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${
              isActive ? "bg-gray-200" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center rounded-xl transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <img
                  src="/OnTap.png"
                  alt="Ôn Tập"
                  loading="lazy"
                  className="w-12 h-12 object-cover"
                />
              </div>
              <span
                className={`text-[12px] font-semibold leading-none ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                Ôn tập
              </span>
            </>
          )}
        </NavLink>

        {/* Luyện tập */}
        <NavLink
          to="/practice"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${
              isActive ? "bg-gray-200" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center rounded-xl transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <img
                  src="/TuDien.png"
                  alt="Luyện tập"
                  loading="lazy"
                  className="w-12 h-12 object-cover"
                />
              </div>
              <span
                className={`text-[12px] font-semibold leading-none ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                Luyện tập
              </span>
            </>
          )}
        </NavLink>

        {/* Học Từ Mới */}
        <NavLink
          to="/learn"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${
              isActive ? "bg-gray-200" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center rounded-xl transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <img
                  src="/hat.png"
                  alt="Học Từ Mới"
                  loading="lazy"
                  className="w-12 h-12 object-cover"
                />
              </div>
              <span
                className={`text-[12px] font-semibold leading-none ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                Học Từ Mới
              </span>
            </>
          )}
        </NavLink>

        {/* Sổ tay */}
        <NavLink
          to="/notebook"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${
              isActive ? "bg-gray-200" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center rounded-xl transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <img
                  src="/notebook.png"
                  alt="Sổ tay"
                  loading="lazy"
                  className="w-12 h-12 object-cover"
                />
              </div>
              <span
                className={`text-[12px] font-semibold leading-none ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                Sổ tay
              </span>
            </>
          )}
        </NavLink>

        {/* Rank */}
        <NavLink
          to="/rank"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${
              isActive ? "bg-gray-200" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center rounded-xl transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <img
                  src="/rank.png"
                  alt="Rank"
                  loading="lazy"
                  className="w-12 h-12 object-cover"
                />
              </div>
              <span
                className={`text-[12px] font-semibold leading-none ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                Rank
              </span>
            </>
          )}
        </NavLink>

        {/* ThchiHub */}
        <NavLink
          to="/community"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${
              isActive ? "bg-gray-200" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center rounded-xl transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <img
                  src="/thchiHub.png"
                  alt="ThchiHub"
                  loading="lazy"
                  className="w-12 h-12 object-cover"
                />
              </div>
              <span
                className={`text-[12px] font-semibold leading-none ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                ThchiHub
              </span>
            </>
          )}
        </NavLink>
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
import { useEffect, useRef } from "react";
import { NavLink } from "react-router";
import useAuthStore from "../store/useAuthStore";
import useUIStore from "../store/useUIStore";
import getDisplayName from "../utils/getDisplayName";
import Dropdown from "./Dropdown";

const Header = () => {
  const { user } = useAuthStore();
  const { isOpenDropdown, setIsOpenDropdown } = useUIStore();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccountClick = () => {
    setIsOpenDropdown(!isOpenDropdown);
  };
  return (
    <header className="sticky z-50 top-0 flex items-center w-full h-[70px] shadow-[3px_5px_5px_hsla(0,0%,84%,0.58)] bg-white">
      {/* LOGO */}
      <section className="flex-1 lg:flex-none lg:w-[20%] overflow-hidden flex items-center">
        <NavLink to="/review">
          <img 
            src="/logo.png" 
            alt="logo" 
            className="hover:cursor-pointer h-[70px] w-auto object-contain" 
          />
        </NavLink>
      </section>
      
      {/* MENU - Ẩn trên mobile, chỉ hiện từ lg trở lên */}
      <section className="hidden lg:block lg:w-[60%]">
        <nav>
          <ul className="flex items-center justify-center">
            <NavLink
              to="/review"
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-300 w-[16%] text-center"
                  : "w-[16%] text-center hover:bg-gray-300 hover:cursor-pointer transition-all"
              }
            >
              <div className="hover:bg-gray-300 hover:cursor-pointer transition-all">
                <img
                  src="/OnTap.png"
                  alt="Ôn Tập"
                  loading="lazy"
                  className="hover:cursor-pointer w-14 h-14 mx-auto -mb-2 object-cover"
                />
                <span className="font-semibold text-sm">Ôn tập</span>
              </div>
            </NavLink>
            <NavLink
              to="/practice"
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-300 w-[16%] text-center"
                  : "w-[16%] text-center hover:bg-gray-300 hover:cursor-pointer transition-all"
              }
            >
              <div className="hover:bg-gray-300 hover:cursor-pointer transition-all">
                <img
                  src="/TuDien.png"
                  alt="Trợ lý THCHI"
                  loading="lazy"
                  className="hover:cursor-pointer w-13 h-13 mx-auto -mb-[4px] object-cover"
                />
                <span className="font-semibold text-sm">Luyện tập</span>
              </div>
            </NavLink>
            <NavLink
              to={"/learn"}
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-300 w-[16%] text-center"
                  : "w-[16%] text-center hover:bg-gray-300 hover:cursor-pointer transition-all"
              }
            >
              <div className="hover:bg-gray-300 hover:cursor-pointer transition-all">
                <img
                  src="/hat.png"
                  alt="Học Từ Mới"
                  loading="lazy"
                  className="hover:cursor-pointer w-14 h-14 mx-auto -mb-2 object-cover"
                />
                <span className="font-semibold text-sm">Học Từ Mới</span>
              </div>
            </NavLink>
            <NavLink
              to="/notebook"
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-300 w-[16%] text-center"
                  : "w-[16%] text-center hover:bg-gray-300 hover:cursor-pointer transition-all"
              }
            >
              <div className="hover:bg-gray-300 hover:cursor-pointer transition-all">
                <img
                  src="/notebook.png"
                  alt="Sổ tay"
                  loading="lazy"
                  className="hover:cursor-pointer w-14 h-14 mx-auto -mb-2 object-cover"
                />
                <span className="font-semibold text-sm">Sổ tay</span>
              </div>
            </NavLink>
            <NavLink
              to="/rank"
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-300 w-[16%] text-center"
                  : "w-[16%] text-center hover:bg-gray-300 hover:cursor-pointer transition-all"
              }
            >
              <div className="hover:bg-gray-300 hover:cursor-pointer transition-all">
                <img
                  src="/rank.png"
                  alt="Rank"
                  loading="lazy"
                  className="hover:cursor-pointer w-14 h-14 mx-auto -mb-2 object-cover"
                />
                <span className="font-semibold text-sm">Rank</span>
              </div>
            </NavLink>
            <NavLink
              to="community"
              className={({ isActive }) =>
                isActive
                  ? "bg-gray-300 w-[16%] text-center"
                  : "w-[16%] text-center hover:bg-gray-300 hover:cursor-pointer transition-all"
              }
            >
              <div className="hover:bg-gray-300 hover:cursor-pointer transition-all">
                <img
                  src="/thchiHub.png"
                  alt="ThchiHub"
                  loading="lazy"
                  className="hover:cursor-pointer w-14 h-14 mx-auto -mb-2 object-cover"
                />
                <span className="font-semibold text-sm">ThchiHub</span>
              </div>
            </NavLink>
          </ul>
        </nav>
      </section>
      {/* ACCOUNT USER */}
      <section
        className="w-auto pr-3 lg:w-[20%] lg:pr-0 flex items-center justify-center relative"
        ref={dropdownRef}
      >
        <div
          onClick={handleAccountClick}
          className="flex items-center gap-x-3 hover:opacity-80 hover:cursor-pointer transition-opacity"
        >
          <span className="text-xl text-[#ffcb08] font-semibold">
            {getDisplayName(user?.name ?? "THCHI")}
          </span>
          <div className="w-12 h-12">
            <img
              src={user?.avatarUrl ?? "/useravatar.png"}
              alt="user avatar"
              className="w-full h-full rounded-full"
            />
          </div>
        </div>

        {/* DROPDOWN MENU */}
        {isOpenDropdown && <Dropdown />}
      </section>
    </header>
  );
};

export default Header;
import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import ChatMascotButton from "../components/chat-widget/ChatMascotButton";
import ChatPanel from "../components/chat-widget/ChatPanel";
import MobileBottomNav from "../components/MobileBottomNav";
import AchievementModal from "../components/modals/AchievementModal";
import SettingModal from "../components/modals/SettingModal";
import SidebarLeft from "../components/SidebarLeft";
import SidebarRight from "../components/SidebarRight";
import useUIStore from "../store/useUIStore";

const Home = () => {
  const {
    isOpenAchievementModal,
    isOpenSettingModal,
    setIsOpenAchievementModal,
    setIsOpenSettingModal,
  } = useUIStore();

  useEffect(() => {
    if (isOpenAchievementModal || isOpenSettingModal)
      document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [isOpenAchievementModal, isOpenSettingModal]);

  return (
    <div className="flex items-start min-h-screen bg-white">
      {/* Sidebar Left */}
      <SidebarLeft></SidebarLeft>

      {/* Main Content */}
      <Suspense fallback={<div>Loading</div>}>
        <div className="w-full bg-white xs:pb-20 lg:w-[60%] lg:ml-[20%] lg:pb-0 lg:min-h-[calc(100vh-70px)]">
          {/* <Chart /> */}
          <Outlet />
        </div>
      </Suspense>

      {/* Sidebar Right */}
      <SidebarRight></SidebarRight>

      <ChatMascotButton />
      <ChatPanel />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Modal Account Setting And Modal Achievement */}

      {isOpenAchievementModal && (
        <AchievementModal onClose={() => setIsOpenAchievementModal(false)} />
      )}
      {isOpenSettingModal && (
        <SettingModal onClose={() => setIsOpenSettingModal(false)} />
      )}
    </div>
  );
};

export default Home;

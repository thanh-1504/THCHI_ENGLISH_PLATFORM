import { useChatWidgetStore } from "../../store/useChatWidgetStore";

const ChatMascotButton = () => {
  const { isOpen, toggle } = useChatWidgetStore();

  if (isOpen) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg bg-white hover:cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
    >
      <img
        src={"/ThChi_AI_CHAT.png"}
        alt="Trợ lý AI"
        className="w-full h-full object-cover"
      />
    </button>
  );
};

export default ChatMascotButton;

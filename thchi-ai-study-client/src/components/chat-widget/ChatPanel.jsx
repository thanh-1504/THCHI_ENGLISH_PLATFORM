import { Bot, Send, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import aiService from "../../services/ai.service";
import { useChatWidgetStore } from "../../store/useChatWidgetStore";

const getTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const WordDetailCard = ({ data }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2 mb-1">
      <span className="font-bold text-gray-800 text-base">Từ: {data.word}</span>
      <button
        className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors cursor-pointer"
        title="Nghe phát âm"
      >
        <Volume2 size={14} />
      </button>
    </div>
    <ul className="flex flex-col gap-1.5 text-sm text-gray-700">
      {data.phonetic && (
        <li>
          <span className="font-semibold">• Phiên âm: </span>
          {data.phonetic}
        </li>
      )}
      {data.type && (
        <li>
          <span className="font-semibold">• Loại từ: </span>
          {data.type}
        </li>
      )}
      {data.meaning && (
        <li>
          <span className="font-semibold">• Nghĩa: </span>
          {data.meaning}
        </li>
      )}
      {data.examples?.length > 0 && (
        <li>
          <span className="font-semibold">• Ví dụ:</span>
          <ul className="flex flex-col gap-2 mt-1.5 ml-3">
            {data.examples.map((ex, i) => (
              <li key={i} className="text-sm leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: ex.en }} />
                {ex.vi && (
                  <>
                    <br />
                    <em className="text-gray-500">({ex.vi})</em>
                  </>
                )}
              </li>
            ))}
          </ul>
        </li>
      )}
    </ul>
  </div>
);

const AIMessage = ({ msg }) => {
  return (
    <div className="flex items-start gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm mt-0.5 text-sm">
        <Bot fill="#fff" size={18} />
      </div>

      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-gray-700">
            Trợ lý THCHI
          </span>
          <span className="text-[10px] text-gray-400">
            {msg.time || getTime()}
          </span>
        </div>

        <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-gray-100 text-sm text-gray-800 leading-relaxed">
          {msg.type === "word-detail" && msg.data ? (
            <WordDetailCard data={msg.data} />
          ) : (
            <div className="prose prose-sm max-w-none text-gray-800 prose-p:my-1 prose-ul:my-1">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserMessage = ({ msg }) => (
  <div className="flex items-end justify-end gap-2.5 mb-4">
    <div className="flex flex-col items-end gap-1 max-w-[80%]">
      <div className="bg-amber-400 text-white rounded-2xl rounded-br-sm px-3.5 py-2.5 shadow-sm text-sm leading-relaxed">
        {msg.content}
      </div>
      <span className="text-[10px] text-gray-400">{msg.time || getTime()}</span>
    </div>
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm text-xs">
      <img
        src="/useravatar.png"
        alt="User"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.parentElement.textContent = "👤";
        }}
      />
    </div>
  </div>
);

const ErrorMessage = ({ msg }) => (
  <div className="flex items-start gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-sm">
      ⚠️
    </div>
    <div className="flex flex-col gap-1 max-w-[85%]">
      <span className="text-xs font-semibold text-gray-700">Lỗi hệ thống</span>
      <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-red-700">
        {msg.content}
      </div>
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-start gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm text-sm">
      <Bot fill="#fff" size={18} />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-700">Trợ lý Thchi</span>
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ChatPanel = () => {
  const { isOpen, close, messages, addMessage } = useChatWidgetStore();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    addMessage({ role: "user", content: text, time: getTime() });
    setInput("");
    setIsSending(true);

    const historyChat = messages
      .filter(
        (msg) =>
          msg.role === "user" || msg.role === "assistant" || msg.role === "ai",
      )
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    try {
      const replyText = await aiService.chat(text, historyChat);

      addMessage({
        role: "assistant",
        content: replyText,
        time: getTime(),
      });
    } catch (err) {
      addMessage({
        role: "error",
        content:
          err?.response?.data?.message ||
          "Xin lỗi, không thể kết nối đến AI lúc này.",
        time: getTime(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[85vh] bg-[#f7f7f7] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full p-0.5 shadow-sm">
            <img
              src="/ThChi_AI_CHAT.png"
              alt="AI"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.src = "/useravatar.png";
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide">
              Trợ lý Thchi AI
            </span>
            <span className="text-[11px] text-amber-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
              Đang trực tuyến
            </span>
          </div>
        </div>
        <button
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          onClick={close}
          title="Đóng chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-2 no-scrollbar bg-[#f7f7f7]">
        {messages.length === 0 && (
          <AIMessage
            msg={{
              role: "assistant",
              content:
                "Xin chào! Mình là trợ lý Thchi. Bạn cần hỗ trợ gì về từ vựng, ngữ pháp hay bài tập hôm nay?",
              time: getTime(),
            }}
          />
        )}

        {messages.map((msg, i) => {
          if (msg.role === "assistant" || msg.role === "ai")
            return <AIMessage key={i} msg={msg} />;
          if (msg.role === "user") return <UserMessage key={i} msg={msg} />;
          if (msg.role === "error") return <ErrorMessage key={i} msg={msg} />;
          return null;
        })}

        {isSending && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <div className="bg-white p-3 border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] flex items-center gap-2">
        <input
          type="text"
          className="flex-1 h-[42px] px-4 text-sm text-gray-800 placeholder-gray-400 bg-white border border-gray-200 rounded-2xl outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
          placeholder="Hỏi từ vựng, ngữ pháp, dịch..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          autoComplete="off"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className={`w-[42px] h-[42px] flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-200 ${
            input.trim() && !isSending
              ? "bg-amber-400 hover:bg-amber-500 text-white shadow-sm hover:shadow-md cursor-pointer active:scale-95"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
          title="Gửi (Enter)"
        >
          <Send size={18} className="mr-0.5 mt-0.5" />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;

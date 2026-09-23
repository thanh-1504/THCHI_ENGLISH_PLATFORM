import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ChangeNameModal = ({ currentName = "", onClose, onSave }) => {
  const [value, setValue] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const isDirty = value.trim() !== "" && value.trim() !== currentName;

  const handleSave = async () => {
    if (!isDirty || isLoading) return;
    
    setIsLoading(true);
    try {
      await onSave?.(value.trim());
    } catch (error) {
      console.error("Lỗi khi lưu tên:", error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose?.();
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/40 z-[70]" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-[71] pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl min-w-[35%] pointer-events-auto relative px-8 pt-10 pb-8 flex flex-col gap-6">
          <button
            onClick={onClose}
            className="absolute -top-4 right-3 p-1 rounded-full bg-white cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.102)] active:translate-y-[3px] active:shadow-none transition-all duration-150"
          >
            <X strokeWidth={3.5} size={25} className="text-yellow-400" />
          </button>

          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Cập nhật tên của bạn
          </h2>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Nhập tên mới..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-base outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-150 disabled:bg-gray-50 disabled:text-gray-400"
          />

          <button
            onClick={handleSave}
            disabled={!isDirty || isLoading}
            className={`
              w-1/2 py-3 rounded-full text-base font-semibold flex items-center justify-center h-[48px]
              transition-all duration-200 mx-auto
              ${
                isLoading
                  ? "bg-(image:--my-gradient) text-white shadow-none translate-y-[3px] cursor-wait opacity-90"
                  : isDirty
                  ? "bg-(image:--my-gradient) text-white shadow-[0_5px_0_#1f8f2f] hover:opacity-90 active:shadow-none active:translate-y-[3px] cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <div className="flex space-x-1.5 items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              </div>
            ) : (
              "Lưu"
            )}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ChangeNameModal;
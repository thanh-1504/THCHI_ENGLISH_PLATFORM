import { Sparkles, X, Loader2 } from "lucide-react";
import { useState } from "react";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const AIGenerateVocabModal = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  defaultTopic,
}) => {
  const [topic, setTopic] = useState(defaultTopic || "");
  const [level, setLevel] = useState("A1");
  const [quantity, setQuantity] = useState(10);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic: topic.trim(), level, quantity });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={!isGenerating ? onClose : undefined}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={20} className="text-gray-800" />
            Tạo từ vựng AI
          </h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Chủ đề */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Chủ đề
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Gia đình, Du lịch..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all text-sm"
                required
                disabled={isGenerating}
              />
            </div>

            {/* Cột Level và Số lượng */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Trình độ (Level)
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all text-sm bg-white cursor-pointer"
                  disabled={isGenerating}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số lượng
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all text-sm"
                  required
                  disabled={isGenerating}
                />
              </div>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex justify-center items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Tạo từ vựng
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateVocabModal;
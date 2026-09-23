import { useNavigate } from "react-router-dom";

const PracticeCard = ({ mode }) => {
  const navigate = useNavigate();
  const { theme, comingSoon } = mode;

  const handleClick = () => {
    if (comingSoon) return;
    navigate(mode.to);
  };

  return (
    <div
      style={{
        background: theme.cardBg,
        border: `1.5px solid ${theme.cardBorder}`,
      }}
      className="relative flex flex-col rounded-2xl overflow-hidden shadow-md
                 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div
          className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ background: theme.accent }}
        >
          Sắp ra mắt
        </div>
      )}

      {/* Image area */}
      <div
        className="relative flex items-end justify-center pt-4 pb-0 overflow-hidden"
        style={{ minHeight: "190px" }}
      >
        {/* Decorative soft circle behind image */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-36 rounded-full opacity-30 blur-2xl"
          style={{ background: theme.accent }}
        />
        <img
          src={mode.image}
          alt={mode.imageAlt}
          draggable={false}
          className="relative z-10 h-44 w-auto object-contain drop-shadow-lg
                     transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 px-6 pt-5 pb-6 gap-3">
        {/* Title */}
        <h2
          className="text-lg font-bold text-center leading-snug"
          style={{ color: theme.titleColor }}
        >
          {mode.number}. {mode.title}
        </h2>

        {/* Description */}
        <p className="text-[13.5px] text-gray-500 text-center leading-relaxed flex-1">
          {mode.description}
        </p>

        {/* CTA Button */}
        <button
          disabled={comingSoon}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`mt-2 w-full flex items-center justify-center gap-1.5
                      rounded-xl py-2.5 px-2 font-semibold text-sm
                      border-2 transition-all duration-200
                      ${
                        comingSoon
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:brightness-95 cursor-pointer active:scale-95"
                      }`}
          style={{
            borderColor: theme.buttonBorder,
            color: theme.buttonText,
            background: theme.buttonBg,
          }}
        >
          {mode.buttonLabel}
          {!comingSoon && (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          {comingSoon && (
            <span className="ml-1 text-xs font-normal opacity-70">
              (Đang phát triển)
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
export default PracticeCard;

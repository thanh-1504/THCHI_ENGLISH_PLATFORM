import { useNavigate } from "react-router-dom";

const StatsCard = ({
  variant = "yellow",
  imageURL = "/ThChi.png",
  number = 0,
  label = "từ ôn tập",
  path = "word-status/active",
  className = "",
}) => {
  const navigate = useNavigate();

  const borderVariants = {
    yellow: "border-yellow-400",
    blue: "border-blue-300",
    green: "border-green-400",
    red: "border-red-400",
  };

  return (
    <div
      onClick={() => navigate(path)}
      className={`
                bg-stas-card
                rounded-xl
                p-4
                text-center
                border-[1.5px]
                cursor-pointer
                ${borderVariants[variant]}
                ${className}
            `}
    >
      <div>
        <img className="w-50 h-50 object-cover mx-auto" src={imageURL} alt="THCHI" />

        <div>
          <p className="text-xl font-semibold">{number}</p>
          <p className="text-[18px]">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

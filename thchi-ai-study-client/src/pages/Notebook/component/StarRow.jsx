import { Star } from "lucide-react";

const StarRow = ({ filledCount }) => (
  <div className="flex items-center justify-center gap-x-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={9}
        fill={i < filledCount ? "#ffcb08" : "none"}
        strokeWidth={i < filledCount ? 0 : 1.5}
        className={i < filledCount ? "text-[#ffcb08]" : "text-gray-300"}
      />
    ))}
  </div>
);

export default StarRow;

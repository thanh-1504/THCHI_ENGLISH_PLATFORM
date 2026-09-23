import { Star } from "lucide-react";

const ScopeBadge = ({ isPremium }) =>
  isPremium ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full">
      <Star size={11} fill="currentColor" />
      Premium
    </span>
  ) : (
    <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
      Free
    </span>
  );
export default ScopeBadge;

import TIER_META from "../../../utils/rankConfig";

const TierBadge = ({ tier }) => {
  const meta = TIER_META[tier] || {};
  return (
    <span className="text-sm font-semibold text-gray-900">
      {meta.label}
    </span>
  );
};
export default TierBadge;

const RankBadge = ({ rank }) => {
  const configs = {
    1: { bg: "bg-yellow-400", numColor: "text-white" },
    2: { bg: "bg-gray-300", numColor: "text-gray-600" },
    3: { bg: "bg-amber-600", numColor: "text-white" },
  };
  const c = configs[rank];
  if (!c) return null;
  return (
    <div
      className={`w-7 h-7 flex items-center justify-center ${c.bg} rounded-full border-2 border-white shadow-md z-10`}
    >
      <span className={`text-xs font-extrabold ${c.numColor}`}>{rank}</span>
    </div>
  );
};

export default RankBadge;

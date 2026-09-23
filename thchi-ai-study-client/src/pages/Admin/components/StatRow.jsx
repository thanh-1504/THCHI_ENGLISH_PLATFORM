const StatRow = ({ icon: Icon, label, value, iconColor = "text-gray-400" }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2">
      <Icon size={15} className={iconColor} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-800">
      {value ? value.toLocaleString() : 0}
    </span>
  </div>
);
export default StatRow;

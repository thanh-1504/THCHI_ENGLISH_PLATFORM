const QuickStatCard = ({ icon: Icon, iconBg, iconColor, label, value }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}
    >
      <Icon size={22} className={iconColor} />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-800">
        {value !== null && value !== undefined
          ? value.toLocaleString("vi-VN")
          : "—"}
      </p>
    </div>
  </div>
);
export default QuickStatCard;

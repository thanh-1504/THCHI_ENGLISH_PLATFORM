import { ArrowDown, ArrowUp } from "lucide-react";

const StatCard = ({ icon: Icon, iconBg, label, value, change, positive }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
    {change !== undefined && (
      <div className="flex items-center gap-1">
        {positive ? (
          <ArrowUp size={14} className="text-green-500" />
        ) : (
          <ArrowDown size={14} className="text-red-400" />
        )}
        <span
          className={`text-xs font-semibold ${positive ? "text-green-500" : "text-red-400"}`}
        >
          {change}
        </span>
        <span className="text-xs text-gray-400 ml-1">so với tháng trước</span>
      </div>
    )}
  </div>
);
export default StatCard;

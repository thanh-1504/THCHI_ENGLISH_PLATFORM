import { formatCurrency } from "../../../utils/format";

const CustomTooltipRevenue = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-yellow-600">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};
export default CustomTooltipRevenue;
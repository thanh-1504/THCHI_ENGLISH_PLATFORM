const InfoRow = ({
  icon: Icon,
  label,
  value,
  valueClass = "",
  variant = "between",
}) => {
  // Giao diện 1: Dành cho trang rộng (có icon, độ rộng label cố định w-44)
  if (variant === "fixed-label") {
    return (
      <div className="flex items-start py-3 border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-2 w-44 flex-shrink-0">
          {Icon && <Icon size={14} className="text-gray-400" />}
          <span className="text-sm text-gray-500">{label}:</span>
        </div>
        <span className={`text-sm font-medium text-gray-800 ${valueClass}`}>
          {value}
        </span>
      </div>
    );
  }

  // Giao diện 2: Dành cho không gian hẹp như Modal (MẶC ĐỊNH - đẩy label và value ra 2 bên)
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-gray-400" />}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span
        className={`text-sm font-medium text-gray-700 text-right max-w-[60%] break-words ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
};

export default InfoRow;

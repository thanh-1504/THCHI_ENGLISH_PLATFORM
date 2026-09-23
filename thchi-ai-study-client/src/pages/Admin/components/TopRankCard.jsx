const TopRankCard = ({ title, icon: Icon, items, valueKey, valueSuffix }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
        <Icon size={16} className="text-yellow-500" />
        {title}
      </h2>
    </div>
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">Chưa có dữ liệu</p>
      )}
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                ${item.rank === 1 ? "bg-yellow-400" : item.rank === 2 ? "bg-gray-400" : "bg-orange-300"}`}
            >
              {item.rank}
            </span>
            <span className="text-sm text-gray-700 font-medium truncate max-w-[130px]">
              {item.name}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {(item[valueKey] ?? 0).toLocaleString()} {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  </div>
);
export default TopRankCard;
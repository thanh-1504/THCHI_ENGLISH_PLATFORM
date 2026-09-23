const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatMillions = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value;
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

const formatStatus = (status) => {
  if (status === "SUCCESS") return "Thành công";
  if (status === "FAILED") return "Thất bại";
  if (status === "PENDING") return "Đang xử lý";
  return status;
};

const formatDateStr = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (secs) => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};


export {
  formatCurrency,
  formatDateStr,
  formatMillions,
  formatPrice,
  formatStatus,
  formatTime,
};

import React from 'react';

const STATUS_CONFIG = {
  // --- Trạng thái tài khoản / Gói Premium ---
  ACTIVE: { label: "Hoạt động", className: "bg-green-100 text-green-600" },
  INACTIVE: { label: "Bị khóa", className: "bg-red-100 text-red-500" },
  BANNED: { label: "Bị cấm", className: "bg-red-100 text-red-500" },

  // --- Trạng thái giao dịch ---
  SUCCESS: { label: "Thành công", className: "bg-green-100 text-green-600" },
  PENDING: { label: "Đang xử lý", className: "bg-yellow-100 text-yellow-600" },
  FAILED: { label: "Thất bại", className: "bg-red-100 text-red-500" },

  // --- Trạng thái bài viết (Posts) ---
  APPROVED: { 
    label: "Đã duyệt", 
    className: "bg-green-100 text-green-700 border border-green-200" 
  },
  POST_PENDING: { 
    label: "Chờ duyệt", 
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200" 
  },
  REJECTED: { 
    label: "Từ chối", 
    className: "bg-red-100 text-red-600 border border-red-200" 
  },
};

const StatusBadge = ({ status, isPost = false }) => {
  let normalizedStatus = status === "BANED" ? "BANNED" : status;
  
  if (isPost && status === "PENDING") {
    normalizedStatus = "POST_PENDING";
  }

  const config = STATUS_CONFIG[normalizedStatus] || {
    label: status || "Không xác định",
    className: "bg-gray-100 text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
import {
  CreditCard,
  History,
  Info,
  Landmark,
  QrCode,
  TrendingUp,
} from "lucide-react";

// Config Free Limit
export const FREE_LIMIT = 6;

// Config Pagination
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

// Config constants for page Admin User
export const TABS = [
  { id: "info", label: "Thông tin chung", icon: Info },
  { id: "progress", label: "Tiến độ học tập", icon: TrendingUp },
  { id: "history", label: "Lịch sử giao dịch", icon: History },
  { id: "premium", label: "Thông tin gói Premium", icon: CreditCard },
];

// Config constants for page Admin Premium
export const DURATION_OPTIONS = [
  { value: "THREE_MONTHS", label: "3 Tháng" },
  { value: "ONE_YEAR", label: "1 Năm" },
];

// Config Payment method
export const PAYMENT_METHODS = [
  {
    id: "SEPAY",
    label: "Chuyển khoản QR",
    desc: "Quét mã QR — xác nhận tức thì",
    icon: QrCode,
    badge: "Phổ biến",
    badgeColor: "bg-[#e8f8ee] text-[#1eb54b]",
  },
  {
    id: "VNPAY",
    label: "VNPay",
    desc: "Thẻ ATM, Internet Banking, QR VNPay",
    icon: Landmark,
  },
];

// Config constants for page Rank
export const TIER_LABELS = {
  BRONZE: "Đồng",
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch Kim",
  DIAMOND: "Kim Cương",
  MASTER: "Master",
};

export const CONFETTI = [
  { color: "bg-yellow-300", top: "8%", left: "6%" },
  { color: "bg-blue-300", top: "12%", left: "18%" },
  { color: "bg-pink-300", top: "6%", left: "32%" },
  { color: "bg-green-300", top: "14%", right: "28%" },
  { color: "bg-purple-300", top: "8%", right: "14%" },
  { color: "bg-yellow-400", top: "18%", right: "6%" },
  { color: "bg-pink-200", top: "22%", left: "8%" },
  { color: "bg-blue-200", top: "20%", right: "22%" },
];

export const PODIUM_STYLES = [
  {
    rank: 2,
    containerMargin: "mt-0",
    avatarRing: "ring-[5px] ring-gray-300",
    showCrown: false,
    platformHeight: "h-28",
    platformBg: "bg-gray-200/80",
    numberColor: "text-gray-400/40",
  },
  {
    rank: 1,
    containerMargin: "-mt-8 z-10",
    avatarRing: "ring-[5px] ring-yellow-400",
    showCrown: true,
    platformHeight: "h-40",
    platformBg: "bg-yellow-200/80",
    numberColor: "text-yellow-500/40",
  },
  {
    rank: 3,
    containerMargin: "mt-0",
    avatarRing: "ring-[5px] ring-amber-600/80",
    showCrown: false,
    platformHeight: "h-24",
    platformBg: "bg-orange-200/70",
    numberColor: "text-orange-500/40",
  },
];

export const PLACEHOLDER_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-green-600",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

export const GOALS = [
  { id: 1, days: 7, shields: 1 },
  { id: 2, days: 14, shields: 2 },
  { id: 3, days: 30, shields: 5 },
];

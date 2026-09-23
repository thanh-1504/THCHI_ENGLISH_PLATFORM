import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock,
  CreditCard,
  History,
  Lock,
  Mail,
  Pencil,
  Shield,
  TrendingUp,
  User,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import adminService from "../../services/admin.service";
import { TABS } from "../../utils/config.constant";
import InfoRow from "./components/InforRow";
import StatRow from "./components/StatRow";
import StatusBadge from "./components/StatusBadge";

const getAvatarColor = (name) => {
  const colors = [
    "bg-blue-400",
    "bg-purple-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-orange-400",
  ];
  if (!name) return colors[0];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserDetail(id);
      setUser(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUserDetail();
  }, [id]);

  const handleLock = async () => {
    if (!user) return;
    try {
      const isLocking = user.status === "ACTIVE";
      const result = await Swal.fire({
        title: isLocking ? "Khóa tài khoản?" : "Mở khóa tài khoản?",
        text: isLocking
          ? "Người dùng này sẽ không thể đăng nhập vào hệ thống."
          : "Người dùng sẽ có thể đăng nhập lại bình thường.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#eab308",
        cancelButtonColor: "#d1d5db",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        const newStatus = isLocking ? "INACTIVE" : "ACTIVE";
        await adminService.updateUserStatus(id, { status: newStatus });
        await Swal.fire({
          title: "Thành công!",
          text: isLocking
            ? "Đã khóa tài khoản thành công."
            : "Đã mở khóa tài khoản thành công.",
          icon: "success",
          confirmButtonColor: "#eab308",
        });

        fetchUserDetail();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <User size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Không tìm thấy người dùng</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="mt-4 px-4 py-2 bg-yellow-400 text-white font-semibold rounded-xl hover:bg-yellow-500 transition"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const avatarColor = getAvatarColor(user.name);
  const avatarInitials = getInitials(user.name);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-5">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Chi tiết người dùng
          </h1>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mt-1">
            <button
              onClick={() => navigate("/admin/users")}
              className="text-sm text-yellow-500 hover:text-yellow-600 font-medium transition-colors cursor-pointer"
            >
              Quản lý người dùng
            </button>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-sm text-gray-400">Chi tiết người dùng</span>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer bg-white shadow-sm"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <button
            onClick={handleLock}
            className={`flex items-center gap-2 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer shadow-sm ${
              user.status === "ACTIVE"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <Lock size={16} />
            {user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          </button>
          <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer shadow-sm">
            <Pencil size={16} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-4 gap-5 items-start">
        {/* ── Left: User Card + Tabs ── */}
        <div className="col-span-1 space-y-4">
          {/* User Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div
              className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4 ring-4 ring-white ring-offset-2 ring-offset-gray-50`}
            >
              {avatarInitials}
            </div>
            <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>

            <div className="mt-3">
              <StatusBadge status={user.status} />
            </div>
          </div>

          {/* Tab Menu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all cursor-pointer
                    ${idx !== TABS.length - 1 ? "border-b border-gray-50" : ""}
                    ${
                      isActive
                        ? "bg-yellow-50 text-yellow-600 border-l-[3px] border-l-yellow-400"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                  <Icon
                    size={16}
                    className={isActive ? "text-yellow-500" : "text-gray-400"}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Content ── */}
        <div className="col-span-3 space-y-4">
          {/* ── Tab: Thông tin chung ── */}
          {activeTab === "info" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* General Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <User size={17} className="text-yellow-500" />
                    Thông tin chung
                  </h3>
                  <InfoRow
                    icon={UserCheck}
                    label="Họ và tên"
                    value={user.name}
                  />
                  <InfoRow icon={Mail} label="Email" value={user.email} />

                  <InfoRow
                    icon={Clock}
                    label="Ngày tạo tài khoản"
                    value={new Date(user.createdAt).toLocaleString("vi-VN")}
                  />
                  <InfoRow icon={Shield} label="Vai trò" value={user.role} />
                </div>

                {/* Learning Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <TrendingUp size={17} className="text-yellow-500" />
                    Thống kê học tập
                  </h3>
                  <StatRow
                    icon={BookOpen}
                    label="Tổng khóa học đã học"
                    value={user.stats?.totalCourses}
                    iconColor="text-blue-400"
                  />
                  <StatRow
                    icon={BookOpen}
                    label="Từ vựng đã lưu"
                    value={user.stats?.totalWordsSaved}
                    iconColor="text-green-500"
                  />
                </div>
              </div>

              {/* Premium Info */}
              {user.premiumPlan?.isActive ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-700 mb-5 flex items-center gap-2">
                    <CreditCard size={17} className="text-yellow-500" />
                    Gói Premium hiện tại
                  </h3>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Gói</p>
                      <p className="text-sm font-bold text-gray-700">
                        {user.premiumPlan.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Ngày bắt đầu</p>
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(
                          user.premiumPlan.startDate,
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Ngày hết hạn</p>
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(user.premiumPlan.endDate).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
                      <StatusBadge status={"ACTIVE"} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                  <CreditCard
                    size={32}
                    className="mx-auto text-gray-300 mb-2"
                  />
                  <p className="text-sm text-gray-400 font-medium">
                    Người dùng chưa đăng ký gói Premium
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── Tab: Tiến độ học tập ── */}
          {activeTab === "progress" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <TrendingUp size={48} className="mx-auto text-yellow-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700 mb-1">
                Tiến độ học tập
              </h3>
              <p className="text-sm text-gray-400">
                Dữ liệu tiến độ học tập của{" "}
                <span className="font-semibold text-gray-600">{user.name}</span>
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 max-w-lg mx-auto">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {user.stats?.totalCourses || 0}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Khóa học tham gia
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-600">
                    {(user.stats?.totalWordsSaved || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-500 mt-1">Từ vựng đã lưu</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Lịch sử giao dịch ── */}
          {activeTab === "history" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <History size={17} className="text-yellow-500" />
                  Lịch sử giao dịch
                </h3>
              </div>
              {user.transactions && user.transactions.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Mã GD", "Gói", "Số tiền", "Trạng thái", "Ngày GD"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {user.transactions.map((txn) => (
                      <tr
                        key={txn.id}
                        className="border-t border-gray-50 hover:bg-yellow-50/30"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span
                            className="truncate max-w-[100px] inline-block"
                            title={txn.id}
                          >
                            {txn.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                          {txn.plan}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                          {txn.amount.toLocaleString()}₫
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={txn.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(txn.createdAt).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center">
                  <History size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">Chưa có giao dịch nào</p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Thông tin gói Premium ── */}
          {activeTab === "premium" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-700 mb-5 flex items-center gap-2">
                <CreditCard size={17} className="text-yellow-500" />
                Thông tin gói Premium
              </h3>
              {user.premiumPlan?.isActive ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-5 text-white shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">Gói hiện tại</p>
                        <p className="text-2xl font-bold mt-1">
                          {user.premiumPlan.name}
                        </p>
                      </div>
                      <CreditCard
                        size={40}
                        className="text-yellow-200 opacity-70"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-5 border-t border-yellow-300/50 pt-4">
                      <div>
                        <p className="text-yellow-100 text-xs">Bắt đầu</p>
                        <p className="font-semibold mt-0.5">
                          {new Date(
                            user.premiumPlan.startDate,
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-yellow-100 text-xs">Hết hạn</p>
                        <p className="font-semibold mt-0.5">
                          {new Date(
                            user.premiumPlan.endDate,
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-yellow-100 text-xs">Trạng thái</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mt-0.5">
                          Hoạt động
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <p className="text-sm text-yellow-700 font-medium">
                      💡 Quyền lợi gói Premium
                    </p>
                    <ul className="mt-2 space-y-1">
                      {[
                        "Truy cập không giới hạn tất cả khóa học",
                        "Luyện tập flashcard không giới hạn",
                        "Xem báo cáo học tập chi tiết",
                        "Ưu tiên hỗ trợ từ đội ngũ THCHI",
                      ].map((item) => (
                        <li
                          key={item}
                          className="text-sm text-yellow-700 flex items-center gap-2"
                        >
                          <span className="text-yellow-500">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <CreditCard
                    size={48}
                    className="mx-auto text-gray-300 mb-3"
                  />
                  <p className="text-sm text-gray-500 font-medium">
                    Người dùng chưa có gói Premium
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;

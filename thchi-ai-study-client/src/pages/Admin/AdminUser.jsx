import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Lock,
  Plus,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import adminService from "../../services/admin.service";
import ITEMS_PER_PAGE_OPTIONS from "../../utils/paginationConstants";
import AddUserModal from "./components/AddUserModal";
import RoleBadge from "./components/RoleBadge";
import StatusBadge from "./components/StatusBadge";

const Avatar = ({ initials }) => {
  const colors = [
    "bg-blue-400",
    "bg-purple-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-orange-400",
  ];
  const charCode = initials ? initials.charCodeAt(0) : 0;
  const color = colors[charCode % colors.length];
  return (
    <div
      className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
    >
      {initials || "?"}
    </div>
  );
};

const AdminUser = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const fetchUsers = async ({
    page = currentPage,
    limit = itemsPerPage,
    search = searchText,
    role = roleFilter,
    status = statusFilter,
  } = {}) => {
    try {
      const params = {
        page,
        limit,
      };
      if (search) params.name_email = search;
      if (role !== "ALL") params.role = role;
      if (status !== "ALL") params.status = status;

      const data = await adminService.getUsers(params);
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / itemsPerPage));

  const handleLock = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Khóa người dùng?",
        text: "Người dùng này sẽ không thể đăng nhập vào hệ thống.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#eab308",
        cancelButtonColor: "#d1d5db",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        await adminService.updateUserStatus(id, { status: "INACTIVE" });
        toast.success("Đã khóa tài khoản thành công");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi khóa tài khoản");
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchUsers({ page: 1 });
  };

  const handleResetFilters = () => {
    setSearchText("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
    fetchUsers({ page: 1, search: "", role: "ALL", status: "ALL" });
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  return (
    <>
      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setCurrentPage(1);
          fetchUsers();
        }}
      />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Quản lý người dùng
            </h1>
          </div>
        </div>

        {/* ── Search & Filter Bar ── */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full lg:flex-1 lg:min-w-[240px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm kiếm theo email, tên người dùng..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all bg-gray-50"
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="hidden lg:block border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer min-w-[150px]"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="USER">User</option>
              <option value="PREMIUM">Premium</option>
              <option value="ADMIN">Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hidden lg:block border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer min-w-[160px]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Bị khóa</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={handleFilter}
              className="hidden lg:flex items-center gap-2 border border-yellow-400 text-yellow-600 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-yellow-50 transition-colors cursor-pointer"
            >
              <Filter size={15} />
              Lọc
            </button>

            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden w-full flex items-center justify-center gap-2 border border-yellow-400 text-yellow-600 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-yellow-50 transition-colors"
            >
              <Filter size={16} />
              Bộ lọc
              {(roleFilter !== "ALL" || statusFilter !== "ALL") && (
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
              )}
            </button>

            {/* Add User Button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer lg:ml-auto shadow-sm"
            >
              <Plus size={16} />
              Thêm người dùng
            </button>
          </div>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Đóng bộ lọc"
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-black/40"
            />
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Bộ lọc người dùng"
              className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Bộ lọc</h2>
                <button
                  type="button"
                  aria-label="Đóng bộ lọc"
                  onClick={() => setShowMobileFilters(false)}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Vai trò
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="USER">User</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Bị khóa</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setShowMobileFilters(false);
                  }}
                  className="min-h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
                >
                  Đặt lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFilter();
                    setShowMobileFilters(false);
                  }}
                  className="min-h-11 rounded-xl bg-yellow-400 text-sm font-semibold text-white hover:bg-yellow-500"
                >
                  Áp dụng
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── Mobile User Cards ── */}
        <div className="lg:hidden space-y-3">
          {users.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 text-sm">
              <UserPlus size={36} className="mx-auto mb-3 opacity-30" />
              Không tìm thấy người dùng nào
            </div>
          ) : (
            users.map((user) => (
              <article
                key={user.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <Avatar initials={user.name?.charAt(0)?.toUpperCase()} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-gray-700 truncate">
                      {user.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Xem chi tiết ${user.name}`}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    {user.status === "ACTIVE" && (
                      <button
                        type="button"
                        aria-label={`Khóa ${user.name}`}
                        onClick={() => handleLock(user.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Lock size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <StatusBadge status={user.status} />
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Tạo ngày: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </article>
            ))
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                Hiển thị {totalUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                –{Math.min(currentPage * itemsPerPage, totalUsers)} / {totalUsers.toLocaleString()}
              </span>
              <label className="flex items-center gap-1.5 whitespace-nowrap">
                <span>Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="min-h-10 px-3 inline-flex items-center gap-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={17} />
                Trước
              </button>
              <span className="text-sm font-medium text-gray-600">
                Trang {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="min-h-10 px-3 inline-flex items-center gap-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Data Table ── */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[15%]">
                    Người dùng
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[25%]">
                    Email
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[15%]">
                    Vai trò
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[15%]">
                    Trạng thái
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[15%]">
                    Ngày tạo
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[15%]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      <UserPlus size={36} className="mx-auto mb-3 opacity-30" />
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-yellow-50/30 transition-colors duration-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      }`}
                    >
                      {/* Name + Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={user.name?.charAt(0)?.toUpperCase()}
                          />
                          <span
                            className="text-sm font-semibold text-gray-700 truncate max-w-[120px] inline-block"
                            title={user.name}
                          >
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span
                          className="truncate max-w-[180px] inline-block"
                          title={user.email}
                        >
                          {user.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <button
                            title="Xem chi tiết"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          {/* Lock User */}
                          {user.status === "ACTIVE" && (
                            <button
                              title="Khóa người dùng"
                              onClick={() => handleLock(user.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            >
                              <Lock size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            {/* Info */}
            <p className="text-sm text-gray-500">
              Hiển thị{" "}
              <span className="font-semibold text-gray-700">
                {totalUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
                {Math.min(currentPage * itemsPerPage, totalUsers)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-gray-700">
                {totalUsers.toLocaleString()}
              </span>
            </p>

            <ReactPaginate.default
              pageCount={totalPages}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              forcePage={currentPage - 1}
              onPageChange={handlePageChange}
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              containerClassName="flex items-center gap-1"
              pageClassName=""
              pageLinkClassName="w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              activeClassName=""
              activeLinkClassName="!bg-yellow-400 !text-white shadow-sm"
              previousClassName=""
              previousLinkClassName="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold"
              nextClassName=""
              nextLinkClassName="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold"
              breakClassName=""
              breakLinkClassName="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
              disabledClassName="opacity-30 pointer-events-none"
              disabledLinkClassName="cursor-not-allowed"
            />

            {/* Items per page */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
              >
                {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUser;

import {
  ChevronLeft,
  ChevronRight,
  Lock,
  LockOpen,
  Pencil,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import premiumService from "../../services/premium.service";
import { ITEMS_PER_PAGE_OPTIONS } from "../../utils/config.constant";
import { formatPrice } from "../../utils/format";
import StatusBadge from "./components/StatusBadge";
import PlanModal from "./components/PlanModal";

const durationMap = {
  THREE_MONTHS: "3 Tháng",
  ONE_YEAR: "1 Năm",
};

const AdminPremium = () => {
  const [plans, setPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await premiumService.getAllPlans(
        currentPage + 1,
        itemsPerPage,
      );
      setPlans(res.data);
      setTotalItems(res.total);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách gói premium");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = ({ selected }) => setCurrentPage(selected);

  const handleToggleStatus = async (plan) => {
    try {
      const isLocking = plan.isActive;
      const result = await Swal.fire({
        title: isLocking ? "Khóa gói này?" : "Mở khóa gói này?",
        text: isLocking
          ? "Gói sẽ không hiển thị cho người dùng mua nữa."
          : "Gói sẽ được hiển thị lại cho người dùng.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#eab308",
        cancelButtonColor: "#d1d5db",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        await premiumService.togglePlanStatus(plan.id);
        toast.success(
          isLocking
            ? "Đã khóa gói Premium thành công"
            : "Đã mở khóa gói Premium thành công",
        );
        fetchPlans();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const offset = currentPage * itemsPerPage;
  useEffect(() => {
    fetchPlans();
  }, [currentPage, itemsPerPage]);
  return (
    <>
      {/* Modals */}
      <PlanModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onSuccess={fetchPlans}
        editData={null}
      />
      {editModal && (
        <PlanModal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          onSuccess={fetchPlans}
          editData={editModal}
        />
      )}

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* ── Page Header ── */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Quản lý gói Premium
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setAddModal(true)}
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            Thêm gói Premium
          </button>
        </div>

        {/* ── Mobile Plan Cards ── */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 text-sm">
              Chưa có gói Premium nào
            </div>
          ) : (
            plans.map((plan) => (
              <article
                key={plan.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${
                  plan.isActive ? "" : "opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-gray-800 truncate">
                      {plan.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {durationMap[plan.duration] || plan.duration}
                    </p>
                  </div>
                  <StatusBadge status={plan.isActive ? "ACTIVE" : "INACTIVE"} />
                </div>

                {plan.badge && (
                  <span className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                    {plan.badge}
                  </span>
                )}

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Giá bán</p>
                    <p className="mt-0.5 text-xl font-bold text-gray-800">
                      {formatPrice(plan.price)}
                    </p>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Giá gốc</p>
                      <p className="mt-0.5 text-sm text-gray-400 line-through">
                        {formatPrice(plan.originalPrice)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModal(plan)}
                    className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-400 text-sm font-semibold text-yellow-600 hover:bg-yellow-50"
                  >
                    <Pencil size={16} />
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(plan)}
                    className={`min-h-11 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                      plan.isActive
                        ? "border border-red-200 text-red-500 hover:bg-red-50"
                        : "border border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {plan.isActive ? <Lock size={16} /> : <LockOpen size={16} />}
                    {plan.isActive ? "Khóa gói" : "Mở khóa"}
                  </button>
                </div>
              </article>
            ))
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                Hiển thị {totalItems === 0 ? 0 : offset + 1}–
                {Math.min(offset + itemsPerPage, totalItems)} / {totalItems}
              </span>
              <label className="flex items-center gap-1.5 whitespace-nowrap">
                <span>Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(0);
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
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="min-h-10 px-3 inline-flex items-center gap-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={17} />
                Trước
              </button>
              <span className="text-sm font-medium text-gray-600">
                Trang {currentPage + 1}/{pageCount}
              </span>
              <button
                type="button"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="min-h-10 px-3 inline-flex items-center gap-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {[
                    "Tên gói",
                    "Thời hạn",
                    "Giá bán",
                    "Giá gốc",
                    "Badge",
                    "Trạng thái",
                    "Thao tác",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      Chưa có gói Premium nào
                    </td>
                  </tr>
                ) : (
                  plans.map((plan, idx) => (
                    <tr
                      key={plan.id}
                      className={`hover:bg-yellow-50/30 transition-colors duration-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      }`}
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">
                          {plan.name}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4 text-sm text-gray-600 w-32">
                        {durationMap[plan.duration] || plan.duration}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 w-32">
                        <span className="text-sm font-bold text-gray-700">
                          {formatPrice(plan.price)}
                        </span>
                      </td>

                      {/* Original Price */}
                      <td className="px-6 py-4 w-32">
                        <span className="text-sm text-gray-500 line-through">
                          {plan.originalPrice
                            ? formatPrice(plan.originalPrice)
                            : "-"}
                        </span>
                      </td>

                      {/* Badge */}
                      <td className="px-6 py-4">
                        {plan.badge ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            {plan.badge}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 w-36">
                       <StatusBadge status={plan.isActive ? "ACTIVE" : "INACTIVE"} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 w-24">
                        <div className="flex items-center gap-1">
                          <button
                            title="Chỉnh sửa"
                            onClick={() => setEditModal(plan)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            title={plan.isActive ? "Khóa gói" : "Mở khóa gói"}
                            onClick={() => handleToggleStatus(plan)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              plan.isActive
                                ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                : "text-red-500 hover:text-green-500 hover:bg-green-50"
                            }`}
                          >
                            {plan.isActive ? (
                              <Lock size={15} />
                            ) : (
                              <LockOpen size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            {/* Info */}
            <p className="text-sm text-gray-500">
              Hiển thị{" "}
              <span className="font-semibold text-gray-700">
                {totalItems === 0 ? 0 : offset + 1} –{" "}
                {Math.min(offset + itemsPerPage, totalItems)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-gray-700">{totalItems}</span>
            </p>

            {/* react-paginate */}
            <ReactPaginate.default
              pageCount={pageCount}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              forcePage={currentPage}
              onPageChange={handlePageChange}
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              containerClassName="flex items-center gap-1"
              pageLinkClassName="w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              activeClassName=""
              activeLinkClassName="!bg-yellow-400 !text-white shadow-sm"
              previousClassName=""
              previousLinkClassName="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold"
              nextClassName=""
              nextLinkClassName="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer font-bold"
              breakLinkClassName="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
              disabledLinkClassName="opacity-30 cursor-not-allowed pointer-events-none"
            />

            {/* Items per page */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(0);
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

export default AdminPremium;

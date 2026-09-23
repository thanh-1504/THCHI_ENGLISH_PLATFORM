import { ChevronLeft, ChevronRight, Eye, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import adminService from "../../services/admin.service";
import { ITEMS_PER_PAGE_OPTIONS } from "../../utils/config.constant";
import { formatDateStr, formatPrice } from "../../utils/format";
import DetailTransactionModal from "./components/DetailTransactionModal";
import StatusBadge from "./components/StatusBadge";


const AdminTransaction = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Detail modal
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage + 1,
          limit: itemsPerPage,
        };
        if (search) params.search = search;
        if (planFilter !== "all") params.planName = planFilter;
        if (statusFilter !== "all") params.status = statusFilter;
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const res = await adminService.getTransactions(params);
        if (res && res.data) {
          setTransactions(res.data);
          setTotalItems(res.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [currentPage, itemsPerPage, fetchTrigger]);

  const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = ({ selected }) => setCurrentPage(selected);

  const handleFilter = () => {
    setCurrentPage(0);
    setFetchTrigger((prev) => prev + 1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setPlanFilter("all");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(0);
    setFetchTrigger((prev) => prev + 1);
  };

  const plans = ["Premium 1 Tháng", "Premium 3 Tháng", "Premium 1 Năm"];

  return (
    <>
      <DetailTransactionModal tx={detail} onClose={() => setDetail(null)} />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-x-hidden">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Quản lý giao dịch
          </h1>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:px-5 lg:py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo email, mã giao dịch..."
              className="w-full lg:flex-1 lg:min-w-[200px] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
            />

            {/* Plan filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="hidden lg:block border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer"
            >
              <option value="all">Tất cả gói</option>
              {plans.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hidden lg:block border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="FAILED">Thất bại</option>
            </select>

            {/* From date */}
            <div className="relative hidden lg:block">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="Từ ngày"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer"
              />
            </div>

            {/* To date */}
            <div className="relative hidden lg:block">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="Đến ngày"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer"
              />
            </div>

            {/* Filter button */}
            <button
              onClick={handleFilter}
              className="hidden lg:flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer shadow-sm whitespace-nowrap ml-auto"
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
              {(planFilter !== "all" ||
                statusFilter !== "all" ||
                fromDate ||
                toDate) && <span className="w-2 h-2 rounded-full bg-yellow-400" />}
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
              aria-label="Bộ lọc giao dịch"
              className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Bộ lọc giao dịch</h2>
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
                  Gói Premium
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                  >
                    <option value="all">Tất cả gói</option>
                    {plans.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="SUCCESS">Thành công</option>
                    <option value="PENDING">Đang xử lý</option>
                    <option value="FAILED">Thất bại</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Từ ngày
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    Đến ngày
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                    />
                  </label>
                </div>
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

        {/* ── Mobile Transaction Cards ── */}
        <div className="lg:hidden space-y-3">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 text-sm">
              Đang tải dữ liệu...
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 text-sm">
              Không tìm thấy giao dịch nào
            </div>
          ) : (
            transactions.map((tx) => (
              <article
                key={tx.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Mã giao dịch</p>
                    <h2 className="mt-0.5 text-sm font-bold text-gray-800 truncate">
                      {tx.code}
                    </h2>
                  </div>
                  <StatusBadge status={tx.status} />
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {tx.plan}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {tx.method} · {formatDateStr(tx.createdAt)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-800 whitespace-nowrap">
                    {formatPrice(tx.amount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDetail(tx)}
                  className="mt-4 min-h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-400 text-sm font-semibold text-yellow-600 hover:bg-yellow-50"
                >
                  <Eye size={17} />
                  Xem chi tiết
                </button>
              </article>
            ))
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                Hiển thị {totalItems === 0 ? 0 : currentPage * itemsPerPage + 1}–
                {Math.min((currentPage + 1) * itemsPerPage, totalItems)} / {totalItems}
              </span>
              <label className="flex items-center gap-1.5 whitespace-nowrap">
                <span>Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(0);
                    setFetchTrigger((prev) => prev + 1);
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
                    "Mã giao dịch",
                    "Gói",
                    "Số Tiền",
                    "Phương thức",
                    "Trạng thái",
                    "Ngày",
                    "Thao tác",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      Không tìm thấy giao dịch nào
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => (
                    <tr
                      key={tx.id}
                      className={`hover:bg-yellow-50/30 transition-colors duration-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-700">
                          {tx.code}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {tx.plan}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-700">
                          {formatPrice(tx.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {tx.method}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDateStr(tx.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          title="Xem chi tiết"
                          onClick={() => setDetail(tx)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Hiển thị{" "}
              <span className="font-semibold text-gray-700">
                {totalItems === 0 ? 0 : currentPage * itemsPerPage + 1} –{" "}
                {Math.min((currentPage + 1) * itemsPerPage, totalItems)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-gray-700">{totalItems}</span>
            </p>

            {totalItems > 0 && (
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
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(0);
                  setFetchTrigger((prev) => prev + 1);
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

export default AdminTransaction;

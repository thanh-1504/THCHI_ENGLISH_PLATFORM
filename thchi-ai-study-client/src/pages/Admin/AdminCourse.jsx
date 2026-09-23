import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  LayoutGrid,
  LayoutList,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import courseService from "../../services/course.service";
import ITEMS_PER_PAGE_OPTIONS from "../../utils/paginationConstants";
import CourseModal from "./components/AddEditCourseModal";
import CourseThumb from "./components/CourseThumb";
import ScopeBadge from "./components/ScopeBadge";
import ToggleSwitch from "./components/ToggleSwitch";
import { PLACEHOLDER_COLORS } from "../../utils/config.constant";

const AdminCourse = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState("table");

  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [togglingIds, setTogglingIds] = useState({});
  const [deletingLoading, setDeletingLoading] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);

  // ── Fetch courses ────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await courseService.getAdminCourses({
        page: currentPage + 1,
        limit: itemsPerPage,
      });
      setCourses(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPage(res.totalPage ?? 1);
    } catch (err) {
      setError("Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    if (q && !c.title?.toLowerCase().includes(q)) return false;
    if (scopeFilter === "Premium" && !c.isPremium) return false;
    if (scopeFilter === "Free" && c.isPremium) return false;
    if (statusFilter === "visible" && !c.isPublished) return false;
    if (statusFilter === "hidden" && c.isPublished) return false;
    return true;
  });

  const pageCount = totalPage;
  const safePage = Math.min(currentPage, Math.max(0, pageCount - 1));

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleAdd = async (data) => {
    try {
      await courseService.createCourse(data);
      toast.success("Thêm khóa học thành công!");
      setCurrentPage(0);
      fetchCourses();
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        "Tên khóa học đã tồn tại hoặc có lỗi xảy ra.";
      toast.error(msg);
    }
  };

  const handleEdit = async (data) => {
    try {
      await courseService.updateCourse(editModal.id, data);
      toast.success("Cập nhật khóa học thành công!");
      setEditModal(null);
      fetchCourses();
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        "Tên khóa học đã tồn tại hoặc có lỗi xảy ra.";
      toast.error(msg);
    }
  };

  const handleDelete = async (course) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      html: `Bạn có chắc muốn xóa khóa học <span style="font-weight: 600; color: #374151;">"${course.title}"</span>?<br />Hành động này không thể hoàn tác.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#f3f4f6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      customClass: {
        confirmButton:
          "rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm",
        cancelButton:
          "text-gray-600 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm",
      },
    });

    if (result.isConfirmed) {
      setDeletingLoading(true);
      try {
        await courseService.deleteCourse(course.id);
        toast.success("Xóa khóa học thành công!");
        fetchCourses();
      } catch (err) {
        toast.error("Có lỗi xảy ra khi xóa khóa học.");
      } finally {
        setDeletingLoading(false);
      }
    }
  };

  const togglePublished = async (course) => {
    setTogglingIds((prev) => ({ ...prev, [course.id]: true }));
    try {
      await courseService.updateCourse(course.id, {
        isPublished: !course.isPublished,
      });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, isPublished: !c.isPublished } : c,
        ),
      );
      toast.success("Cập nhật trạng thái thành công!");
    } catch (err) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
    } finally {
      setTogglingIds((prev) => ({ ...prev, [course.id]: false }));
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />

      {/* Modals */}
      <CourseModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onSave={handleAdd}
        editData={null}
      />
      {editModal && (
        <CourseModal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          onSave={handleEdit}
          editData={editModal}
        />
      )}

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-x-hidden">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Quản lý Khóa học
          </h1>
          <button
            onClick={() => setAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-5 py-3 sm:py-2.5 text-sm font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            Thêm khóa học
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:px-5 lg:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên khóa học..."
              className="w-full lg:flex-1 lg:min-w-[200px] border border-gray-200 rounded-xl px-4 py-3 lg:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
            />

            {/* Desktop Filters */}
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="hidden lg:block border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer"
            >
              <option value="all">Tất cả phạm vi</option>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hidden lg:block border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="visible">Đang hiển thị</option>
              <option value="hidden">Đang ẩn</option>
            </select>

            {/* Filter btn Desktop */}
            <button
              onClick={() => {
                setCurrentPage(0);
                fetchCourses();
              }}
              className="hidden lg:flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Filter size={15} />
              Lọc
            </button>

            {/* View toggle (Hidden on Mobile) */}
            <div className="hidden lg:flex ml-auto items-center bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-yellow-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutList size={14} />
                Bảng
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white text-yellow-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutGrid size={14} />
                Card
              </button>
            </div>

            {/* Filter button Mobile */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden w-full flex items-center justify-center gap-2 border border-yellow-400 text-yellow-600 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-yellow-50 transition-colors"
            >
              <Filter size={16} />
              Bộ lọc
              {(scopeFilter !== "all" || statusFilter !== "all") && (
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Filters Bottom Sheet */}
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
              className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                  Bộ lọc khóa học
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Phạm vi
                  <select
                    value={scopeFilter}
                    onChange={(e) => setScopeFilter(e.target.value)}
                    className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                  >
                    <option value="all">Tất cả phạm vi</option>
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
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
                    <option value="visible">Đang hiển thị</option>
                    <option value="hidden">Đang ẩn</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setScopeFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(0);
                    fetchCourses();
                    setShowMobileFilters(false);
                  }}
                  className="min-h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
                >
                  Đặt lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage(0);
                    fetchCourses();
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

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-yellow-400" />
          </div>
        )}

        {/* ── Mobile View: Always 1-column Cards ── */}
        {!loading && (
          <div className="lg:hidden flex flex-col gap-4">
            {filtered.length === 0 ? (
              <p className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
                Không tìm thấy khóa học nào
              </p>
            ) : (
              filtered.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Card Header & Thumbnail */}
                  {course.imageUrl ? (
                    <div className="h-32 overflow-hidden relative">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
                        <ScopeBadge isPremium={course.isPremium} />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-4 flex flex-col gap-2 relative ${
                        PLACEHOLDER_COLORS[
                          course.title?.charCodeAt(0) %
                            PLACEHOLDER_COLORS.length ?? 0
                        ]
                      }`}
                    >
                      <div className="absolute top-2 right-2">
                        <ScopeBadge isPremium={course.isPremium} />
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-extrabold text-white">
                          {course.title?.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">
                          {course.title}
                        </p>
                        {course.subtitle && (
                          <p className="text-white/70 text-xs">
                            {course.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-4 space-y-4">
                    {course.imageUrl && (
                      <div>
                        <h3 className="font-bold text-gray-800 line-clamp-1">
                          {course.title}
                        </h3>
                        {course.subtitle && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {course.subtitle}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={15} className="text-gray-400" />
                        {course.topicCount ?? 0} topic
                      </span>
                      <span>{course.totalWords ?? 0} từ vựng</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={course.isPublished}
                          loading={!!togglingIds[course.id]}
                          onChange={() => togglePublished(course)}
                        />
                        <span className="text-sm text-gray-600">
                          {course.isPublished ? "Đã hiển thị" : "Đang ẩn"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Full Width */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/admin/courses/${course.id}`)}
                        className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Eye size={16} />
                        Chi tiết
                      </button>
                      <button
                        onClick={() => setEditModal(course)}
                        className="flex items-center justify-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Pencil size={16} />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="col-span-2 flex items-center justify-center gap-2 border border-red-100 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Trash2 size={16} />
                        Xóa khóa học
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Mobile Pagination */}
            {total > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>
                    Hiển thị {currentPage * itemsPerPage + 1}–
                    {Math.min((currentPage + 1) * itemsPerPage, total)} / {total}
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(0);
                    }}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white"
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="min-h-10 px-4 inline-flex items-center gap-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40"
                  >
                    <ChevronLeft size={17} /> Trước
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    {currentPage + 1} / {pageCount}
                  </span>
                  <button
                    disabled={currentPage >= pageCount - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="min-h-10 px-4 inline-flex items-center gap-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40"
                  >
                    Sau <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Desktop Table/Grid Views ── */}
        {!loading && (
          <div className="hidden lg:block">
            {viewMode === "table" ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        {[
                          "Khóa học",
                          "Số topic",
                          "Số từ vựng",
                          "Phạm vi",
                          "Trạng thái",
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
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                            Không tìm thấy khóa học nào
                          </td>
                        </tr>
                      ) : (
                        filtered.map((course, idx) => (
                          <tr
                            key={course.id}
                            className={`hover:bg-yellow-50/30 transition-colors duration-100 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                            }`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <CourseThumb course={course} />
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {course.title}
                                  </p>
                                  {course.subtitle && (
                                    <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                                      {course.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1">
                                <BookOpen size={13} className="text-gray-400" />
                                {course.topicCount ?? 0} topic
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600">
                              {course.totalWords ?? 0} từ
                            </td>
                            <td className="px-5 py-4">
                              <ScopeBadge isPremium={course.isPremium} />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <ToggleSwitch
                                  checked={course.isPublished}
                                  loading={!!togglingIds[course.id]}
                                  onChange={() => togglePublished(course)}
                                />
                                <span
                                  className={`text-xs font-medium ${
                                    course.isPublished ? "text-gray-700" : "text-gray-400"
                                  }`}
                                >
                                  {course.isPublished ? "Hiển thị" : "Ẩn"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => setEditModal(course)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all cursor-pointer"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleDelete(course)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.length === 0 ? (
                  <p className="col-span-3 text-center py-16 text-gray-400 text-sm">
                    Không tìm thấy khóa học nào
                  </p>
                ) : (
                  filtered.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                    >
                      {course.imageUrl ? (
                        <div className="h-32 overflow-hidden">
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`px-5 py-4 flex items-center gap-3 ${
                            PLACEHOLDER_COLORS[course.title?.charCodeAt(0) % PLACEHOLDER_COLORS.length ?? 0]
                          }`}
                        >
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-extrabold text-white">
                              {course.title?.slice(0, 3).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{course.title}</p>
                            {course.subtitle && <p className="text-white/70 text-xs">{course.subtitle}</p>}
                          </div>
                        </div>
                      )}
                      <div className="px-5 py-4 space-y-3">
                        {course.imageUrl && (
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{course.title}</p>
                            {course.subtitle && <p className="text-xs text-gray-400 mt-0.5">{course.subtitle}</p>}
                          </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen size={13} className="text-gray-400" />
                            {course.topicCount ?? 0} topic
                          </span>
                          <span>{course.totalWords ?? 0} từ vựng</span>
                          <ScopeBadge isPremium={course.isPremium} />
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                          <ToggleSwitch
                            checked={course.isPublished}
                            loading={!!togglingIds[course.id]}
                            onChange={() => togglePublished(course)}
                          />
                          <div className="flex items-center gap-1">
                            <button onClick={() => navigate(`/admin/courses/${course.id}`)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                              <Eye size={15} />
                            </button>
                            <button onClick={() => setEditModal(course)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all cursor-pointer">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(course)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Desktop Pagination */}
            <div className="flex items-center justify-between mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-sm text-gray-500">
                Tổng <span className="font-semibold text-gray-700">{total}</span> khóa học
              </p>
              <ReactPaginate.default
                pageCount={pageCount}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                forcePage={safePage}
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
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-600 bg-white"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCourse;
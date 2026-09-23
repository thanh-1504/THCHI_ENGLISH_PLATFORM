import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  GripVertical,
  House,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import adminService from "../../services/admin.service";
import courseService from "../../services/course.service";
import ITEMS_PER_PAGE_OPTIONS from "../../utils/paginationConstants";
import LessonModal from "./components/AddEditTopicModal";
import ToggleSwitch from "./components/ToggleSwitch";

const AdminCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courseInfo, setCourseInfo] = useState(null);
  const [topics, setTopics] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [togglingIds, setTogglingIds] = useState({});

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);

  // ── Fetch course info ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseService.getAdminCourseDetail(id);
        setCourseInfo(res);
      } catch {
        console.log("Có lỗi xảy ra thì tải bài học");
      }
    };
    if (id) fetchCourse();
  }, [id]);

  // ── Fetch topics ───────────────────────────────────────────────────────
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await courseService.getAdminCourseTopics(id, {
        page: currentPage + 1,
        limit: itemsPerPage,
      });
      setTopics(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPage(res.totalPage ?? 1);
    } catch {
      setError("Không thể tải danh sách bài học.");
    } finally {
      setLoading(false);
    }
  }, [id, currentPage, itemsPerPage]);

  // ── Client-side filter ─────────────────────────────────────────────────
  const filtered = topics.filter((t) => {
    if (search && !t.title?.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (statusFilter === "visible" && !t.isPremium) return false;
    if (statusFilter === "hidden" && t.isPremium) return false;
    return true;
  });

  const pageCount = totalPage;
  const safePage = Math.min(currentPage, Math.max(0, pageCount - 1));

  // ── CRUD handlers ──────────────────────────────────────────────────────
  const handleAdd = async (payload) => {
    try {
      await adminService.createTopic({ data: payload, courseId: id });
      toast.success("Thêm bài học thành công!");
      setAddModal(false);
      fetchTopics();
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Có lỗi xảy ra khi thêm bài học.";
      toast.error(msg);
      throw err;
    }
  };

  const handleEdit = async (payload) => {
    try {
      await courseService.updateTopic(editModal.id, payload);
      toast.success("Cập nhật bài học thành công!");
      setEditModal(null);
      fetchTopics();
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Có lỗi xảy ra khi cập nhật bài học.";
      toast.error(msg);
      throw err;
    }
  };

  const handleDelete = async (topic) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
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
      try {
        await courseService.deleteTopic(topic.id);
        toast.success("Xóa bài học thành công!");
        fetchTopics();
      } catch (err) {
        toast.error("Có lỗi xảy ra khi xóa bài học.");
      }
    }
  };

  const toggleIsPremium = async (topic) => {
    setTogglingIds((prev) => ({ ...prev, [topic.id]: true }));
    try {
      await courseService.updateTopic(topic.id, {
        isPremium: !topic.isPremium,
      });
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id ? { ...t, isPremium: !t.isPremium } : t,
        ),
      );
    } finally {
      setTogglingIds((prev) => ({ ...prev, [topic.id]: false }));
    }
  };

  const toggleIsPublished = async (topic) => {
    if (!topic.isPublished) {
      if ((topic.wordCount ?? 0) < 5) {
        toast.warning("Không thể xuất bản! Bài học cần ít nhất 5 từ vựng.", {
          toastId: "publish_topic",
        });
        return;
      }
    }

    setTogglingIds((prev) => ({ ...prev, [`publish_${topic.id}`]: true }));
    try {
      await courseService.updateTopic(topic.id, {
        isPublished: !topic.isPublished,
      });
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id ? { ...t, isPublished: !t.isPublished } : t,
        ),
      );
      toast.success(
        !topic.isPublished ? "Đã xuất bản bài học!" : "Đã đưa về bản nháp.",
      );
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái.");
    } finally {
      setTogglingIds((prev) => ({ ...prev, [`publish_${topic.id}`]: false }));
    }
  };

  useEffect(() => {
    if (id) fetchTopics();
  }, [fetchTopics, id]);

  const formatOrderIndex = (index) => {
    return index < 10 ? `0${index}` : index;
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
      <LessonModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onSave={handleAdd}
        editData={null}
        lessonCount={topics.length}
      />
      {editModal && (
        <LessonModal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          onSave={handleEdit}
          editData={editModal}
          lessonCount={topics.length}
        />
      )}

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-x-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin/courses")}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex shrink-0 items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
              >
                <ChevronRight size={16} className="text-gray-500 rotate-180" />
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate pr-2">
                {courseInfo?.title ?? `Khóa học #${id}`}
              </h1>
            </div>
            
            {/* Breadcrumb (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-1.5 mt-2 text-sm text-gray-400">
              <House size={13} />
              <span
                onClick={() => navigate("/admin/courses")}
                className="hover:text-yellow-500 cursor-pointer transition-colors"
              >
                Khóa học
              </span>
              <ChevronRight size={13} />
              <span className="font-medium text-gray-600 truncate max-w-[200px]">
                {courseInfo?.title ?? `Khóa học #${id}`}
              </span>
              <ChevronRight size={13} />
              <span className="text-gray-500">Bài học</span>
            </div>
          </div>
        </div>

        {/* ── Filter + Add button ── */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2 w-full lg:flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Tìm kiếm bài học..."
              className="flex-1 border border-gray-200 bg-white rounded-xl px-4 py-3 lg:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all shadow-sm"
            />
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden shrink-0 w-12 h-[46px] flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm"
            >
              <Filter size={18} />
              {statusFilter !== "all" && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full"></span>
              )}
            </button>
          </div>

          {/* Desktop Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="hidden lg:block border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer shadow-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="visible">Premium (Hiển thị)</option>
            <option value="hidden">Free (Ẩn)</option>
          </select>
          
          <button
            onClick={() => setAddModal(true)}
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-5 py-3 lg:py-2.5 text-sm font-semibold transition-colors cursor-pointer shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Thêm bài học
          </button>
        </div>

        {/* Mobile Filters Bottom Sheet */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-black/40"
            />
            <section
              className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                  Lọc bài học
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-6">
                Phân loại bài học
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                >
                  <option value="all">Tất cả bài học</option>
                  <option value="visible">Chỉ Premium</option>
                  <option value="hidden">Chỉ Free</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(0);
                    setShowMobileFilters(false);
                  }}
                  className="min-h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
                >
                  Đặt lại
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(0);
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

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-yellow-400" />
          </div>
        )}

        {/* ── Mobile View: Cards ── */}
        {!loading && (
          <div className="lg:hidden flex flex-col gap-3">
            {filtered.length === 0 ? (
              <p className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
                Không tìm thấy bài học nào
              </p>
            ) : (
              filtered.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"
                >
                  <div>
                    <h3 className="font-bold text-gray-800 text-base leading-tight">
                      #{formatOrderIndex(topic.orderIndex)} {topic.title}
                    </h3>
                    {topic.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{topic.subtitle}</p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-medium mt-2">
                      <BookOpen size={14} className="text-gray-400" />
                      {topic.wordCount ?? 0} từ
                    </span>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={topic.isPremium}
                          loading={!!togglingIds[topic.id]}
                          onChange={() => toggleIsPremium(topic)}
                        />
                        <span className="text-xs font-semibold text-gray-600">
                          {topic.isPremium ? "Premium" : "Free"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={topic.isPublished}
                          loading={!!togglingIds[`publish_${topic.id}`]}
                          onChange={() => toggleIsPublished(topic)}
                        />
                        <span className={`text-xs font-semibold ${topic.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
                          {topic.isPublished ? "Đã xuất bản" : "Bản nháp"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigate(`manage-topic/${topic.id}`, {
                          state: { topicTitle: topic.title, topicId: topic.id },
                        });
                      }}
                      className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      Xem / Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(topic)}
                      className="bg-red-50 text-red-500 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Xóa
                    </button>
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

        {/* ── Desktop View: Table ── */}
        {!loading && (
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {[
                      "Thứ tự",
                      "Tên bài học",
                      "Số từ vựng",
                      "Phân loại",
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
                        Không tìm thấy bài học nào
                      </td>
                    </tr>
                  ) : (
                    filtered.map((topic, idx) => (
                      <tr
                        key={topic.id}
                        className={`hover:bg-yellow-50/30 transition-colors duration-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <GripVertical size={16} className="text-gray-300 cursor-grab" />
                            <span className="text-sm font-medium text-gray-700">
                              {formatOrderIndex(topic.orderIndex)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm text-gray-700 font-medium">{topic.title}</p>
                            {topic.subtitle && <p className="text-xs text-gray-400 mt-0.5">{topic.subtitle}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen size={13} className="text-gray-400" />
                            {topic.wordCount ?? 0} từ
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <ToggleSwitch
                              checked={topic.isPremium}
                              loading={!!togglingIds[topic.id]}
                              onChange={() => toggleIsPremium(topic)}
                            />
                            <span className={`text-xs font-medium ${topic.isPremium ? "text-yellow-600" : "text-gray-400"}`}>
                              {topic.isPremium ? "Premium" : "Free"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <ToggleSwitch
                              checked={topic.isPublished}
                              loading={!!togglingIds[`publish_${topic.id}`]}
                              onChange={() => toggleIsPublished(topic)}
                            />
                            <span className={`text-xs font-medium ${topic.isPublished ? "text-green-600" : "text-gray-400"}`}>
                              {topic.isPublished ? "Đã xuất bản" : "Bản nháp"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                navigate(`manage-topic/${topic.id}`, {
                                  state: { topicTitle: topic.title, topicId: topic.id },
                                })
                              }
                              title="Xem"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              title="Chỉnh sửa"
                              onClick={() =>
                                navigate(`manage-topic/${topic.id}`, {
                                  state: { topicTitle: topic.title, topicId: topic.id },
                                })
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all cursor-pointer"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              title="Xóa"
                              onClick={() => handleDelete(topic)}
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

            {/* Desktop Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Tổng <span className="font-semibold text-gray-700">{total}</span> topic
              </p>
              <ReactPaginate.default
                pageCount={pageCount}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                forcePage={safePage}
                onPageChange={({ selected }) => setCurrentPage(selected)}
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

export default AdminCourseDetail;
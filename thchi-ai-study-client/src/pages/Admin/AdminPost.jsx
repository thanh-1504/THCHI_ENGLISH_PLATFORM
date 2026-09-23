import {
  Eye,
  Filter,
  Heart,
  MessageCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import adminService from "../../services/admin.service";
import postService from "../../services/post.service";
import { ITEMS_PER_PAGE_OPTIONS } from "../../utils/config.constant";
import Avatar from "../Rank/components/Avatar";
import PostDetailModal from "./components/PostDetailModal";
import StatusBadge from "./components/StatusBadge";

const AdminPost = () => {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter states
  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Detail modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchPosts = async (page = currentPage, limit = itemsPerPage) => {
    try {
      const params = { page, limit };
      if (searchTitle) params.title = searchTitle;
      if (statusFilter) params.status = statusFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const data = await adminService.getPosts(params);
      setPosts(data.data);
      setTotal(data.total);
    } catch {
      toast.error("Không thể tải danh sách bài viết");
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const handleFilter = () => {
    setCurrentPage(1);
    fetchPosts(1, itemsPerPage);
  };

  const handleClearFilter = () => {
    setSearchTitle("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
    setTimeout(() => {
      fetchPosts(1, itemsPerPage);
    }, 0);
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleViewDetail = async (post) => {
    setLoadingDetail(true);
    try {
      const detail = await postService.getPost(post.id);
      setSelectedPost({ ...post, content: detail.content });
    } catch {
      toast.error("Không thể tải chi tiết bài viết");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    );
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => prev - 1);
  };

  const handleQuickStatusChange = async (post, newStatus) => {
    if (post.status === newStatus) return;
    try {
      await adminService.updatePostStatus(post.id, newStatus);
      handleStatusChange(post.id, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleQuickDelete = async (post) => {
    const result = await Swal.fire({
      title: "Xóa bài viết?",
      html: `<p class="text-gray-600 text-sm">Bài viết <strong>"${post.title}"</strong> sẽ bị xóa vĩnh viễn.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      customClass: {
        popup: "!rounded-2xl",
        confirmButton: "!rounded-xl !font-semibold",
        cancelButton: "!rounded-xl !font-semibold",
      },
    });
    if (!result.isConfirmed) return;

    try {
      await adminService.deletePost(post.id);
      handleDelete(post.id);
      toast.success("Đã xóa bài viết thành công");
    } catch {
      toast.error("Xóa bài viết thất bại");
    }
  };

  const hasActiveFilter = searchTitle || statusFilter || fromDate || toDate;

  return (
    <>
      {/* Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Quản lý bài viết
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Kiểm duyệt và quản lý tất cả bài đăng trong hệ thống
            </p>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        {/* <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Tổng bài viết",
              value: total,
              color: "text-gray-800",
              bg: "bg-white",
            },
            {
              label: "Chờ duyệt",
              value: posts.filter((p) => p.status === "PENDING").length,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Đã duyệt",
              value: posts.filter((p) => p.status === "APPROVED").length,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-2xl px-5 py-4 shadow-sm border border-gray-100`}
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div> */}

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-3">
            {/* Search - full width */}
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Tìm theo tiêu đề bài viết..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all bg-gray-50"
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>

            {/* Row 2: Status + Date filters */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="col-span-2 sm:col-span-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer w-full sm:min-w-[170px] sm:w-auto"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>

              {/* From date */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500 font-medium shrink-0">Từ:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-200 rounded-xl px-2 py-2.5 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer w-full"
                />
              </div>

              {/* To date */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500 font-medium shrink-0">Đến:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-200 rounded-xl px-2 py-2.5 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Row 3: Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleFilter}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-yellow-400 text-yellow-600 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-yellow-50 transition-colors cursor-pointer"
              >
                <Filter size={15} />
                Lọc
              </button>

              {hasActiveFilter && (
                <button
                  onClick={handleClearFilter}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition-colors cursor-pointer px-2"
                >
                  <X size={14} />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Data Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[30%]">
                    Bài viết
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[20%]">
                    Tác giả
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[12%]">
                    Trạng thái
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[10%]">
                    Tương tác
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[13%]">
                    Ngày đăng
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-[15%]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <MessageCircle size={28} className="text-gray-300" />
                        </div>
                        <p>Không tìm thấy bài viết nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  posts.map((post, idx) => (
                    <tr
                      key={post.id}
                      className={`hover:bg-yellow-50/30 transition-colors duration-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      }`}
                    >
                      {/* Title + thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt="thumbnail"
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <MessageCircle
                                size={16}
                                className="text-gray-300"
                              />
                            </div>
                          )}
                          <span
                            className="text-sm font-semibold text-gray-700 line-clamp-2 max-w-[200px]"
                            title={post.title}
                          >
                            {post.title}
                          </span>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={post.author?.avatarUrl}
                            name={post.author?.displayName || post.author?.name}
                            size="xs"
                          />
                          <div className="min-w-0">
                            <p
                              className="text-sm font-medium text-gray-700 truncate max-w-[110px]"
                              title={
                                post.author?.displayName || post.author?.name
                              }
                            >
                              {post.author?.displayName || post.author?.name}
                            </p>
                            <p
                              className="text-xs text-gray-400 truncate max-w-[110px]"
                              title={post.author?.email}
                            >
                              {post.author?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={post.status} isPost />
                      </td>

                      {/* Likes + comments */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart size={12} className="text-red-400" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle
                              size={12}
                              className="text-blue-400"
                            />
                            {post.comments}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {/* View detail */}
                          <button
                            title="Xem chi tiết"
                            onClick={() => handleViewDetail(post)}
                            disabled={loadingDetail}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Quick status select */}
                          <select
                            value={post.status}
                            onChange={(e) =>
                              handleQuickStatusChange(post, e.target.value)
                            }
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                            title="Cập nhật trạng thái"
                          >
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="APPROVED">Duyệt</option>
                            <option value="REJECTED">Từ chối</option>
                          </select>

                          {/* Delete */}
                          <button
                            title="Xóa bài viết"
                            onClick={() => handleQuickDelete(post)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< md) */}
          <div className="block md:hidden divide-y divide-gray-100">
            {posts.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle size={28} className="text-gray-300" />
                  </div>
                  <p>Không tìm thấy bài viết nào</p>
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-4 space-y-3 bg-white hover:bg-yellow-50/20 transition-colors">
                  {/* Card Header: thumbnail + title + status */}
                  <div className="flex items-start gap-3">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt="thumbnail"
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={18} className="text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <StatusBadge status={post.status} isPost />
                        <span className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Author row */}
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={post.author?.avatarUrl}
                      name={post.author?.displayName || post.author?.name}
                      size="xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {post.author?.displayName || post.author?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {post.author?.email}
                      </p>
                    </div>
                    {/* Likes + comments */}
                    <div className="ml-auto flex items-center gap-2.5 text-xs text-gray-500 shrink-0">
                      <span className="flex items-center gap-1">
                        <Heart size={12} className="text-red-400" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} className="text-blue-400" />
                        {post.comments}
                      </span>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <button
                      title="Xem chi tiết"
                      onClick={() => handleViewDetail(post)}
                      disabled={loadingDetail}
                      className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Eye size={14} />
                      <span>Xem</span>
                    </button>

                    <select
                      value={post.status}
                      onChange={(e) => handleQuickStatusChange(post, e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                      title="Cập nhật trạng thái"
                    >
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="APPROVED">Duyệt</option>
                      <option value="REJECTED">Từ chối</option>
                    </select>

                    <button
                      title="Xóa bài viết"
                      onClick={() => handleQuickDelete(post)}
                      className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Pagination ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="hidden sm:block text-sm text-gray-500">
              Hiển thị{" "}
              <span className="font-semibold text-gray-700">
                {total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
                {Math.min(currentPage * itemsPerPage, total)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-gray-700">
                {total.toLocaleString()}
              </span>
            </p>

            <div className="flex items-center justify-between sm:justify-end gap-3">
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

              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <span className="hidden sm:inline">Hiển thị</span>
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
                <span className="text-xs text-gray-400">/ trang</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPost;

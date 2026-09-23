import DOMPurify from "dompurify";
import {
  Calendar,
  ChevronLeft,
  Heart,
  MessageCircle,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import adminService from "../../../services/admin.service";
import Avatar from "../../Rank/components/Avatar";
import StatusBadge from "./StatusBadge";

const PostDetailModal = ({ post, onClose, onStatusChange, onDelete }) => {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!post) return null;

  const handleStatusChange = async (newStatus) => {
    if (post.status === newStatus) return;
    setUpdating(true);
    try {
      await adminService.updatePostStatus(post.id, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      onStatusChange(post.id, newStatus);
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Xóa bài viết?",
      text: "Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.",
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

    setDeleting(true);
    try {
      await adminService.deletePost(post.id);
      toast.success("Đã xóa bài viết thành công");
      onDelete(post.id);
      onClose();
    } catch {
      toast.error("Xóa bài viết thất bại");
    } finally {
      setDeleting(false);
    }
  };

  return (
    // Mobile: full-screen sheet (items-end, no padding)
    // Desktop (sm+): centered modal with p-4
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in max-h-[92dvh] sm:max-h-[90vh]">
        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <h3 className="text-base font-bold text-gray-800">
              Chi tiết bài viết
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          {/* Author info — wraps on very small screens */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-50">
            <Avatar
              src={post.author?.avatarUrl}
              name={post.author?.displayName || post.author?.name}
              size="xs"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {post.author?.displayName || post.author?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{post.author?.email}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <StatusBadge status={post.status} isPost />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {post.title}
            </h2>
          </div>

          {/* Image if any */}
          {post.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <img
                src={post.imageUrl}
                alt="post image"
                className="w-full max-h-56 sm:max-h-72 object-cover"
              />
            </div>
          )}

          {/* Content */}
          {post.content && (
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-50 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Heart size={14} className="text-red-400" />
              {post.likes} lượt thích
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={14} className="text-blue-400" />
              {post.comments} bình luận
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
          {/* Status changer */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-medium text-gray-500 shrink-0">
              Trạng thái:
            </span>
            <select
              value={post.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 sm:py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </select>
            {updating && (
              <span className="text-xs text-yellow-600 animate-pulse shrink-0">
                Đang lưu...
              </span>
            )}
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <Trash2 size={14} />
            {deleting ? "Đang xóa..." : "Xóa bài viết"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default PostDetailModal;

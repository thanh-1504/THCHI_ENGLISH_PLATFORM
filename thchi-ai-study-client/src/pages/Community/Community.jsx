import { Bell, CheckCheck, Clock3, Loader2, SquarePen, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLoaderData } from "react-router-dom";
import useCommunityStore from "../../store/useCommunityStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import useUIStore from "../../store/useUIStore";
import AddPostModal from "./AddPostModal";
import CommentModal from "./CommentModal";
import Post from "./components/Post";

/* ─── helper ─────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

/* ─── Notification Item ───────────────────────────────────── */
function NotificationItem({ notification, onRead, onDelete }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group ${
        notification.isRead ? "bg-white" : "bg-blue-50 hover:bg-blue-100"
      } hover:bg-gray-50`}
      onClick={() => !notification.isRead && onRead(notification.id)}
    >
      {/* dot unread */}
      <span
        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
          notification.isRead ? "bg-transparent" : "bg-blue-500"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notification.isRead ? "text-gray-600" : "text-gray-800 font-medium"}`}>
          {notification.content ?? notification.message ?? "Thông báo mới"}
        </p>
        <span className="text-xs text-gray-400 mt-0.5 block">
          {timeAgo(notification.createdAt)}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className="shrink-0 p-1 rounded-lg text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-400 transition-all"
        title="Xóa thông báo"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
const Community = () => {
  const initialPosts = useLoaderData();
  const { isOpenModalComment } = useUIStore();
  const { isAddPost, setIsAddPost, posts, myPosts, setPosts, setMyPosts } =
    useCommunityStore();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const myPostPending = myPosts.filter((post) => post.status === "PENDING").length;

  /* fetch dữ liệu khi mount */
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  /* đóng dropdown khi click ngoài */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (initialPosts) {
      setPosts(initialPosts.posts ?? []);
      setMyPosts(initialPosts.currentUserPost ?? []);
    }
  }, [initialPosts, setPosts, setMyPosts]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="pt-6 min-h-screen">
      {/* THCHI HUB HEADER */}
      <div className="flex items-center gap-4 fixed top-18 z-40 py-5 w-full md:w-[60%] left-1/2 -translate-x-1/2 px-6 pb-4 bg-white border-b border-b-gray-200">
        <button
          onClick={() => setIsAddPost(true)}
          className="bg-blue-600 p-3 rounded-xl text-white cursor-pointer hover:opacity-80 transition-all"
        >
          <SquarePen size={20} />
        </button>
        <span className="font-semibold text-2xl text-gray-800 mx-auto">
          ThchiHub
        </span>

        {/* ── Bell Button + Dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggle}
            className="relative p-3 bg-white shadow-sm cursor-pointer rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Thông báo"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_32px_hsla(210,8%,40%,.18)] border border-gray-100 overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-800 text-sm">
                  Thông báo
                  {unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      title="Đánh dấu tất cả đã đọc"
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10 text-gray-400">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    <span className="text-sm">Đang tải...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                    <Bell size={32} className="opacity-30" />
                    <span className="text-sm">Chưa có thông báo nào</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* ── End Bell ── */}
      </div>

      <div className="py-20">
        {/* THCHI HUB MY POST */}
        <div className="bg-white px-5 border border-gray-100 rounded-2xl p-5 shadow-[0_8px_24px_hsla(210,8%,62%,.2)]">
          {/* THCHI HUB MY POST HEADER*/}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-800">
              Bài viết của tôi
            </span>
            <Link
              to={"my-post"}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          {/* THCHI HUB LIST POST */}
          <Link
            to={"my-post"}
            className="flex items-center mt-4 gap-x-4 border border-gray-100 rounded-2xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-500">
              <Clock3 size={28} />
            </div>
            <div>
              <p className="font-bold text-gray-800">
                Đang chờ xem xét ({myPostPending})
              </p>
              <span className="text-gray-500 text-sm font-medium">
                • {myPosts.length ?? 0} bài viết
              </span>
            </div>
          </Link>
        </div>

        {/* THCHI HUB POST */}
        <div className="mt-6">
          {posts &&
            posts.length > 0 &&
            posts.map((post) => <Post key={post.id} post={post}></Post>)}
        </div>
        <Outlet></Outlet>
      </div>

      {/* MODAL CHI TIẾT BÀI VIẾT / BÌNH LUẬN */}
      {isOpenModalComment && <CommentModal />}
      {/* MODAL Add Post */}
      {isAddPost && <AddPostModal />}
    </div>
  );
};

export default Community;


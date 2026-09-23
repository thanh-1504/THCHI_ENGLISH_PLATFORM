import DOMPurify from "dompurify";
import { MessageCircle, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect } from "react";
import Swal from "sweetalert2";
import postService from "../../../services/post.service";
import useCommunityStore from "../../../store/useCommunityStore";
import useUIStore from "../../../store/useUIStore";
import formatDate from "../../../utils/formatDate";

const MyPost = ({ post = {} }) => {
  const { id, user, imageUrl, content, createdAt, comments, likes, status } =
    post;
  const setIsOpenModalComment = useUIStore(
    (state) => state.setIsOpenModalComment,
  );
  const { setActivePostId, updatePostLike, deletePost } = useCommunityStore();

  const handleRemovePost = () => {
    Swal.fire({
      title: "Xác nhận xoá",
      text: "Bạn có chắc chắn muốn xoá không?",
      showCancelButton: true,
      confirmButtonText: "Xoá bài viết",
      cancelButtonText: "Huỷ bỏ",
      showCloseButton: true,
      buttonsStyling: false,
      customClass: {
        popup: "!rounded-3xl !p-6 !w-[400px]",
        title: "!text-xl !font-bold !mb-2",
        htmlContainer: "!text-base !text-gray-600 !m-0 !mb-6",
        actions: "!flex !flex-col !items-center !w-full !gap-3 !mt-0",
        confirmButton:
          "w-2/4 py-3 bg-(image:--my-gradient) rounded-2xl text-white hover:opacity-80 shadow-[0_3px_0_#1f8f2f] active:translate-y-[3px] cursor-pointer transition-all active:shadow-none duration-150",
        cancelButton:
          "w-2/4 py-3 bg-white font-bold rounded-2xl shadow-[0_3px_0_#eee] border border-gray-200 hover:bg-gray-50 active:translate-y-[3px] cursor-pointer transition-all active:shadow-none duration-150",
        closeButton:
          "!absolute !top-0 active:!top-[3px] !right-0 !translate-x-1/3 !-translate-y-1/3 !w-10 !h-10 !bg-yellow-400 !text-white !rounded-full !flex !items-center !justify-center !text-3xl !font-bold !shadow-[0_3px_0_#c49000] hover:!bg-[#e0a600] active:!shadow-none !transition-all !duration-150 !cursor-pointer focus:!outline-none",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await postService.deletePost(id);
          deletePost(id);
        } catch (error) {
          console.error("Lỗi khi xóa bài viết:", error);
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa bài viết.", "error");
        }
      }
    });
  };

  const handleLike = async () => {
    try {
      const result = await postService.likePost(id);
      if (result && result.likesCount !== undefined) {
        updatePostLike(id, result.likesCount);
      }
    } catch (error) {
      console.error("Lỗi khi like bài viết:", error);
    }
  };

  useEffect(() => {
    return () => {
      setIsOpenModalComment(false);
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* HEADER */}
      <div className="p-5 relative">
        <button
          onClick={handleRemovePost}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <Trash2 size={20} />
        </button>

        {/* Item Post */}
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "https://ui-avatars.com/api/?name=User"}
            alt="Ảnh đại diện người dùng"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div>
              <p className="font-semibold text-lg">{user?.displayName ?? ""}</p>
              <span className="text-sm text-[#b0b3b8]">
                {formatDate(createdAt).replace("-", " tháng ")}
              </span>

              {/* Status Post */}
              <span
                className={`ml-10 px-3 py-1 rounded-lg ${
                  status === "APPROVED"
                    ? "bg-text-green text-white"
                    : status === "REJECTED"
                      ? "bg-red-200 text-red-400"
                      : "bg-amber-200 text-orange-400"
                } text-sm`}
              >
                {status === "PENDING"
                  ? "Chờ duyệt"
                  : status === "APPROVED"
                    ? "Đã duyệt"
                    : "Từ chối"}
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-5">
          <div
            className="text-[17px] leading-8 text-gray-800 line-clamp-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(content),
            }}
          />

          <button className="mt-2 font-semibold text-lg hover:underline cursor-pointer">
            Xem thêm
          </button>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="banner bài viết"
              className="mt-5 rounded-2xl object-contain max-w-82.5 max-h-100 mx-auto"
            />
          )}
        </div>
      </div>

      {/* REACTION BAR */}
      {status === "APPROVED" && (
        <div className="border-t border-gray-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ThumbsUp size={22} />
              <span className="font-medium">{likes}</span>
            </button>

            <button
              className="flex items-center gap-2 text-gray-700 hover:text-orange-400 transition-colors cursor-pointer"
              onClick={() => {
                setActivePostId(id);
                setIsOpenModalComment(true);
              }}
            >
              <MessageCircle size={22} />
              <span className="font-medium">{comments}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPost;

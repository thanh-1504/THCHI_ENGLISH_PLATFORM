import DOMPurify from "dompurify";
import { ImageIcon, MessageCircle, Send, ThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import postService from "../../services/post.service";
import useCommunityStore from "../../store/useCommunityStore";
import useUIStore from "../../store/useUIStore";
import formatDate from "../../utils/formatDate";

const CommentModal = () => {
  const imageInputRef = useRef(null);
  const {
    commentImage,
    setCommentImage,
    activePostId,
    updatePostLike,
    updatePostComment,
  } = useCommunityStore();
  const { isOpenModalComment, setIsOpenModalComment } = useUIStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    if (activePostId) {
      setLoading(true);
      postService
        .getPost(activePostId)
        .then((data) => {
          setPost(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [activePostId]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCommentImage(url);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (commentImage) URL.revokeObjectURL(commentImage);
    setCommentImage(null);
  };

  const handleLike = async () => {
    try {
      const result = await postService.likePost(post.id);
      if (result && result.likesCount !== undefined) {
        setPost({ ...post, likes: result.likesCount });
        updatePostLike(post.id, result.likesCount);
      }
    } catch (error) {
      console.error("Lỗi khi like bài viết:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim() && !commentImage) return;
    try {
      const payload = {
        content: commentContent,
      };

      await postService.createCommentOnPost(post.id, payload);
      const updatedPost = await postService.getPost(post.id);
      setPost(updatedPost);
      if (updatedPost && updatedPost.comments !== undefined) {
        updatePostComment(post.id, updatedPost.comments);
      }
      setCommentContent("");
      handleRemoveImage();
    } catch (error) {
      console.error("Lỗi khi bình luận:", error);
    }
  };

  useEffect(() => {
    if (isOpenModalComment) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpenModalComment]);

  if (!post && !loading) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center sm:p-6 backdrop-blur-sm transition-opacity">
      {/* Khung Modal chính */}
      <div className="bg-white w-full max-w-5xl h-[100dvh] sm:h-[85vh] rounded-t-[24px] sm:rounded-[24px] flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 font-medium">Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col bg-white md:flex-1 md:border-r border-gray-200 shrink-0 max-h-[38vh] md:max-h-none min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full md:pr-4">
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={post.user?.avatar}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {post.user?.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {formatDate(post.createdAt).replace("-", " tháng ")}
                    </p>
                  </div>
                </div>
                <div
                  className="text-[16px] leading-8 text-gray-800 space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.content),
                  }}
                />
                {post.imageUrl && (
                  <div className="mt-6">
                    <img
                      src={post.imageUrl}
                      alt="Sale Mochi"
                      className="w-full rounded-2xl object-cover border border-gray-100"
                    />
                  </div>
                )}
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-between items-center bg-white shrink-0">
                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={handleLike}
                    className="flex items-center gap-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <ThumbsUp size={22} />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 font-semibold text-orange-400 pointer-events-none"
                  >
                    <MessageCircle size={22} />
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COMMENT */}
            <div className="w-full md:w-[360px] lg:w-[400px] flex flex-col bg-white flex-1 min-h-0 border-t md:border-t-0 border-gray-200">
              {/* Header Comment */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 shrink-0">
                <h3 className="font-bold text-[18px] text-gray-900">
                  Bình luận
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-all cursor-pointer"
                  onClick={() => setIsOpenModalComment(false)}
                >
                  <X size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* List Comment */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full pr-2 sm:pr-3">
                {post.commentsList && post.commentsList.length > 0 ? (
                  post.commentsList.map((comment) => (
                    <div className="flex gap-3" key={comment.id}>
                      <img
                        src={comment.user?.avatar}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover mt-1"
                      />
                      <div className="flex-1">
                        <div className="bg-[#f2f3f5] rounded-2xl rounded-tl-none px-4 py-2.5">
                          <p className="font-bold text-[13px] text-gray-900 mb-0.5">
                            {comment.user?.displayName}
                          </p>
                          <p className="text-[14px] text-gray-800">
                            {comment.content}
                          </p>
                          {comment.imageUrl && (
                            <img
                              src={comment.imageUrl}
                              alt="comment image"
                              className="mt-2 rounded-xl max-h-32 object-cover"
                            />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 font-medium ml-2">
                          {formatDate(comment.createdAt).replace(
                            "-",
                            " tháng ",
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm">
                    Chưa có bình luận nào.
                  </p>
                )}
              </div>

              {/* Box For User Enter Comment */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100 bg-white shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {/* Image preview */}
                {commentImage && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={commentImage}
                      alt="preview"
                      className="rounded-2xl w-full max-h-48 object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-gray-800/70 hover:bg-gray-900/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <img
                    src={
                      post.user?.avatar ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    alt="my-avatar"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2.5 border border-gray-200">
                    <input
                      type="text"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSubmitComment()
                      }
                      placeholder="Viết một bình luận..."
                      className="bg-transparent flex-1 outline-none text-[14px] text-gray-700 placeholder:text-gray-500"
                    />
                    <div className="flex items-center gap-2 pl-2">
                      {/* Hidden file input */}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="text-gray-500 transition-colors cursor-pointer"
                        title="Đính kèm ảnh"
                      >
                        <ImageIcon size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitComment}
                        className={`text-gray-400 transition-colors ${commentContent || commentImage ? "hover:text-blue-500 cursor-pointer" : ""}`}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default CommentModal;

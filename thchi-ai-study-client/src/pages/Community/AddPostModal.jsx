import { X } from "lucide-react";
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import postService from "../../services/post.service";
import useCommunityStore from "../../store/useCommunityStore";
import RichTextEditor from "./RichTextEditor";

const AddPostModal = () => {
  const { setIsAddPost, image, setImage, previewUrl, setPreviewUrl } =
    useCommunityStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState({ html: "", text: "" });
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef(null);

  // ── Image handlers ────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.text) return;

    setLoading(true);
    try {
      let imageUrl = null;
      if (image) {
        const res = await postService.uploadImage(image);
        imageUrl = res?.url ?? "";
      }
      const payload = {
        title: title.trim(),
        content: content.html,
        imageUrl,
      };
      await postService.createPost(payload);

      Swal.fire({
        title: "Đăng bài thành công!",
        text: "Bài viết của bạn đang chờ quản trị viên duyệt.",
        icon: "success",
        confirmButtonText: "OK",
        buttonsStyling: false,
        customClass: {
          popup: "!rounded-3xl !p-6 !w-[400px]",
          title: "!text-xl !font-bold !mb-2",
          htmlContainer: "!text-base !text-gray-600 !m-0 !mb-6",
          actions: "!w-[50%] !mt-0 !flex !justify-center",
          confirmButton:
            "w-full py-3 bg-green-500 rounded-2xl text-white font-bold hover:bg-green-600 transition-all cursor-pointer shadow-[0_3px_0_#1f8f2f] active:translate-y-[3px] active:shadow-none duration-150",
        },
      });

      setIsAddPost(false);
      // Clear forms
      setTitle("");
      setContent({ html: "", text: "" });
      handleRemoveImage();
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tạo bài viết lúc này.",
        icon: "error",
        confirmButtonText: "Đóng",
        buttonsStyling: false,
        customClass: {
          popup: "!rounded-3xl !p-6 !w-[400px]",
          title: "!text-xl !font-bold !mb-2",
          htmlContainer: "!text-base !text-gray-600 !m-0 !mb-6",
          actions: "!w-[50%] !mt-0 !flex !justify-center",
          confirmButton:
            "w-full py-3 bg-red-500 rounded-2xl text-white font-bold hover:bg-red-600 transition-all cursor-pointer",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = !title.trim() || !content.text;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mx-auto">
            Tạo bài viết
          </h2>
          <button
            type="button"
            onClick={() => setIsAddPost(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-x-3 mb-4">
          <div className="w-10 h-10 border-4 border-gray-200 rounded-full overflow-hidden">
            <img
              src="https://learn.mochidemy.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fuser_avatar.e6d9f9ba.png&w=64&q=75"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-gray-800">Thanh</span>
        </div>

        {/* Form */}
        <form onSubmit={handleCreatePost} className="space-y-4">
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-colors"
          />

          {/* Editor */}
          <RichTextEditor onChange={setContent} />

          {/* Image upload */}
          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-full max-h-48 object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 w-8 h-8 bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer text-center"
              >
                <p className="text-gray-400 text-sm">Nhấn để đính kèm ảnh</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsAddPost(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isEmpty || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-2xl transition-all cursor-pointer"
            >
              {loading ? "Đang đăng..." : "Đăng bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostModal;

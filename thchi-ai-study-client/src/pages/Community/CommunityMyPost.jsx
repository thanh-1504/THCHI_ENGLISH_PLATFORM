import { X } from "lucide-react";
import { useEffect } from "react";
import { Link, useLoaderData } from "react-router-dom";
import useCommunityStore from "../../store/useCommunityStore";
import useUIStore from "../../store/useUIStore";
import CommentModal from "./CommentModal";
import MyPost from "./components/MyPost";

const CommunityMyPost = () => {
  const initialMyPosts = useLoaderData();
  const { isOpenModalComment } = useUIStore();
  const { myPosts, setMyPosts } = useCommunityStore();
  useEffect(() => {
    if (initialMyPosts) setMyPosts(initialMyPosts);
  }, [initialMyPosts, setMyPosts]);
  return (
    <div className="relative min-h-screen">
      <Link
        to={"/community"}
        className="
        absolute top-10
        p-3
        rounded-full
        bg-white
        text-gray-400
        cursor-pointer
        shadow-[0_3px_0_#ccc]
        active:translate-y-[3px]
        active:shadow-none
        transition-all
        duration-150
      "
      >
        <X />
      </Link>
      {/* <div className="absolute top-2/5 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex justify-center">
          <FileText size={65} className="text-gray-300 mb-2" />
        </div>
        <span className="text-center text-xl font-medium">
          Chưa có bài viết nào
        </span>
      </div> */}
      {/* HAVE POST */}
      <div className="pt-30 flex flex-col gap-y-8">
        {myPosts?.length > 0 && myPosts ? (
          myPosts.map((post) => <MyPost key={post.id} post={post} />)
        ) : (
          <p className="text-center text-gray-500">Không có bài viết</p>
        )}
      </div>
      {isOpenModalComment && <CommentModal />}
    </div>
  );
};
export default CommunityMyPost;

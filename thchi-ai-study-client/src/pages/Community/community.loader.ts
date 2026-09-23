import postService from "../../services/post.service";
import useCommunityStore from "../../store/useCommunityStore";

export const communityLoader = {
  getData: async () => {
    const [posts, currentUserPost] = await Promise.all([
      postService.getPosts(),
      postService.getMyPosts(),
    ]);
    return {
      posts,
      currentUserPost,
    };
  },
  getMyPost: async () => {
    const data = useCommunityStore.getState().myPosts;
    if (data && data.length > 0) return data;
    return await postService.getMyPosts();
  },
};

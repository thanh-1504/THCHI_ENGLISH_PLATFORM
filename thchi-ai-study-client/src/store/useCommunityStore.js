import { create } from "zustand";

const useCommunityStore = create((set) => ({
  image: null,
  previewUrl: null,
  commentImage: null,
  isAddPost: false,
  activePostId: null,
  posts: [],
  myPosts: [],
  setPosts: (posts) => set({ posts }),
  setMyPosts: (myPosts) => set({ myPosts }),
  updatePostLike: (postId, newLikeCount) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likes: newLikeCount } : p,
      ),
      myPosts: state.myPosts.map((p) =>
        p.id === postId ? { ...p, likes: newLikeCount } : p,
      ),
    })),
  updatePostComment: (postId, newCommentCount) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, comments: newCommentCount } : p,
      ),
      myPosts: state.myPosts.map((p) =>
        p.id === postId ? { ...p, comments: newCommentCount } : p,
      ),
    })),
  deletePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
      myPosts: state.myPosts.filter((p) => p.id !== postId),
    })),
  setImage: (value) => set({ image: value }),
  setIsAddPost: (value) => set({ isAddPost: value }),
  setPreviewUrl: (value) => set({ previewUrl: value }),
  setCommentImage: (value) => set({ commentImage: value }),
  setActivePostId: (value) => set({ activePostId: value }),
}));

export default useCommunityStore;

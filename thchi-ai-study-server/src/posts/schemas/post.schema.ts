import { PostStatus } from 'generated/prisma/enums';
import z from 'zod';

const PostSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().url().optional(),
  status: z.nativeEnum(PostStatus).default(PostStatus.PENDING),
  reviewedBy: z.string().optional(),
  reviewedAt: z.date().optional(),
});

const CommentSchema = z.object({
  postId: z.string(),
  content: z.string(),
});

export const CreatePostSchema = PostSchema.omit({
  userId: true,
  status: true,
  reviewedAt: true,
  reviewedBy: true,
});

export const CreateCommentOnPostSchema = CommentSchema.omit({
  postId: true,
});

export const UpdateCommentOnPostSchema = CommentSchema.pick({
  content: true,
});

export const ReviewPostSchema = PostSchema.pick({
  status: true,
  reviewedBy: true,
});

export const UpdatePostSchema = CreatePostSchema.partial();
export type CreatePostType = z.infer<typeof CreatePostSchema>;
export type CreateCommentOnPostType = z.infer<typeof CreateCommentOnPostSchema>;
export type ReviewPostType = z.infer<typeof ReviewPostSchema>;
export type UpdatePostType = z.infer<typeof UpdatePostSchema>;
export type UpdateCommentType = z.infer<typeof UpdateCommentOnPostSchema>;

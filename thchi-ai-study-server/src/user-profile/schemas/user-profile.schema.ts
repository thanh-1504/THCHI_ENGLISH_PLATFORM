import UserSchema from 'src/shared/schemas/user.schema';
import z from 'zod';

const UserProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  bio: z.string().nullable(),
});

export const UserProfileResponseSchema = UserProfileSchema.pick({
  userId: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
})
  .extend({
    user: UserSchema.pick({
      name: true,
      email: true,
      createdAt: true,
    }),
  })
  .transform((data) => {
    return {
      userId: data.userId,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      email: data.user.email,
      createdAt: data.user.createdAt,
    };
  });

export const CreateUserProfileSchema = UserProfileSchema.omit({
  userId: true,
});

export const UpdateUserProfileSchema = UserProfileSchema.omit({
  userId: true,
}).partial();

export const ChangePasswordUserSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
    newPassword: z
      .string()
      .min(6, { message: 'Mật khẩu tối thiểu 6 ký tự nhé bạn ơi' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Mật khẩu tối thiểu 6 ký tự nhé bạn ơi' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type ChangePasswordUserType = z.infer<typeof ChangePasswordUserSchema>;

export type UserProfileType = z.infer<typeof UserProfileSchema>;
export type CreateUserProfileType = z.infer<typeof CreateUserProfileSchema>;
export type UpdateUserProfileType = z.infer<typeof UpdateUserProfileSchema>;

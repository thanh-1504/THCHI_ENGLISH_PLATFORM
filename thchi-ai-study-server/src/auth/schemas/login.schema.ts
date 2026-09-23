import UserSchema from 'src/shared/schemas/user.schema';
import z from 'zod';

const LoginSchema = UserSchema.pick({
  email: true,
  password: true,
})
  .strict()
  .extend({
    isAdminPage: z.boolean().default(false).optional(),
  });

const LoginResponseSchema = z.object({
  message: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export { LoginResponseSchema, LoginSchema };
export type LoginDto = z.infer<typeof LoginSchema>;

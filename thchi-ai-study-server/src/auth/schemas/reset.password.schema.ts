import UserSchema from 'src/shared/schemas/user.schema';
import z from 'zod';

const ResetPasswordSchema = UserSchema.pick({
  password: true,
}).extend({
  token: z.string(),
});

export default ResetPasswordSchema;
export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

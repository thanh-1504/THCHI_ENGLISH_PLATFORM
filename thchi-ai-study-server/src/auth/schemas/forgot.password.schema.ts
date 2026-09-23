import UserSchema from 'src/shared/schemas/user.schema';
import { z } from 'zod';

const ForgotPasswordSchema = UserSchema.pick({
  email: true,
});

export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;
export default ForgotPasswordSchema;

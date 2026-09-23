import UserSchema from 'src/shared/schemas/user.schema';
import z from 'zod';
const RegisterSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
}).strict();
export default RegisterSchema;
export type RegisterDto = z.infer<typeof RegisterSchema>;

import UserSchema from 'src/shared/schemas/user.schema';
import z from 'zod';

const CreateUserSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
}).strict();

export default CreateUserSchema;
export type CreateUserType = z.infer<typeof CreateUserSchema>;

import z from 'zod';
const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Bạn ơi hãy cho chúng mình tên nhé' }),
  email: z
    .string()
    .min(1, { message: 'Bạn ơi thiếu email nè' })
    .email({ message: 'Email không đúng định dạng rồi bạn ơi' }),
  password: z.string().min(6, {
    message: 'Mật khẩu tối thiểu 6 ký tự nhé bạn ơi',
  }),
  role: z.enum(['ADMIN', 'USER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
export default UserSchema;
export type UserType = z.infer<typeof UserSchema>;

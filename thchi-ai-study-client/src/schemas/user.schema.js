import * as yup from "yup";
const UserSchema = yup.object({
  id: yup.string().optional(),
  name: yup
    .string()
    .required("* Tên hiển thị không được bỏ trống")
    .min(3, "* Tên hiển thị cần có từ 3-15 ký tự")
    .max(90, "* Tên hiển thị cần có từ 3-15 ký tự"),
  email: yup
    .string()
    .email("* Email sai định dạng, bạn kiểm tra lại nhé")
    .required("* Email không được bỏ trống"),
  password: yup
    .string()
    .required("* Mật khẩu không được bỏ trống")
    .min(6, "* Mật khẩu cần có ít nhất 06 ký tự"),
  role: yup.string().optional().oneOf(["ADMIN", "USER"]),
  status: yup.string().optional().oneOf(["ACTIVE", "INACTIVE", "BANNED"]),
});

export default UserSchema;

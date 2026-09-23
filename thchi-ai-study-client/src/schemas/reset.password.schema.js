import * as yup from "yup";

const ResetPasswordSchema = yup.object({
  password: yup
    .string()
    .required("* Mật khẩu không được bỏ trống")
    .min(6, "* Mật khẩu cần có ít nhất 06 ký tự"),
});

export default ResetPasswordSchema;

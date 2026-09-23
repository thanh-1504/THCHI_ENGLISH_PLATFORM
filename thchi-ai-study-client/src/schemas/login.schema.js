import UserSchema from "./user.schema";

const LoginSchema = UserSchema.pick(["email", "password"]);

export default LoginSchema;

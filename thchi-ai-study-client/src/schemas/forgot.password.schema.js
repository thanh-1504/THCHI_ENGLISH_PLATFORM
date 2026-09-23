import UserSchema from "./user.schema";

const ForgotPasswordSchema = UserSchema.pick(["email"]);

export default ForgotPasswordSchema;

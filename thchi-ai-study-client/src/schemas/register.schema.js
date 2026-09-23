import UserSchema from "./user.schema";

const RegisterSchema = UserSchema.pick(["email", "password", "name"]);

export default RegisterSchema;

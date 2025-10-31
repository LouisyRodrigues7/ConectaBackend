import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["admin", "user"], default: "user" },
  secret: { type: String },
  isMFAEnabled: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

export default User;

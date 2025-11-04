// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  secret: { type: String }, // MFA secret
  isMFAEnabled: { type: Boolean, default: false },
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;

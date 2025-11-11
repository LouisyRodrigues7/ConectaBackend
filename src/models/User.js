import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },

  // MFA
  secret: { type: String },
  isMFAEnabled: { type: Boolean, default: false },
  backupCode: { type: String },
  tempMFACode: { type: String },
  tempMFACodeExp: { type: Date },

  // Verificação de e-mail
  isVerified: { type: Boolean, default: false },
  emailToken: { type: String },

  // Recuperação de senha
  resetToken: { type: String },
  resetTokenExp: { type: Date },
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;

import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => emailRegex.test(v),
      message: "E-mail inválido!"
    }
  },

  password: {
    type: String,
    required: true,
    validate: {
      validator: (v) => senhaRegex.test(v),
      message:
        "A senha deve ter 8+ caracteres, incluindo maiúscula, minúscula, número e caractere especial."
    }
  },

  userType: { type: String, required: true },

  secret: { type: String }, 
  isMFAEnabled: { type: Boolean, default: false },
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;

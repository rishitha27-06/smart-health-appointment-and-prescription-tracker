import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin", "student", "faculty"],
      default: "patient",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
    resetExpiresAt: {
      type: Date,
    },
    age: {
      type: Number,
      min: [0, "Age must be positive"],
    },
    location: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    availableTime: {
      type: String,
      default: "Mon-Fri, 9AM - 5PM",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Optional: to hide sensitive info when returning user objects
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;

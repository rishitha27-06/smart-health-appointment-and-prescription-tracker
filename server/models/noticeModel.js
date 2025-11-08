import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  filename: String,
  path: String,
  url: String,
});

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "General" },
    targetRoles: { type: [String], default: ["student", "faculty", "admin"] },
    targetDepartments: { type: [String], default: [] },
    targetYears: { type: [Number], default: [] },
    attachments: [attachmentSchema],
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },
    approved: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    acknowledgements: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Notice", noticeSchema);

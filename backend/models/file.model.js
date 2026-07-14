import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const File = mongoose.model("File", fileSchema);
import Message from "../models/message.model.js";
import projectModel from "../models/project.model.js";
import { generateResult } from "../services/ai.service.js";
import { findRelevantFiles } from "../services/similarity.service.js";
import { indexChangedFiles } from "../services/file.service.js";

function mergeFileTrees(existingTree = {}, newTree = {}) {
  const merged = { ...existingTree };

  for (const key in newTree) {
    if (
      merged[key] &&
      typeof merged[key] === "object" &&
      !merged[key].file &&
      typeof newTree[key] === "object" &&
      !newTree[key].file
    ) {
      merged[key] = mergeFileTrees(merged[key], newTree[key]);
    } else {
      merged[key] = newTree[key];
    }
  }

  return merged;
}

export const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await Message.find({ project: projectId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const clearProjectChat = async (req, res) => {
  try {
    const { projectId } = req.params;

    await Message.deleteMany({
      project: projectId,
    });

    return res.status(200).json({
      success: true,
      message: "Chat cleared successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        message,
        edited: true,
      },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const regenerateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const project = await projectModel.findById(message.project);

    if (!message.message.toLowerCase().includes("@zenith")) {
      return res.status(200).json({
        success: true,
        message: "Edited successfully",
      });
    }

    const prompt = message.message.replace(/@zenith/gi, "").trim();

    const relevantFiles = await findRelevantFiles(
      project._id,
      prompt
    );

    const result = await generateResult({
      prompt,
      projectName: project.name,
      contextFiles: relevantFiles,
    });

    let mergedFileTree = project.fileTree;

    if (result.fileTree && Object.keys(result.fileTree).length > 0) {
      mergedFileTree = mergeFileTrees(
        project.fileTree,
        result.fileTree
      );

      project.fileTree = mergedFileTree;
      await project.save();

      await indexChangedFiles(
        project,
        result.fileTree
      );
    }
    const oldAIReply = await Message.findOne({
      replyTo: message._id,
    });

    if (oldAIReply) {
      oldAIReply.message = result.text;
      await oldAIReply.save();

      return res.status(200).json({
        success: true,
        aiMessage: oldAIReply,
        fileTree: mergedFileTree,
        buildCommand: result.buildCommand,
        startCommand: result.startCommand,
      });
    }

    // fallback (first generation if no AI reply exists)
    const aiMessage = await Message.create({
      project: project._id,
      sender: null,
      email: "zenith@ai",
      message: result.text,
      isAI: true,
      replyTo: message._id,
    });

    return res.status(200).json({
      success: true,
      aiMessage,
      fileTree: mergedFileTree,
      buildCommand: result.buildCommand,
      startCommand: result.startCommand,
    });



  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
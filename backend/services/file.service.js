import {File} from "../models/file.model.js";
import { generateEmbedding } from "./embedding.service.js";

function extractFiles(node, currentPath = "", files = []) {
  for (const [name, value] of Object.entries(node)) {
    const path = currentPath ? `${currentPath}/${name}` : name;

    if (!value) continue;

if (value.file) {
      files.push({
        path,
        content: value.file.contents || "",
      });
    } else {
      extractFiles(value, path, files);
    }
  }

  return files;
}

export const indexChangedFiles = async (project, changedFiles) => {
  const files = extractFiles(changedFiles);

  for (const file of files) {
  const embedding = await generateEmbedding(file.content);

  await File.findOneAndUpdate(
    {
      project: project._id,
      path: file.path,
    },
    {
      content: file.content,
      embedding,
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );
}
};
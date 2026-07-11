export const cloneTree = (tree) => structuredClone(tree);

export const getNode = (tree, path) => {
  if (!path || path === "project") return tree;

  return path.split("/").reduce((node, key) => node?.[key], tree);
};

export const addFile = (tree, folderPath, fileName) => {
  const updatedTree = cloneTree(tree);

  const target = getNode(updatedTree, folderPath);

  if (!target) throw new Error("Folder not found");

  if (target[fileName]) throw new Error("File already exists");

  target[fileName] = {
    file: {
      contents: "",
    },
  };

  return updatedTree;
};

export const addFolder = (tree, folderPath, folderName) => {
  const updatedTree = cloneTree(tree);

  const target = getNode(updatedTree, folderPath);

  if (!target) throw new Error("Folder not found");

  if (target[folderName]) throw new Error("Folder already exists");

  target[folderName] = {};

  return updatedTree;
};

export const renameNode = (tree, path, newName) => {
  const updatedTree = cloneTree(tree);

  const parts = path.split("/");
  const oldName = parts.pop();

  const parent = getNode(updatedTree, parts.join("/"));

  if (!parent) throw new Error("Parent folder not found");

  parent[newName] = parent[oldName];
  delete parent[oldName];

  return updatedTree;
};

export const deleteNode = (tree, path) => {
  const updatedTree = cloneTree(tree);

  const parts = path.split("/");
  const nodeName = parts.pop();

  const parent = getNode(updatedTree, parts.join("/"));

  if (!parent) throw new Error("Parent folder not found");

  delete parent[nodeName];

  return updatedTree;
};
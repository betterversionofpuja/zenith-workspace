export const cloneTree = (tree) => structuredClone(tree);

export const getNode = (tree, path) => {
  if (!path) return tree;

  return path.split("/").reduce((node, key) => node?.[key], tree);
};

export const addFile = (tree, folderPath, fileName) => {
  const updatedTree = cloneTree(tree);

  const target =
    folderPath && folderPath !== "project"
      ? getNode(updatedTree, folderPath)
      : updatedTree;

  if (!target) return tree;

  target[fileName] = {
    file: {
      contents: "",
    },
  };

  return updatedTree;
};

export const addFolder = (tree, folderPath, folderName) => {
  const updatedTree = cloneTree(tree);

  const target =
    folderPath && folderPath !== "project"
      ? getNode(updatedTree, folderPath)
      : updatedTree;

  if (!target) return tree;

  target[folderName] = {};

  return updatedTree;
};
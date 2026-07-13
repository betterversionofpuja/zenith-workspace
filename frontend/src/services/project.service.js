import axiosInstance from "../config/axios";

export const createFile = (projectId, folderPath, fileName) =>
  axiosInstance.post(`/projects/${projectId}/file`, {
    folderPath,
    fileName,
  });

export const createFolder = (projectId, folderPath, folderName) =>
  axiosInstance.post(`/projects/${projectId}/folder`, {
    folderPath,
    folderName,
  });

export const renameItem = (projectId, path, newName) =>
  axiosInstance.patch(`/projects/${projectId}/rename`, {
    path,
    newName,
  });

export const deleteItem = (projectId, path) =>
  axiosInstance.delete(`/projects/${projectId}/node`, {
    data: { path },
  });

export const renameProject = (projectId, name) => {
  return axiosInstance.patch(`/projects/rename/${projectId}`, {
    name,
  });
};

export const deleteProject = (projectId) => {
  return axiosInstance.delete(`/projects/delete/${projectId}`);
};

export const clearProjectChat = (projectId) => {
  return axiosInstance.delete(`/messages/project/${projectId}`);
};

export const editMessage = (messageId, message) => {
  return axiosInstance.patch(`/messages/${messageId}`, {
    message,
  });
};

export const regenerateMessage = (messageId) => {
  return axiosInstance.post(`/messages/regenerate/${messageId}`);
};

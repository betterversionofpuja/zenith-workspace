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
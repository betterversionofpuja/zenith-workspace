import projectModel from '../models/project.model.js';
import mongoose from "mongoose";
import {
  addFile,
  addFolder,
  renameNode,
  deleteNode,
} from "../utils/fileTree.js";

export const createProject = async ({
    name, userId
}) => {
    if(!name){
        throw new Error('Project name is required');
    }

    if(!userId){
        throw new Error('User ID is required');
    }

    let project;
    try {
        project = await projectModel.create({
            name,
            users: [ userId ]
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;
}

export const getAllProjectByUserId = async ({userId}) => {
    if(!userId){
        throw new Error('User ID is required');
    }
    const allUserProjects = await projectModel.find({ users: userId });
    return allUserProjects;
}

export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    console.log(project)

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        returnDocument: "after"
    })

    return updatedProject

}

export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project;
}

export const createFile = async ({ projectId, folderPath, fileName }) => {
  const project = await projectModel.findById(projectId);

  project.fileTree = addFile(project.fileTree || {}, folderPath, fileName);

  await project.save();

  return project.fileTree;
};

export const createFolder = async ({ projectId, folderPath, folderName }) => {
  const project = await projectModel.findById(projectId);

  project.fileTree = addFolder(project.fileTree || {}, folderPath, folderName);

  await project.save();

  return project.fileTree;
};

export const renameItem = async ({ projectId, path, newName }) => {
  const project = await projectModel.findById(projectId);

  project.fileTree = renameNode(project.fileTree || {}, path, newName);

  await project.save();

  return project.fileTree;
};

export const deleteItem = async ({ projectId, path }) => {
  const project = await projectModel.findById(projectId);

  project.fileTree = deleteNode(project.fileTree || {}, path);

  await project.save();

  return project.fileTree;
};


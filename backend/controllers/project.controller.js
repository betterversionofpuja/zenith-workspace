import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';
import userModel from '../models/user.model.js';

export const createProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id;
        const newProject = await projectService.createProject({ name, userId });
         res.status(201).json(newProject);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
}

export const getAllProject = async (req, res) => {

    try{
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const allUserProjects = await projectService.getAllProjectByUserId({ userId: loggedInUser._id });

        return res
        .status(200)
        .json({
            projects: allUserProjects
        });

    }catch(error){
        console.log(error);
        res.status(400).send({ message: error.message });
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })


        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }


}

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {

        const project = await projectService.getProjectById({ projectId });

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}

export const updateFileTree = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileTree } = req.body;

    const project = await projectModel.findByIdAndUpdate(
      projectId,
      { fileTree },
      { new: true }
    );

    return res.status(200).json({
      project,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const createFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { folderPath, fileName } = req.body;

    const fileTree = await projectService.createFile({
      projectId,
      folderPath,
      fileName,
    });

    res.status(200).json({ fileTree });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { folderPath, folderName } = req.body;

    const fileTree = await projectService.createFolder({
      projectId,
      folderPath,
      folderName,
    });

    res.status(200).json({ fileTree });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const renameItem = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path, newName } = req.body;

    const fileTree = await projectService.renameItem({
      projectId,
      path,
      newName,
    });

    res.status(200).json({ fileTree });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path } = req.body;

    const fileTree = await projectService.deleteItem({
      projectId,
      path,
    });

    res.status(200).json({ fileTree });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const renameProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    const project = await projectModel.findByIdAndUpdate(
      projectId,
      { name },
      { new: true }
    );

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    await projectModel.findByIdAndDelete(projectId);

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
import {Router} from 'express';
import {body} from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', 
    authMiddleware.authUser,
    body('name').isString().withMessage('Project name required'),
    projectController.createProject
);

router.get('/all',
    authMiddleware.authUser,
    projectController.getAllProject
);

router.put('/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId',
    authMiddleware.authUser,
    projectController.getProjectById
)

router.put(
  "/update-file-tree/:projectId",
  authMiddleware.authUser,
  projectController.updateFileTree
);

router.post(
  "/:projectId/file",
  authMiddleware.authUser,
  projectController.createFile
);

router.post(
  "/:projectId/folder",
  authMiddleware.authUser,
  projectController.createFolder
);

router.patch(
  "/:projectId/rename",
  authMiddleware.authUser,
  projectController.renameItem
);

router.delete(
  "/:projectId/node",
  authMiddleware.authUser,
  projectController.deleteItem
);

export default router;
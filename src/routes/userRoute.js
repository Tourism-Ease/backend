import express from 'express';

import {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
  deleteUserValidator,
  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} from '../validators/userValidator.js';

import { loginValidator } from '../validators/authValidator.js';

import {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  changeUserPassword,
  deleteUserById,
  // Middlewares
  uploadUserImage,
  resizeUserImage,
  getLoggedUserData,
  changeLoggedUserPassword,
  updateLoggedUserData,
  deactivateLoggedUser,
  reactivateUserAccount,
  deleteUserImage,
} from '../services/userService.js';

import { protect, allowedTo } from '../services/authService.js';
import { sendUpdatedDocResponse } from '../middlewares/updateResponse.js';
import { sendDeleteResponse } from '../middlewares/deleteResponse.js';

const router = express.Router();

router.post('/activateAccount', loginValidator, reactivateUserAccount);

// router.use(protect);

// USER
router.get('/profile', protect, getLoggedUserData, getUserById);

router.patch('/changeMyPassword', changeLoggedUserPasswordValidator, changeLoggedUserPassword);

router.put(
  '/updateMe',
  uploadUserImage,
  resizeUserImage,
  updateLoggedUserValidator,
  updateLoggedUserData,
  deleteUserImage,
  sendUpdatedDocResponse
);

router.delete('/deactivateMe', deactivateLoggedUser);

// ADMIN
// Apply to all upcoming routes
// router.use(allowedTo('admin'));

router.post('/', uploadUserImage, resizeUserImage, createUserValidator, createUser);

router.get('/', getUsers);

router.get('/:id', getUserValidator, getUserById);

router.put(
  '/:id',
  uploadUserImage,
  resizeUserImage,
  updateUserValidator,
  updateUserById,
  deleteUserImage,
  sendUpdatedDocResponse
);

router.delete('/:id', deleteUserValidator, deleteUserById, deleteUserImage, sendDeleteResponse);

router.patch('/changePassword/:id', changeUserPasswordValidator, changeUserPassword);

export default router;

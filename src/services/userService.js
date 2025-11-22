import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';

import UserModel from '../models/userModel.js';
import * as factory from './handlerFactory.js';
import APIError from '../utils/apiError.js';
import { createToken } from '../utils/auth.js';

import { uploadSingleImage } from '../middlewares/uploadImageMiddleware.js';
import { resizeImage } from '../middlewares/resizeImageMiddleware.js';
import { deleteCloudinaryImages } from '../middlewares/deleteImageMiddleware.js';
import { sendToken } from '../utils/sendToken.js';

// Middlewares
export const uploadUserImage = uploadSingleImage('avatar');
export const resizeUserImage = resizeImage('users', 'user', 'avatar');
export const deleteUserImage = deleteCloudinaryImages();

// @ desc   Create user
// @ route  POST    /api/v1/users
// @ access Private

export const createUser = factory.createOne(UserModel);

// @ desc   Get list of users
// @ route  GET    /api/v1/users
// @ access Private

export const getUsers = factory.getAll(UserModel);

// @ desc   Get specific user by id
// @ route  GET    /api/v1/users/:id
// @ access Private

export const getUserById = factory.getOneById(UserModel);

// @ desc   Update specific user
// @ route  PUT    /api/v1/users/:id
// @ access Private

export const updateUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const document = await UserModel.findById(id);

  if (!document) {
    return next(new APIError(`No User for this Id ${id}`, 404));
  }

  const updatedDocument = await UserModel.findByIdAndUpdate(
    id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      avatar: req.body.avatar,
      role: req.body.role,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // If there is an image in the request and the document has an existing image, delete the old image
  if (req.file && document.avatar) {
    res.locals.image = document.avatar;
    next();
  }

  res.status(200).json({ data: updatedDocument });
});

// @ desc   Change Password for a specific user
// @ route  PUT    /api/v1/users/changePassword/:id
// @ access Private

export const changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(new APIError(`No User for this Id ${id}`, 404));
  }

  sendToken(user, 200, res);
});

// @ desc   Delete specific user
// @ route  DELETE    /api/v1/users/:id
// @ access Private

export const deleteUserById = factory.deleteOne(UserModel, 'avatar');

// @ desc   Get Logged user data
// @ route  GET    /api/v1/users/loggedUser
// @ access Private/Protect

export const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @ desc   Change Logged User Password for
// @ route  PUT    /api/v1/users/changePassword
// @ access Private/Protect

export const changeLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const { password } = req.body;

  // 1) Update User Password

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(new APIError(`No User for this Id ${id}`, 404));
  }

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @ desc   Update Logged User Data (Without password, role)
// @ route  PUT    /api/v1/users/updateMe
// @ access Private/Protect

export const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const id = req.user._id;

  const loadedUser = await UserModel.findById(id);

  if (!loadedUser) {
    return next(new APIError(`No User for this Id ${id}`, 404));
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      avatar: req.body.avatar,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // If there is an image in the request and the document has an existing image, delete the old image
  if (req.file && loadedUser.avatar) {
    res.locals.filename = loadedUser.avatar;
    next();
  }

  res.status(200).json({ data: updatedUser });
});

// @ desc   Deactivate Logged User
// @ route  PUT    /api/v1/users/deactivateMe
// @ access Private/Protect

export const deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  const id = req.user._id;

  await UserModel.findByIdAndUpdate(
    id,
    {
      active: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(204).json({ status: 'Success' });
});

// @ desc   Deactivate Logged User
// @ route  PUT    /api/v1/users/deactivateMe
// @ access Private/Protect

export const reactivateUserAccount = asyncHandler(async (req, res, next) => {
  // 1- Check if password and email in the body (valdiation)
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  // 2- Check if users exists and password is correct
  const isMatch = await bcrypt.compare(password, user.password);

  if (!user || !isMatch) {
    return next(new APIError(`Invalid email or password`, 401));
  }

  // 3- Activate user account
  user.active = true;
  await user.save();

  // 4- Generate JWT token
  sendToken(user, 200, res);
});

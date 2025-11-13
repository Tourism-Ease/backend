import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import APIError from '../utils/apiError.js';
import { getImageUrl } from '../utils/getImageUrl.js';

// 1- Create Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, 'User firstName is required'],
      minlength: [2, 'First name must be at least 2 characters long.'],
      maxlength: [50, 'First name cannot exceed 50 characters.'],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, 'User lastName is required'],
      minlength: [2, 'Last name must be at least 2 characters long.'],
      maxlength: [50, 'Last name cannot exceed 50 characters.'],
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    avatar: String,
    password: {
      type: String,
      required: [true, 'User password is required'],
      minlength: [6, 'Too short User password'],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpiredAt: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ['user', 'admin', 'employee'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret && ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
  }
);

// 2- Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(new APIError('Failed to hash password.', 500));
  }
});

// 3- Virtuals
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('avatarUrl').get(function () {
  if (this.profileImage) return getImageUrl(this.profileImage, 'users');
  return null;
});

// 4- Create model (avoid recompilation)
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

export default UserModel;

import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import UserModel from '../models/userModel.js';
import APIError from '../utils/apiError.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendToken } from '../utils/sendToken.js';
import {
  verifyToken,
  generateResetCode,
  hashResetCode,
  hashAndVerifyResetCode,
} from '../utils/auth.js';

// -----------------------------
// Middleware: Protect Route
// -----------------------------
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new APIError('You are not logged in', 401));

  const decodedToken = verifyToken(token);

  const user = await UserModel.findById(decodedToken.userId);
  if (!user) return next(new APIError('User no longer exists', 401));
  if (!user.active)
    return next(new APIError('User account is deactivated, please activate it', 401));

  if (user.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
    if (passwordChangedTimestamp > decodedToken.iat)
      return next(new APIError('Password recently changed, please login again', 401));
  }

  req.user = user;
  next();
});

// -----------------------------
// Middleware: Authorization
// -----------------------------
export const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new APIError('You are not allowed to access this route', 403));
    }
    next();
  });

// -----------------------------
// Auth Controllers
// -----------------------------
export const signup = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await UserModel.create({ firstName, lastName, email, password });

  // Generate verification code (reuse your resetCode util)
  const verifyCode = generateResetCode();
  user.verifyEmailCode = hashResetCode(verifyCode, user.id);
  user.verifyEmailCodeExpiredAt = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();

  // Send email
  const htmlMessage = `
    <div style="font-family:Arial, sans-serif; padding:20px; background:#f8f9fa;">
      <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
        <h2>Email Verification</h2>
        <p>Hi <strong>${user.firstName}</strong>,</p>
        <p>Use the code below to verify your account:</p>
        <div style="text-align:center; margin:25px 0;">
          <span style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#28a745; padding:10px 20px; border:1px dashed #28a745; border-radius:6px;">
            ${verifyCode}
          </span>
        </div>
        <p>This code expires in 15 minutes.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify your account',
      html: htmlMessage,
    });
  } catch (err) {
    user.verifyEmailCode = undefined;
    user.verifyEmailCodeExpiredAt = undefined;
    await user.save();
    return next(new APIError('Error sending verification email', 500));
  }

  res.status(201).json({
    status: 'success',
    message: 'User created. Verification code sent to email.',
  });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, verifyCode } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) return next(new APIError('No user found for this email', 404));

  const expired = Date.now() > new Date(user.verifyEmailCodeExpiredAt).getTime();
  const isValid = !expired && hashAndVerifyResetCode(verifyCode, user.id, user.verifyEmailCode);

  if (!isValid) return next(new APIError('Invalid or expired verification code', 400));

  user.isEmailVerified = true;
  user.verifyEmailCode = undefined;
  user.verifyEmailCodeExpiredAt = undefined;
  await user.save();

  sendToken(user, 200, res);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return next(new APIError('Invalid email or password', 401));

  // Check if email is verified
  if (!user.isEmailVerified)
    return next(new APIError('Please verify your email before logging in', 401));

  // Check if account is active
  if (!user.active)
    return next(new APIError('Your account is deactivated. Please reactivate or contact support.', 403));
  
  // Check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new APIError('Invalid email or password', 401));

  sendToken(user, 200, res);
});

export const logout = asyncHandler(async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// -----------------------------
// Google Auth
// -----------------------------
export const googleAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) return next(new APIError('Google authentication failed', 400));

  const user = req.user;

  // Set cookie using same logic as normal login
  const isProd = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const token = createToken(user._id);
  res.cookie('token', token, cookieOptions);

  // Redirect to frontend just like OAuth normally does
  return res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
});

export const googleFailure = (req, res) => {
  if (process.env.FRONTEND_URL) return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  res.status(400).json({ message: 'Google authentication failed' });
};

// -----------------------------
// Forgot Password
// -----------------------------
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return next(new APIError(`No user found for email ${email}`, 404));

  const resetCode = generateResetCode();
  user.passwordResetCode = hashResetCode(resetCode, user.id);
  user.passwordResetCodeExpiredAt = Date.now() + 10 * 60 * 1000; // 10 min
  user.passwordResetVerified = false;
  await user.save();

  const htmlMessage = `
  <div style="font-family:Arial, sans-serif; padding:20px; background:#f8f9fa;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
      <h2>Password Reset Request</h2>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Use the code below to reset your password (expires in 10 minutes):</p>
      <div style="text-align:center; margin:25px 0;">
        <span style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#2c7be5; padding:10px 20px; border:1px dashed #2c7be5; border-radius:6px;">
          ${resetCode}
        </span>
      </div>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  </div>
  `;

  try {
    await sendEmail({ email: user.email, subject: 'Password Reset Code', html: htmlMessage });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiredAt = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new APIError('Error sending reset code email', 500));
  }

  res.status(200).json({ status: 'success', message: 'Reset code sent to email' });
});

// -----------------------------
// Verify Reset Code
// -----------------------------
export const verifyResetCode = asyncHandler(async (req, res, next) => {
  const { email, resetCode } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return next(new APIError(`No user for this email`, 404));

  const expired = Date.now() > new Date(user.passwordResetCodeExpiredAt).getTime();
  if (expired || !hashAndVerifyResetCode(resetCode, user.id, user.passwordResetCode)) {
    return next(new APIError('Invalid or expired reset code', 400));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: 'success' });
});

// -----------------------------
// Reset Password
// -----------------------------
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return next(new APIError(`No user for email ${email}`, 404));
  if (!user.passwordResetVerified) return next(new APIError('Reset code not verified', 400));

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpiredAt = undefined;
  user.passwordResetVerified = undefined;

  await user.save();
  sendToken(user, 200, res);
});

import express from 'express';
import passport from 'passport';
import { signupValidator, loginValidator } from '../validators/authValidator.js';
import {
  signup,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../services/authService.js';
import { createToken } from '../utils/auth.js';

const router = express.Router();

// Normal Auth
router.post('/signup', signupValidator, signup);
router.post('/verify-email', verifyEmail);

router.post('/login', loginValidator, login);
router.post('/logout', logout);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/v1/auth/google/failure',
  }),
  async (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';

    // Set cookie manually (DO NOT send JSON!)
    const token = createToken(req.user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Redirect to React route that fetches user
    return res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  }
);

// Failure route
router.get('/google/failure', (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
});

// Forgot password
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyResetCode);
router.patch('/resetPassword', resetPassword);

export default router;

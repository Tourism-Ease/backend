import express from 'express';
import passport from 'passport';
import { signupValidator, loginValidator } from '../validators/authValidator.js';
import {
  signup,
  login,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../services/authService.js';
import { sendToken } from '../utils/sendToken.js';

const router = express.Router();

// Normal Auth
router.post('/signup', signupValidator, signup);
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

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/v1/auth/google/failure',
  }),
  async (req, res) => {
    // req.user is set by passport
    if (!req.user) return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);

    // Send token in HTTP-only cookie
    sendToken(req.user, 200, res);

    // Redirect to React app
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);

router.get('/google/failure', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
});

// Forgot password
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyResetCode);
router.patch('/resetPassword', resetPassword);

export default router;

import { sanitizeUser } from './sanitizeData.js';
import { createToken } from './auth.js';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Send JWT token in HTTP-only cookie and JSON response
 * @param {Object} user - Mongoose user document
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response
 */
export const sendToken = (user, statusCode, res) => {
  const token = createToken(user._id);

  const cookieOptions = {
    httpOnly: true, // JS can't access cookie (XSS safe)
    secure: isProd, // HTTPS only in production
    sameSite: isProd ? 'None' : 'Lax', // cross-origin in prod
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  // Set cookie
  res.cookie('token', token, cookieOptions);

  // Send response
  res.status(statusCode).json({
    status: 'success',
    data: sanitizeUser(user),
  });
};

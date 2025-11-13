// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../config.env' });

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Create a JWT for a user
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 * @throws Will throw an error if token is invalid or expired
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate a secure 6-digit reset code
 * @returns {string} 6-digit reset code
 */
export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash a reset code using HMAC SHA-256
 * @param {string} resetCode - Reset code to hash
 * @param {string} secretKey - User-specific secret (ID or email)
 * @returns {string} Hashed reset code
 */
export const hashResetCode = (resetCode, secretKey) => {
  return crypto.createHmac('sha256', secretKey).update(resetCode).digest('hex');
};

/**
 * Verify if a provided reset code matches the stored hashed code
 * @param {string} resetCode - Reset code provided by user
 * @param {string} secretKey - User-specific secret (ID or email)
 * @param {string} storedHashedCode - Hashed code stored in DB
 * @returns {boolean} True if reset code is valid
 */
export const hashAndVerifyResetCode = (resetCode, secretKey, storedHashedCode) => {
  const hashedResetCode = hashResetCode(resetCode, secretKey);
  return hashedResetCode === storedHashedCode;
};

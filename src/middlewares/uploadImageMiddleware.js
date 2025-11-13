import multer from 'multer';
import APIError from '../utils/apiError.js';

/**
 * Configure and create a multer upload instance
 * - Uses memoryStorage (buffer) for integration with Sharp or Cloudinary
 * - Restricts files to images only
 * - Adds file size limit (default: 5MB)
 */
const createMulterInstance = () => {
  // Store files in memory as Buffer (useful for Sharp or Cloudinary upload)
  const storage = multer.memoryStorage();

  // File type filter — only allow image/* MIME types
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new APIError('Only image files are allowed', 400), false);
    }
  };

  // Initialize Multer with storage, filter, and file size limit
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });
};

/**
 * Upload a single image (e.g., "profileImage")
 * @param {string} fieldName - field name in form data
 */
export const uploadSingleImage = (fieldName) => createMulterInstance().single(fieldName);

/**
 * Upload multiple images from different fields
 * @param {Array<{ name: string, maxCount: number }>} fields - array of field objects
 */
export const uploadMultipleImages = (fields) => createMulterInstance().fields(fields);

import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';
import APIError from '../utils/apiError.js';

/**
 * Middleware: Deletes one or more Cloudinary images.
 * Expects `res.locals.image` or `res.locals.images`
 */
export const deleteCloudinaryImages = () =>
  asyncHandler(async (req, res, next) => {
    const { image, images } = res.locals;

    try {
      if (Array.isArray(images) && images.length > 0) {
        await Promise.all(
          images
            .filter(Boolean)
            .map((id) => cloudinary.uploader.destroy(id, { resource_type: 'image' }))
        );
      }

      if (image) {
        await cloudinary.uploader.destroy(image, { resource_type: 'image' });
      }

      next();
    } catch (error) {
      console.error('Cloudinary Delete Error:', error);
      next(new APIError('Failed to delete image(s) from Cloudinary', 500));
    }
  });

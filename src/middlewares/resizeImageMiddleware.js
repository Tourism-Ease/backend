import dotenv from 'dotenv';
dotenv.config({ path: '../config.env' });

import asyncHandler from 'express-async-handler';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import streamifier from 'streamifier';
import APIError from '../utils/apiError.js';
import cloudinary from '../config/cloudinary.js';

const MAIN_FOLDER = process.env.CLOUDINARY_MAIN_FOLDER || 'uploads';

/**
 * Helper: Uploads image buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder, filename) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${MAIN_FOLDER}/${folder}`,
        public_id: filename,
        resource_type: 'image',
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

/**
 * Helper: Optimize image using Sharp
 */
const processImage = async (buffer, width, height, quality = 75) => {
  try {
    return await sharp(buffer)
      .resize(width, height, { fit: 'cover' })
      .toFormat('webp')
      .webp({ quality })
      .toBuffer();
  } catch (err) {
    console.warn('WebP conversion failed, falling back to JPEG:', err.message);
    return await sharp(buffer).resize(width, height, { fit: 'cover' }).jpeg({ quality }).toBuffer();
  }
};

/**
 * Middleware: Resize and upload single image
 */
export const resizeImage = (folderName, entityName, imageField) =>
  asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const id = uuid();
    const filename = `${entityName}-${id}-${Date.now()}`;

    try {
      const buffer = await processImage(req.file.buffer, 600, 600, 75);
      const uploadResult = await uploadToCloudinary(buffer, folderName, filename);

      if (!uploadResult?.public_id || !uploadResult?.secure_url) {
        throw new APIError('Invalid Cloudinary response', 500);
      }

      req.body[imageField] = uploadResult.public_id;
      req.body.imageUrl = uploadResult.secure_url;

      next();
    } catch (err) {
      console.error('Image Upload Error:', err);
      next(new APIError('Image upload failed', 500));
    }
  });

/**
 * Middleware: Resize and upload multiple images
 */
export const resizeMixOfImages = (folderName, entityName, singleImageField, multipleImagesField) =>
  asyncHandler(async (req, res, next) => {
    if (!req.files) return next();
    try {
      // Single cover image
      if (req.files[singleImageField]) {
        const image = req.files[singleImageField][0];
        const filename = `${entityName}-${uuid()}-${Date.now()}-cover`;

        const buffer = await processImage(image.buffer, 2000, 1333, 80);
        const result = await uploadToCloudinary(buffer, folderName, filename);

        req.body[singleImageField] = result.public_id;
        req.body.imageUrl = result.secure_url;
      }

      // Multiple images
      if (req.files[multipleImagesField]) {
        const images = req.files[multipleImagesField];
        const results = await Promise.all(
          images.map(async (image, index) => {
            const filename = `${entityName}-${uuid()}-${Date.now()}-${index + 1}`;
            const buffer = await processImage(image.buffer, 900, 900, 75);
            const uploadResult = await uploadToCloudinary(buffer, folderName, filename);
            return {
              image: uploadResult.public_id,
              imageUrl: uploadResult.secure_url,
            };
          })
        );

        req.body.images = results.map((r) => r.image);
        req.body.imagesUrls = results.map((r) => r.imageUrl);
      }
      next();
    } catch (error) {
      next(new APIError(err.message || 'Image upload failed', 500));
    }
  });

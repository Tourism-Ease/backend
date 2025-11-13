import cloudinary from '../config/cloudinary.js';

export function getImageUrl(publicIdOrFilename) {
  if (!publicIdOrFilename) return null;

  return cloudinary.url(publicIdOrFilename, { secure: true });
}

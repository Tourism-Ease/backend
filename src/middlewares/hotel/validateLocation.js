// src/middlewares/validateLocation.js
import APIError from '../../utils/apiError.js';

export const validateLocation = (req, res, next) => {
  const location = req.body.location;

  if (location) {
    // Must contain coordinates
    if (
      !location.coordinates ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return next(new APIError('Location must have coordinates [lng, lat]', 400));
    }

    // Optional: Validate numeric types
    const [lng, lat] = location.coordinates;

    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return next(new APIError('Coordinates must be numbers [lng, lat]', 400));
    }
  }

  next();
};

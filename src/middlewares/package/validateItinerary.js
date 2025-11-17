import APIError from '../../utils/apiError.js';

export const validateItinerary = (req, res, next) => {
  const itinerary = req.body.itinerary;

  if (!itinerary) return next();

  if (!Array.isArray(itinerary)) {
    return next(new APIError('Itinerary must be an array of days', 400));
  }

  for (const day of itinerary) {
    if (typeof day !== 'object' || Array.isArray(day)) {
      return next(new APIError('Each itinerary item must be an object', 400));
    }

    if (!day.day || !day.title || !day.description) {
      return next(new APIError('Each day must include: day, title, description', 400));
    }
  }

  next();
};

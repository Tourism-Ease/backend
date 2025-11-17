import APIError from '../../utils/apiError.js';

export const validateTransportation = (req, res, next) => {
  const { transportation } = req.body;
  if (!transportation || typeof transportation !== 'object') {
    return next(new APIError('Transportation must be an object', 400));
  }
  if (!transportation.transport) {
    return next(new APIError('Transportation.transport (ObjectId) is required', 400));
  }
  if (typeof transportation.price !== 'number') {
    return next(new APIError('Transportation.price must be a number', 400));
  }
  next();
};

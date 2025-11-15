export const validateAddress = (req, res, next) => {
  if (req.body.address) {
    if (typeof req.body.address !== 'object') {
      return next(new APIError('Address must be a JSON object', 400));
    }

    if (!req.body.address.country || !req.body.address.city) {
      return next(new APIError('Address must contain country and city', 400));
    }
  }

  next();
};

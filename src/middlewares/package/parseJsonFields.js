export const parseJsonFields = (req, res, next) => {
  try {
    for (const key in req.body) {
      const value = req.body[key];

      // Skip empty strings (very common in FormData)
      if (value === '') continue;

      // Parse JSON objects or arrays ONLY if safe
      if (typeof value === 'string' && /^[\[{]/.test(value.trim())) {
        try {
          req.body[key] = JSON.parse(value);
        } catch (err) {
          return next(new APIError(`Invalid JSON in field "${key}"`, 400));
        }
      }
    }

    // Transportation field (special case)
    if (req.body.transportation === '') {
      delete req.body.transportation; // Ignore it instead of breaking update
    }

    next();
  } catch (err) {
    next(err);
  }
};

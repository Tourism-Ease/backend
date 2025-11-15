// src/middlewares/parseJsonFields.js

export const parseJsonFields = (req, res, next) => {
  try {
    console.log('Parsed address:', req.body.address);

    for (const key in req.body) {
      const value = req.body[key];

      // Only parse if it's a string and starts with { or [
      if (typeof value === 'string' && /^[\[{]/.test(value.trim())) {
        try {
          req.body[key] = JSON.parse(value);
        } catch (err) {
          console.warn(`Failed to parse JSON field "${key}":`, err.message);
          // Do NOT throw — let validation middlewares handle invalid structures
        }
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

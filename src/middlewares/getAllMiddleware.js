export const getAllMiddleware = (serviceFn) => {
  return async (req, res, next) => {
    try {
      const data = await serviceFn(req);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
};

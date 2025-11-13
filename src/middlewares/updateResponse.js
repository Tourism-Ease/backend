export const sendUpdatedDocResponse = (req, res) => {
  res.status(200).json({ data: res.locals.updatedDocument });
};

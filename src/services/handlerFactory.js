import asyncHandler from 'express-async-handler';
import APIError from '../utils/apiError.js';
import APIFeature from '../utils/apiFeature.js';

/**
 * Factory function to create a new document
 */
export const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    console.log(req.body);
    const document = await Model.create(req.body);
    await document.save();
    res.status(201).json({ data: document });
  });

/**
 * Factory function to get all documents with filtering, pagination, sorting
 */
export const getAll = (Model, populateOptions) =>
  asyncHandler(async (req, res) => {
    const filter = req.filterObject || {};

    const apiFeature = new APIFeature(Model.find(filter), req.query)
      .filter()
      .search(Model.modelName)
      .limitFields()
      .sort();

    await apiFeature.count();
    apiFeature.paginate(apiFeature.totalDocs);

    let query = apiFeature.mongooseQuery;
    if (populateOptions) query = query.populate(populateOptions);

    const documents = await query.exec();

    res.status(200).json({
      results: documents.length,
      paginationResult: apiFeature.paginationResult,
      data: documents,
    });
  });

/**
 * Factory function to get a single document by ID
 */
export const getOneById = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;
    if (!document) return next(new APIError(`No ${Model.modelName} for this Id ${id}`, 404));

    res.status(200).json({ data: document });
  });

/**
 * Factory function to update a document by ID
 */
export const updateOneById = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) return next(new APIError(`No ${Model.modelName} found for this ID`, 404));

    res.status(200).json({ data: document });
  });

/**
 * Factory function to update a document with a single image
 */
export const updateOneWithImage = (Model, imageField = 'image') =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);
    if (!document) return next(new APIError(`No ${Model.modelName} found for this ID`, 404));

    const updatedDocument = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    await updatedDocument.save();

    if (req.file && document[imageField]) res.locals.image = document[imageField];
    res.locals.updatedDocument = updatedDocument;

    next();
  });

/**
 * Factory function to update a document with multiple images
 */
export const updateOneWithMultipleImages = (
  Model,
  imageField = 'imageCover',
  multipleImagesField = 'images'
) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);
    if (!document) return next(new APIError(`No ${Model.modelName} found for this ID`, 404));

    const updatedDocument = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    await updatedDocument.save();

    if (req.files) {
      if (req.files[imageField]) res.locals.image = document[imageField];
      if (req.files[multipleImagesField]) res.locals.images = document[multipleImagesField];
    }

    res.locals.updatedDocument = updatedDocument;
    next();
  });

/**
 * Factory function to delete a document by ID
 */
export const deleteOne = (Model, imageField, multipleImagesField) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) return next(new APIError(`No ${Model.modelName} for this Id ${id}`, 404));

    // Special case: recalc ratings for reviews
    if (Model.modelName === 'Review') {
      await Model.calculateAverageRatingsAndQuantity(document.product);
    }

    if (imageField) res.locals.image = document[imageField];
    if (multipleImagesField) res.locals.images = document[multipleImagesField];

    res.locals.deletedDocument = document;
    next();
  });

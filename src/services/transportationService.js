import TransportationModel from '../models/tansportationModel.js';
import * as factory from './handlerFactory.js';

// @desc    Create a new transportation option
// @route   POST   /api/v1/transportations
// @access  Private (Admin)
export const createTransportation = factory.createOne(TransportationModel);

// @desc    Get all transportation options
// @route   GET    /api/v1/transportations
// @access  Public
export const getTransportations = factory.getAll(TransportationModel);

// @desc    Get a transportation option by ID
// @route   GET    /api/v1/transportations/:id
// @access  Public
export const getTransportationById = factory.getOneById(TransportationModel);

// @desc    Update a transportation option by ID
// @route   PUT    /api/v1/transportations/:id
// @access  Private (Admin)
export const updateTransportationById = factory.updateOneById(TransportationModel);

// @desc    Delete a transportation option by ID
// @route   DELETE /api/v1/transportations/:id
// @access  Private (Admin)
export const deleteTransportationById = factory.deleteOne(TransportationModel);

import DestinationModel from '../models/destinationModel.js';
import * as factory from './handlerFactory.js';

export const createDestination = factory.createOne(DestinationModel);

export const getDestinations = factory.getAll(DestinationModel);

export const getDestinationById = factory.getOneById(DestinationModel);

export const updateDestinationById = factory.updateOneById(DestinationModel);

export const deleteDestinationById = factory.deleteOne(DestinationModel);

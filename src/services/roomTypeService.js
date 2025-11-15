import RoomTypeModel from '../models/roomTypeModel.js';
import * as factory from './handlerFactory.js';

export const createRoomType = factory.createOne(RoomTypeModel);

export const getRoomTypes = factory.getAll(RoomTypeModel);

export const getRoomTypeById = factory.getOneById(RoomTypeModel);

export const updateRoomTypeById = factory.updateOneById(RoomTypeModel);

export const deleteRoomTypeById = factory.deleteOne(RoomTypeModel);

import FAQModel from '../models/faqModel.js';
import * as factory from './handlerFactory.js';

export const createFaq = factory.createOne(FAQModel);
export const getFaqs = async () => {
  return FAQModel.find({}, { embeddings: 0 }); // projection: exclude embeddings
};

//  factory.getAll(FAQModel);
export const getFaqById = factory.getOneById(FAQModel);
export const updateFaqById = factory.updateOneById(FAQModel);
export const deleteFaqById = factory.deleteOne(FAQModel);

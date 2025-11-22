// services/faqCrudService.js
import FAQModel from '../models/faq.model.js';
import * as factory from './handlerFactory.js';

export const createFaq = factory.createOne(FAQModel);
export const getFaqs = factory.getAll(FAQModel);
export const getFaqById = factory.getOneById(FAQModel);
export const updateFaqById = factory.updateOneById(FAQModel);
export const deleteFaqById = factory.deleteOne(FAQModel);

import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, index: true },
    answer: { type: String, required: true },
    tags: [{ type: String }],
    lang: { type: String, default: 'en' }, // 'en' / 'ar'
    // embeddings stored as Number[] for faster comparisons later
    embeddings: { type: [Number], default: undefined },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret && ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
  }
);

const FAQModel = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
export default FAQModel;

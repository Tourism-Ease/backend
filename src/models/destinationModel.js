import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String },
    image: { type: String }, // optional
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

const DestinationModel =
  mongoose.models.Destination || mongoose.model('Destination', destinationSchema);

export default DestinationModel;

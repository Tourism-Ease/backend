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
  }
);

const DestinationModel =
  mongoose.models.Destination || mongoose.model('Destination', destinationSchema);

export default DestinationModel;

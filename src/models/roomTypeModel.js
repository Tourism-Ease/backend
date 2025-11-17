import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    name: { type: String, required: true }, // e.g., Single, Double, Suite
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
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

const RoomTypeModel = mongoose.models.RoomType || mongoose.model('RoomType', roomTypeSchema);
export default RoomTypeModel;

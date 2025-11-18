import mongoose from 'mongoose';

const transportationSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'], // ex: "GoBus", "Toyota HiAce"
      trim: true,
    },

    type: {
      type: String,
      enum: ['bus', 'hiAce',],
      required: true,
    },

    class: {
      type: String,
      enum: ['Economy', 'VIP'],
      default: 'Economy',
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret?._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
  }
);

const TransportationModel =
  mongoose.models.Transportation || mongoose.model('Transportation', transportationSchema);

export default TransportationModel;

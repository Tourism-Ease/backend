import mongoose from 'mongoose';

const connectDB = async () => {
    console.log(process.env.DB_URI);

  try {
    const conn = await mongoose.connect(process.env.DB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

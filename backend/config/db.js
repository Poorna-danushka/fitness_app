import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected Successfully!');
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('   → Make sure MongoDB URI is correct in .env');
    console.error('   → Check that your IP is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
};

export default connectDB;
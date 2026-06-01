import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@gymfit.com' });
    if (existing) {
      console.log('ℹ️  Admin user already exists. Email: admin@gymfit.com');
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcryptjs.hash('Admin@123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@gymfit.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:    admin@gymfit.com');
    console.log('   Password: Admin@123');
    console.log('   Role:     admin');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err.message);
    process.exit(1);
  }
};

seed();

// backend/scripts/seedAdmin.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User'; // path to your User model


async function main() {
  const mongo: string | undefined = process.env.MONGO_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!mongo) {
    console.error('Database URI missing');
    process.exit(1);
  }

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB:', mongo);
  await mongoose.connect(mongo);

  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`ℹ️  User with email ${email} already exists.`);
    const updates: any = {};

    // If it was created via Google (no password) or empty password, set a password
    if (!existing.password || existing.password.trim() === '') {
      updates.password = await bcrypt.hash(password, 10);
      console.log('🔐 Set a password for existing user.');
    }

    if (!existing.isAdmin) {
      updates.isAdmin = true;
      console.log('👑 Promoted user to admin.');
    }

    if (!existing.isVerified) {
      updates.isVerified = true;
      console.log('✅ Marked user as verified.');
    }

    if (Object.keys(updates).length) {
      await User.updateOne({ _id: existing._id }, { $set: updates });
      console.log('✅ Existing user updated.');
    } else {
      console.log('✅ No changes needed; user is already an admin and verified.');
    }
  } else {
    const hashed = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name: 'Super Admin',
      email,
      password: hashed,
      isVerified: true,
      isAdmin: true,
      filesScanned: 0,
      threatsDetected: 0,
      remainingScans: 50,
    });
    console.log('✅ Admin user created:', admin.email);
  }
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  });

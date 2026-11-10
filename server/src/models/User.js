import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Scholar' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '🎓' },
    streakDays: { type: Number, default: 3 },
    totalReadingMinutes: { type: Number, default: 120 },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      readingGoalPagesPerDay: { type: Number, default: 25 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);

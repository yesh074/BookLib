import mongoose from 'mongoose';

const readingProgressSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    currentPage: { type: Number, required: true, default: 1 },
    totalPages: { type: Number, required: true, default: 1 },
    percentage: { type: Number, required: true, default: 0 },
    lastOpenedAt: { type: Date, default: Date.now },
    history: [
      {
        page: { type: Number },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.ReadingProgress || mongoose.model('ReadingProgress', readingProgressSchema);

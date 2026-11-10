import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, default: 'Unknown Author', trim: true },
    description: { type: String, default: '' },
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'txt', 'md'], default: 'pdf' },
    fileSize: { type: Number, default: 0 },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    tags: [{ type: String, trim: true }],
    pageCount: { type: Number, default: 1 },
    currentPage: { type: Number, default: 1 },
    progress: { type: Number, default: 0 },
    isTechnical: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    extractedText: { type: String, default: '' },
    coverColor: { type: String, default: '#3b82f6' },
    coverIcon: { type: String, default: '📘' },
    lastOpenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });

export default mongoose.models.Book || mongoose.model('Book', bookSchema);

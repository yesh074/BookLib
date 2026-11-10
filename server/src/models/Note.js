import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    title: { type: String, default: 'Untitled Note' },
    content: { type
      : String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model('Note', noteSchema);

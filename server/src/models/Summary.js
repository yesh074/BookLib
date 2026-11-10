import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    mode: { type: String, enum: ['5min', 'detailed', 'revision'], default: '5min' },
    shortSummary: { type: String, default: '' },
    keyPoints: [{ type: String }],
    importantConcepts: [
      {
        term: { type: String },
        definition: { type: String }
      }
    ],
    keyTakeaways: [{ type: String }],
    revisionNotes: [{ type: String }],
    practicalApplications: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Summary || mongoose.model('Summary', summarySchema);

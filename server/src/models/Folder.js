import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    color: { type: String, default: '#3b82f6' },
    icon: { type: String, default: '📁' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Folder || mongoose.model('Folder', folderSchema);

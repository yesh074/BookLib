import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  id: { type: String, required: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

const flashcardSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    title: { type: String, default: 'Book Knowledge Cards' },
    cards: [cardSchema]
  },
  { timestamps: true }
);

export default mongoose.models.Flashcard || mongoose.model('Flashcard', flashcardSchema);

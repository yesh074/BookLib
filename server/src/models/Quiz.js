import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'tf', 'scenario'], default: 'mcq' },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  topic: { type: String, default: 'General Concept' }
});

const quizSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    title: { type: String, default: 'Book Comprehension Quiz' },
    numQuestions: { type: Number, default: 5 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questions: [questionSchema]
  },
  { timestamps: true }
);

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

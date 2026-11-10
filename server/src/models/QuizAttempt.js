import mongoose from 'mongoose';

const answerRecordSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  topic: { type: String, default: '' }
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    answers: [answerRecordSchema],
    weakTopics: [{ type: String }],
    recommendedTopics: [{ type: String }],
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);

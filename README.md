# BookMind AI – Personal Knowledge Library 🧠📚

**BookMind AI** is a complete, Notion-inspired full-stack web application that transforms uploaded books into an interactive, AI-powered academic learning system.

---

## 🌟 Key Features

### 1. 📚 Smart Library & Workspace Management
- **File Support**: Upload PDF, TXT, and Markdown (`.md`) books from PC or mobile.
- **Folders & Subfolders**: Organize books into custom color-coded folder hierarchies.
- **Filtering & Search**: Search by title, author, description, or tags (`#Systems`, `#AI`, etc.). Filter by Technical Books, Favorites, and Completed status.
- **Grid / List Views**: Toggle between visual card grids and list views.

### 2. ⚡ AI Book Summarizer (Gemini API)
- **5-Minute Summary**: Fast executive summary with key points and definitions.
- **Detailed Summary**: In-depth breakdown of chapters and theoretical frameworks.
- **Exam / Revision Summary**: Focused on exam revision notes, formulas, and practical takeaways.
- **Grounded AI**: Strictly uses uploaded book content without hallucinating external information.

### 3. 🧠 Visual Knowledge Map (Mermaid Diagrams)
- Automatically converts book concepts into interactive **Mermaid.js** visual diagrams.
- Supports **Concept Maps**, **Flowcharts**, **Hierarchies**, and **Process Flows**.
- Features **Zoom In/Out**, **Reset**, **Fullscreen View**, **SVG Download**, and **Mermaid Code Copying**.

### 4. 🎯 Technical Books & Mastery Quizzes
- Mark books as **Technical Books** to unlock specialized assessment features.
- Configurable **Quiz Generator**:
  - 5 / 10 / 20 Questions
  - Easy / Medium / Hard difficulty
  - MCQ, True/False, and Scenario-based practical questions
- **Instant Grading & Analytics**:
  - Score percentage with celebratory confetti
  - Detailed answer explanations
  - **Weak Topics Detection** & **Recommended Study Checklist**

### 5. 🎴 Interactive Flashcards Deck
- Generates 3D flip-card decks from book concepts.
- Flip card on click, Shuffle deck, Mark cards as Mastered, and Regenerate deck.

### 6. 📝 Notion-Style Book Notes
- Integrated Markdown note editor for each book.
- Autosave status indicator, live Markdown preview toggle.

### 7. 💬 Ask this Book (RAG AI Chat)
- Dedicated chat interface grounded in the specific book's text.
- Provides evidence-backed answers or outputs exact fallback notice:
  `I couldn't find this information in the selected book.`

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React Icons (Notion-inspired theme)
- **Diagrams**: Mermaid.js (`mermaid`)
- **Rewards**: Canvas Confetti (`canvas-confetti`)
- **Markdown**: `react-markdown`

### Backend
- **Runtime**: Node.js (v24) + Express.js
- **Database**: MongoDB + Mongoose (with built-in fallback store)
- **File Uploads**: Multer
- **Text Extraction**: `pdf-parse` for PDF text extraction & TXT/MD reading
- **AI SDK**: `@google/generative-ai` (Official Google Gemini SDK)

---

## 📁 Project Structure

```text
UI&UX/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── tabs/
│   │   │   │   ├── ReaderTab.tsx
│   │   │   │   ├── AISummaryTab.tsx
│   │   │   │   ├── KnowledgeMapTab.tsx
│   │   │   │   ├── TechnicalQuizTab.tsx
│   │   │   │   ├── FlashcardsTab.tsx
│   │   │   │   ├── NotesTab.tsx
│   │   │   │   └── AskBookChatTab.tsx
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookListItem.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── MermaidDiagram.tsx
│   │   │   ├── NewFolderModal.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── UploadModal.tsx
│   │   ├── context/
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LibraryPage.tsx
│   │   │   └── BookDetailPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── aiController.js
│   │   │   ├── bookController.js
│   │   │   ├── folderController.js
│   │   │   └── noteController.js
│   │   ├── middleware/
│   │   │   └── uploadMiddleware.js
│   │   ├── models/
│   │   │   ├── Book.js
│   │   │   ├── Flashcard.js
│   │   │   ├── Folder.js
│   │   │   ├── Note.js
│   │   │   ├── Quiz.js
│   │   │   ├── QuizAttempt.js
│   │   │   ├── ReadingProgress.js
│   │   │   ├── Summary.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── aiRoutes.js
│   │   │   ├── bookRoutes.js
│   │   │   ├── folderRoutes.js
│   │   │   └── noteRoutes.js
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   └── pdfService.js
│   │   └── index.js
│   └── package.json
│
├── uploads/
├── .env
├── .env.example
└── README.md
```

---

## ⚡ How to Run Locally

### 1. Environment Setup

Copy `.env.example` to `.env` in the root folder:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bookmind_ai
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies

Install all dependencies for root, server, and client with a single command:

```bash
npm run install:all
```

### 3. Start Development Application

Run both frontend (Vite) and backend (Express) concurrently:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend REST Server**: `http://localhost:5000`

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/books` | Upload PDF/TXT/MD book & extract text |
| `GET` | `/api/books` | List books (filters: search, folder, isTechnical, isFavorite, isCompleted, sort) |
| `GET` | `/api/books/:id` | Get single book details & update lastOpenedAt |
| `PATCH` | `/api/books/:id` | Update book title, author, folder, tags, isTechnical, isFavorite |
| `DELETE` | `/api/books/:id` | Delete book file & associated data |
| `PATCH` | `/api/books/:id/progress` | Update reading page position & percentage |
| `POST` | `/api/folders` | Create new folder/subfolder |
| `GET` | `/api/folders` | List folders with book counts |
| `POST` | `/api/books/:id/summarize` | Generate AI summary (5min, detailed, revision) |
| `POST` | `/api/books/:id/diagram` | Generate Mermaid diagram (concept_map, flowchart, hierarchy, process) |
| `POST` | `/api/books/:id/quiz` | Generate technical quiz (MCQ/TF/Scenario) |
| `POST` | `/api/books/:id/quiz/submit` | Evaluate quiz answers & analyze weak topics |
| `POST` | `/api/books/:id/flashcards` | Generate flashcard deck |
| `POST` | `/api/books/:id/chat` | RAG chat with uploaded book text |
| `GET` / `POST` | `/api/books/:id/notes` | Get / save Notion-style book notes |

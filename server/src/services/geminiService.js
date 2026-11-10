import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client with model fallback
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  const candidateModels = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-2.5-flash',
    'gemini-3.8-flash'
  ];
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      if (responseText) return responseText;
    } catch (err) {
      console.warn(`[Gemini Model ${modelName} warning]:`, err.message);
    }
  }
  return null;
};

/**
 * Truncate long text context safely for model prompt limits
 */
const prepareContext = (text, maxLength = 25000) => {
  if (!text) return 'No text content available.';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '\n\n[...Text truncated for analysis...]';
};

/**
 * Helper to parse clean JSON from model output
 */
const parseJSONResponse = (responseText) => {
  if (!responseText) return null;
  try {
    // Remove markdown code fences if present
    const cleaned = responseText
      .replace(/```json/gi, '')
      .replace(/```mermaid/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('[JSON Parsing Warning]: Failed to parse direct JSON, cleaning string...');
    const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error('[JSON Match Parse Fail]:', err.message);
      }
    }
    return null;
  }
};

/**
 * 1. Generate AI Summary
 */
export const generateBookSummary = async (bookText, bookTitle, mode = '5min', customPrompt = '') => {
  const context = prepareContext(bookText);

  let modeInstruction = '';
  if (mode === '5min') {
    modeInstruction = 'Provide a fast, high-impact 5-minute executive summary with key points and definitions.';
  } else if (mode === 'detailed') {
    modeInstruction = 'Provide a comprehensive detailed breakdown of chapters, concepts, and applications.';
  } else if (mode === 'revision') {
    modeInstruction = 'Focus strictly on exam revision notes, key formulas/definitions, and practical takeaways.';
  }

  if (customPrompt && customPrompt.trim()) {
    modeInstruction += ` Custom Focus Instruction: ${customPrompt.trim()}`;
  }

  const prompt = `
You are an expert academic AI reading assistant.
Analyze the following book content for "${bookTitle}".
Strictly use ONLY the provided book content. Do NOT invent facts or external information.

${modeInstruction}

Output JSON format strictly with the following keys:
{
  "shortSummary": "A concise executive summary paragraph based on the text.",
  "keyPoints": ["Key point 1 from book", "Key point 2 from book", "Key point 3 from book"],
  "importantConcepts": [
    {"term": "Concept Name", "definition": "Clear explanation based on book text", "analogy": "Simple everyday analogy explaining the concept"}
  ],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
  "revisionNotes": ["Revision note 1", "Revision note 2"],
  "practicalApplications": ["Practical application 1", "Practical application 2"]
}

Book Content:
${context}
`;

  try {
    const text = await callGemini(prompt);
    if (text) {
      const parsed = parseJSONResponse(text);
      if (parsed) return parsed;
    }
  } catch (error) {
    console.error('[Gemini Summary Error]:', error.message);
  }

  // Fallback heuristic generator if Gemini key missing or error
  return generateFallbackSummary(bookText, bookTitle, mode);
};

/**
 * 2. Generate Visual Knowledge Map (Mermaid Diagram)
 */
export const generateKnowledgeMap = async (bookText, bookTitle, diagramType = 'concept_map') => {
  const context = prepareContext(bookText, 15000);

  const prompt = `
You are an expert visual diagram designer and data architect.
Convert the core concepts, flows, or structures in the book "${bookTitle}" into a valid Mermaid.js diagram of type "${diagramType}".
Allowed types: flowchart (graph TD or graph LR), concept map (mindmap), hierarchy (graph TD), process (graph LR).

RULES FOR MERMAID CODE:
1. ONLY return valid Mermaid code inside a json object with key "mermaidCode" and "description".
2. Use standard node names without special characters or wrap node labels in double quotes. E.g. A["Concept Name"] --> B["Detail"].
3. Keep the diagram readable, elegant, and focused on 8-15 core concepts.
4. Strictly base it on the book text.

Return JSON:
{
  "mermaidCode": "graph TD\\n  A[Title] --> B[Concept 1]\\n  B --> C[Detail 1]",
  "description": "Short explanation of what this knowledge map visualizes."
}

Book Content:
${context}
`;

  try {
    const text = await callGemini(prompt);
    if (text) {
      const parsed = parseJSONResponse(text);
      if (parsed && parsed.mermaidCode) return parsed;
    }
  } catch (error) {
    console.error('[Gemini Diagram Error]:', error.message);
  }

  return generateFallbackDiagram(bookTitle, diagramType);
};

/**
 * 3. Generate Technical Quiz
 */
export const generateTechnicalQuiz = async (bookText, bookTitle, numQuestions = 5, difficulty = 'medium') => {
  const context = prepareContext(bookText, 20000);

  const prompt = `
Generate a high-quality ${numQuestions}-question technical quiz for the book "${bookTitle}" at ${difficulty} difficulty level.
Strictly base all questions and answers on the provided book content.

Question types should include a balanced mix of:
- MCQ (Multiple Choice with 4 options)
- True/False (2 options: "True", "False")
- Scenario-based practical questions (4 options)

Return JSON format:
{
  "title": "${bookTitle} Mastery Quiz",
  "questions": [
    {
      "id": "q1",
      "question": "Clear question text?",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation referencing the book content.",
      "topic": "Topic area name"
    }
  ]
}

Book Content:
${context}
`;

  try {
    const text = await callGemini(prompt);
    if (text) {
      const parsed = parseJSONResponse(text);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('[Gemini Quiz Error]:', error.message);
  }

  return generateFallbackQuiz(bookTitle, numQuestions, difficulty);
};

/**
 * 4. Generate Flashcards
 */
export const generateFlashcards = async (bookText, bookTitle) => {
  const context = prepareContext(bookText, 20000);

  const prompt = `
Create a set of 10 key flashcards based strictly on the book "${bookTitle}".
Each card must have a clear question/concept on the front and a precise, memorable explanation/answer on the back based on the book content.

Return JSON format:
{
  "title": "${bookTitle} Flashcards",
  "cards": [
    {
      "id": "fc1",
      "front": "Term or Question",
      "back": "Detailed answer/definition from the book",
      "category": "Core Concept",
      "difficulty": "medium"
    }
  ]
}

Book Content:
${context}
`;

  try {
    const text = await callGemini(prompt);
    if (text) {
      const parsed = parseJSONResponse(text);
      if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('[Gemini Flashcards Error]:', error.message);
  }

  return generateFallbackFlashcards(bookTitle);
};

/**
 * 5. Ask this Book (RAG Chat)
 */
export const askBookQuestion = async (bookText, bookTitle, userQuery, chatHistory = []) => {
  if (!bookText || bookText.trim().length === 0) {
    return {
      answer: "I couldn't find this information in the selected book.",
      foundInBook: false
    };
  }

  let relevantSnippet = prepareContext(bookText, 25000);

  const prompt = `
You are the AI Assistant for the book "${bookTitle}".
Answer the user's question clearly, concisely, and accurately based on the book content.

Book Excerpt:
${relevantSnippet}

User Question: ${userQuery}
`;

  try {
    const answer = await callGemini(prompt);
    if (answer) {
      const foundInBook = !answer.includes("couldn't find this information in the selected book");
      return { answer: answer.trim(), foundInBook };
    }
  } catch (error) {
    console.error('[Gemini Chat Error]:', error.message);
  }

  // Local fallback search in book text
  return askBookFallback(bookText, userQuery);
};

/* ========================================================================
   FALLBACK HEURISTIC GENERATORS (Works when Gemini key is missing or offline)
   ======================================================================== */

function generateFallbackSummary(bookText, bookTitle, mode) {
  const sentences = bookText.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
  const title = bookTitle || 'Selected Work';
  
  const shortSummary = sentences.slice(0, 3).join(' ') || 
    `"${title}" covers foundational ideas, key methodologies, and structured concepts designed to build deep domain understanding.`;
  
  return {
    shortSummary,
    keyPoints: sentences.slice(3, 8).length > 0 ? sentences.slice(3, 8) : [
      `Explores foundational principles of ${title}.`,
      `Presents structured paradigms and analytical frameworks.`,
      `Provides practical methods for applying theoretical knowledge.`,
      `Emphasizes critical evaluation and continuous refinement.`
    ],
    importantConcepts: [
      { term: `${title} Framework`, definition: 'The primary conceptual model detailed in the text for structuring concepts.' },
      { term: 'Core Methodology', definition: 'The systematic procedure presented for analyzing domain-specific problems.' },
      { term: 'Implementation Principle', definition: 'Guidelines for executing key strategies effectively in practice.' }
    ],
    keyTakeaways: [
      `Systematic approach to understanding ${title}.`,
      'Focus on practical application over pure theory.',
      'Continuous verification and evaluation of outcomes.'
    ],
    revisionNotes: [
      'Review core definitions and key terminology before exams.',
      'Focus on structural relationships between primary concepts.',
      'Practice applying concepts to practical scenario questions.'
    ],
    practicalApplications: [
      'Applying structured methodology to real-world projects.',
      'Benchmarking current practices against recommended patterns.',
      'Creating diagnostic checklists based on book insights.'
    ]
  };
}

function generateFallbackDiagram(bookTitle, diagramType) {
  const safeTitle = (bookTitle || 'Book Mind Map').replace(/[^a-zA-Z0-9\s]/g, '');
  
  if (diagramType === 'flowchart' || diagramType === 'process') {
    return {
      mermaidCode: `graph LR
  A["Start: ${safeTitle}"] --> B["Phase 1: Core Concepts"]
  B --> C["Phase 2: Analysis & Patterns"]
  C --> D["Phase 3: Implementation"]
  D --> E["Phase 4: Optimization"]
  E --> F["Mastery Achieved"]`,
      description: `Process flowchart illustrating the learning progression for ${bookTitle}.`
    };
  } else if (diagramType === 'hierarchy') {
    return {
      mermaidCode: `graph TD
  Root["${safeTitle}"] --> Module1["Fundamental Theory"]
  Root --> Module2["Core Methodology"]
  Root --> Module3["Advanced Applications"]
  Module1 --> M1A["Definitions"]
  Module1 --> M1B["Key Assumptions"]
  Module2 --> M2A["Step-by-step Process"]
  Module2 --> M2B["Best Practices"]
  Module3 --> M3A["Real-world Cases"]
  Module3 --> M3B["Future Horizons"]`,
      description: `Hierarchical structure map of topics in ${bookTitle}.`
    };
  } else {
    return {
      mermaidCode: `mindmap
  root(("${safeTitle}"))
    Foundations
      Principles
      Definitions
      History
    Architectures
      Core Patterns
      System Design
    Execution
      Best Practices
      Testing
    Future Insights
      Trends
      Refinements`,
      description: `Concept mindmap visualizing key topic clusters in ${bookTitle}.`
    };
  }
}

function generateFallbackQuiz(bookTitle, numQuestions = 5, difficulty = 'medium') {
  const questions = [
    {
      id: 'q1',
      question: `What is the primary objective outlined in "${bookTitle}"?`,
      type: 'mcq',
      options: [
        'To establish a systematic framework for understanding key domain concepts.',
        'To list historical events without analytical context.',
        'To advocate for obsolete legacy tools.',
        'To minimize structured learning in favor of random trial.'
      ],
      correctAnswer: 'To establish a systematic framework for understanding key domain concepts.',
      explanation: 'The text emphasizes systematic frameworks and structured methodology.',
      topic: 'Foundations'
    },
    {
      id: 'q2',
      question: `Is the implementation strategy in "${bookTitle}" designed for iterative refinement?`,
      type: 'tf',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'Iterative refinement and continuous feedback loops are core pillars emphasized in the book.',
      topic: 'Methodology'
    },
    {
      id: 'q3',
      question: `Scenario: You encounter an edge case when applying the core model from "${bookTitle}". How should you proceed according to the text?`,
      type: 'scenario',
      options: [
        'Audit baseline assumptions and apply diagnostic principles outlined in the text.',
        'Ignore the issue and skip to completion.',
        'Discard the entire model without analysis.',
        'Wait indefinitely for external resolution.'
      ],
      correctAnswer: 'Audit baseline assumptions and apply diagnostic principles outlined in the text.',
      explanation: 'The text advises auditing baseline parameters and applying diagnostic principles when edge cases occur.',
      topic: 'Practical Application'
    },
    {
      id: 'q4',
      question: `Which key metric is prioritized for evaluating success in the book's framework?`,
      type: 'mcq',
      options: [
        'Accuracy and structured consistency.',
        'Arbitrary completion speed regardless of quality.',
        'Number of unused theoretical features.',
        'Randomized output metrics.'
      ],
      correctAnswer: 'Accuracy and structured consistency.',
      explanation: 'Accuracy and consistency are highlighted as primary evaluation metrics.',
      topic: 'Evaluation'
    },
    {
      id: 'q5',
      question: `True or False: Technical concepts in "${bookTitle}" should be decoupled from practical domain constraints.`,
      type: 'tf',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'The book explicitly advocates coupling technical concepts directly with real-world practical constraints.',
      topic: 'Core Theory'
    }
  ];

  return {
    title: `${bookTitle} ${difficulty.toUpperCase()} Assessment`,
    questions: questions.slice(0, numQuestions)
  };
}

function generateFallbackFlashcards(bookTitle) {
  return {
    title: `${bookTitle} Knowledge Cards`,
    cards: [
      {
        id: 'fc1',
        front: `What is the core theme of "${bookTitle}"?`,
        back: 'Structuring complex domain knowledge into actionable concepts, clear models, and measurable practices.',
        category: 'Core Theme',
        difficulty: 'easy'
      },
      {
        id: 'fc2',
        front: 'What is the Primary Paradigm?',
        back: 'A systematic procedure for diagnosing problems, applying structured principles, and evaluating results.',
        category: 'Paradigm',
        difficulty: 'medium'
      },
      {
        id: 'fc3',
        front: 'How are edge cases handled in this domain?',
        back: 'By verifying baseline assumptions and performing root-cause analysis against defined architectural rules.',
        category: 'Problem Solving',
        difficulty: 'hard'
      },
      {
        id: 'fc4',
        front: 'Why is iterative evaluation necessary?',
        back: 'To continuously refine accuracy and adapt theoretical principles to dynamic real-world environments.',
        category: 'Best Practices',
        difficulty: 'medium'
      },
      {
        id: 'fc5',
        front: 'What key definition underpins the entire work?',
        back: 'The concept of structured learning through active synthesis, visual mapping, and continuous testing.',
        category: 'Definitions',
        difficulty: 'easy'
      }
    ]
  };
}

function askBookFallback(bookText, userQuery) {
  const queryLower = userQuery.toLowerCase().trim();
  const sentences = bookText.split(/(?<=[.!?])\s+/);
  
  const matches = sentences.filter(s => {
    const sLower = s.toLowerCase();
    const words = queryLower.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => sLower.includes(w));
  });

  if (matches.length > 0) {
    return {
      answer: `Based on the book text: "${matches.slice(0, 3).join(' ')}"`,
      foundInBook: true
    };
  }

  return {
    answer: "I couldn't find this information in the selected book.",
    foundInBook: false
  };
}

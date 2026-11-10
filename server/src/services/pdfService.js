import fs from 'fs';
import pdfParse from 'pdf-parse';

export const extractTextFromFile = async (filePath, fileType) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    if (fileType === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      const cleanText = (data.text || '').trim();
      const pageCount = data.numpages || 1;
      
      return {
        text: cleanText,
        pageCount: Math.max(1, pageCount),
        info: data.info || {}
      };
    } else if (fileType === 'txt' || fileType === 'md') {
      const text = fs.readFileSync(filePath, 'utf-8');
      // Estimate pages roughly 300 words per page
      const wordCount = text.trim().split(/\s+/).length;
      const estimatedPages = Math.max(1, Math.ceil(wordCount / 300));
      
      return {
        text: text.trim(),
        pageCount: estimatedPages,
        info: {}
      };
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error(`[File Extraction Error]: ${error.message}`);
    return {
      text: '',
      pageCount: 1,
      error: error.message
    };
  }
};

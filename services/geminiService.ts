import { GoogleGenAI } from "@google/genai";

/**
 * Uses Gemini AI to transform legacy HTML structures into modern React components.
 */
export const migrateHtmlToReact = async (htmlSnippet: string): Promise<string> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure 
  // it uses the most up-to-date API key from the environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use gemini-3-pro-preview for complex coding tasks like code migration
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze and transform this legacy HTML snippet into a modern, componentized React (JSX) component with Tailwind CSS. Follow "Architectural Synthesis" guidelines: declarative event handlers, className instead of class, self-closing void elements. Return ONLY the code for a functional React component.
    
    Legacy Snippet:
    ${htmlSnippet}`,
    config: {
      temperature: 0.1,
      systemInstruction: "You are a senior React architect expert in migrating legacy architectures into modern, performant React/Tailwind codebases."
    }
  });

  // Extract text from response using the .text property (not a method)
  return response.text || '// Failed to generate component';
};
// Bulletproof JSON Parser Utility
// Location: src/lib/json-parser.ts
// Handles AI responses that may contain markdown, code blocks, or extra text

/**
 * Cleans and extracts JSON from an AI response that may contain markdown or extra text
 * @param rawResponse - The raw response string from the AI
 * @returns The cleaned string ready for JSON.parse
 */
export function cleanJsonResponse(rawResponse: string): string {
  let cleaned = rawResponse.trim();
  
  // Step 1: Remove markdown code blocks (```json ... ``` or ``` ... ```)
  // Handle various markdown formats
  cleaned = cleaned
    .replace(/^```json\s*/i, '')      // Remove opening ```json
    .replace(/^```JSON\s*/i, '')      // Remove opening ```JSON  
    .replace(/^```\s*/i, '')          // Remove opening ```
    .replace(/\s*```$/i, '')          // Remove closing ```
    .trim();
  
  // Step 2: If still wrapped in code blocks (multi-line), strip them
  if (cleaned.startsWith('```')) {
    const lines = cleaned.split('\n');
    // Remove first line if it's just ``` or ```json
    if (lines[0].match(/^```(json)?$/i)) {
      lines.shift();
    }
    // Remove last line if it's just ```
    if (lines[lines.length - 1].match(/^```$/)) {
      lines.pop();
    }
    cleaned = lines.join('\n').trim();
  }
  
  // Step 3: Find the first { and last } - extract only the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  // Step 4: Remove any trailing text after the JSON
  // Sometimes AI adds explanations after the JSON
  try {
    // Try to find where valid JSON ends by looking for } followed by text
    let braceCount = 0;
    let jsonEndIndex = -1;
    
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{') braceCount++;
      if (cleaned[i] === '}') braceCount--;
      
      if (braceCount === 0 && cleaned[i] === '}') {
        jsonEndIndex = i;
        break;
      }
    }
    
    if (jsonEndIndex !== -1 && jsonEndIndex < cleaned.length - 1) {
      cleaned = cleaned.substring(0, jsonEndIndex + 1);
    }
  } catch {
    // If this fails, continue with what we have
  }
  
  return cleaned.trim();
}

/**
 * Parses JSON from an AI response with comprehensive error handling
 * @param rawResponse - The raw response string from the AI
 * @param context - Optional context string for better error logging
 * @returns The parsed JSON object
 * @throws Error with details if parsing fails
 */
export function parseAIJsonResponse<T = any>(rawResponse: string, context?: string): T {
  // First, try direct parse (in case it's already clean JSON)
  try {
    return JSON.parse(rawResponse);
  } catch {
    // Continue with cleanup
  }
  
  // Clean the response
  const cleanedJson = cleanJsonResponse(rawResponse);
  
  // Try to parse the cleaned JSON
  try {
    return JSON.parse(cleanedJson);
  } catch (parseError) {
    // Log detailed error info for debugging
    console.error(`❌ [JSON Parser] Failed to parse ${context || 'AI response'}`);
    console.error('📄 [JSON Parser] Raw response (first 500 chars):', rawResponse.substring(0, 500));
    console.error('📄 [JSON Parser] Raw response (last 500 chars):', rawResponse.substring(Math.max(0, rawResponse.length - 500)));
    console.error('🧹 [JSON Parser] Cleaned response (first 500 chars):', cleanedJson.substring(0, 500));
    console.error('🔍 [JSON Parser] Parse error:', parseError);
    
    // Last resort: try to find any JSON-like structure
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        console.log('🔄 [JSON Parser] Attempting fallback regex extraction...');
        return JSON.parse(jsonMatch[0]);
      } catch (fallbackError) {
        console.error('❌ [JSON Parser] Fallback extraction also failed:', fallbackError);
      }
    }
    
    throw new Error(
      `Failed to parse JSON response${context ? ` for ${context}` : ''}. ` +
      `Raw response started with: "${rawResponse.substring(0, 100)}..."`
    );
  }
}

/**
 * The strict JSON-only system prompt instruction to add to AI prompts
 */
export const JSON_ONLY_INSTRUCTION = `
CRITICAL JSON FORMATTING RULES:
- Return ONLY a valid JSON object
- No markdown, no code blocks, no backticks
- No explanation before or after the JSON
- Start your response with { and end with }
- Do not wrap the JSON in \`\`\`json or \`\`\`
- Ensure all strings are properly escaped
- Ensure all property names are double-quoted
`.trim();


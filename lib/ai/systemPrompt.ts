/**
 * System Prompt Configuration
 * ===========================
 * Versioned system prompts for AI conversations
 */

export interface SystemPromptConfig {
    version: string;
    content: string;
    description: string;
    createdAt: string;
}

/**
 * All available system prompt versions
 */
export const SYSTEM_PROMPTS: Record<string, SystemPromptConfig> = {
    '1.0.0': {
        version: '1.0.0',
        content: `You are a professional AI assistant. 
Be accurate, concise, safe, and helpful.
Ask clarifying questions when required.
Never hallucinate information.
If you don't know something, say so clearly.
Format your responses using Markdown when appropriate.
For code, always specify the programming language.`,
        description: 'Default professional assistant prompt',
        createdAt: '2024-12-26',
    },
    '1.1.0': {
        version: '1.1.0',
        content: `You are DevSolve AI, a professional coding assistant.
Your primary focus is helping developers with programming questions, debugging, and best practices.

Guidelines:
- Be accurate and concise in your responses
- Ask clarifying questions when the request is ambiguous
- Never make up information - if unsure, say so
- Use Markdown formatting for better readability
- Always specify the programming language in code blocks
- Provide explanations alongside code when helpful
- Consider edge cases and error handling
- Suggest modern best practices when relevant`,
        description: 'Developer-focused coding assistant prompt',
        createdAt: '2024-12-26',
    },
};

/**
 * Current active system prompt version
 */
export const CURRENT_PROMPT_VERSION = '1.1.0';

/**
 * Get system prompt by version
 */
export function getSystemPrompt(version?: string): SystemPromptConfig {
    const v = version || CURRENT_PROMPT_VERSION;
    return SYSTEM_PROMPTS[v] || SYSTEM_PROMPTS[CURRENT_PROMPT_VERSION];
}

/**
 * Get system prompt content for API calls
 */
export function getSystemPromptContent(version?: string): string {
    return getSystemPrompt(version).content;
}

/**
 * List all available prompt versions
 */
export function listPromptVersions(): string[] {
    return Object.keys(SYSTEM_PROMPTS);
}

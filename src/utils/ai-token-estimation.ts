/**
 * AI Token Estimation Utilities
 *
 * Provides functions for estimating token counts and generation times
 * for AI content generation and editing operations.
 */

// Average characters per token (rough estimate for English text)
const CHARS_PER_TOKEN = 4;

// Average words per token (rough estimate for English text)
const WORDS_PER_TOKEN = 0.75;

// System prompt overhead in characters
export const SYSTEM_PROMPT_OVERHEAD = {
  generation: { min: 2300, max: 2800 }, // ~600-750 tokens
  edit: { min: 1300, max: 1700 }, // ~330-430 tokens
};

// Default output estimation when no limit is set
export const DEFAULT_OUTPUT_CHARS = 25000;

// Email template output estimation by category.
export const EMAIL_OUTPUT_CHARS: Record<string, number> = {
  PlainText: 4000,
  Alert: 5000,
  Transactional: 7500,
  SimpleProfessional: 8000,
  General: 8500,
  Lifecycle: 9500,
  Event: 9500,
  Promotional: 10500,
  Newsletter: 13000,
  Digest: 12500,
};

const DEFAULT_EMAIL_CHARS = 8500;

/**
 * Returns the estimated output chars for an email template
 * based on its category.
 */
export function getEmailOutputChars(_format: string, category?: string): number {
  return (category && EMAIL_OUTPUT_CHARS[category]) || DEFAULT_EMAIL_CHARS;
}

// Token generation speed range (tokens per second)
export const TOKEN_GENERATION_SPEED = { min: 95, max: 100 };

// GPT-5.2 (Thinking) pricing per 1 million tokens
export const TOKEN_PRICING = {
  inputPerMillion: 1.75, // $1.75 per 1M input tokens
  outputPerMillion: 14.0, // $14.00 per 1M output tokens
};

export type LimitType = "none" | "characters" | "words";

export interface TokenEstimation {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedSeconds: number;
  estimatedCost: number; // in USD
  inputBreakdown: {
    systemPrompt: number;
    sampleContent: number;
    userPrompt: number;
  };
}

/**
 * Counts the number of words in a string
 */
export function countWords(text: string): number {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Counts the number of characters in a string
 */
export function countCharacters(text: string): number {
  if (!text || typeof text !== "string") return 0;
  return text.length;
}

/**
 * Converts characters to approximate token count
 */
export function charsToTokens(chars: number): number {
  return Math.ceil(chars / CHARS_PER_TOKEN);
}

/**
 * Converts words to approximate token count
 */
export function wordsToTokens(words: number): number {
  return Math.ceil(words / WORDS_PER_TOKEN);
}

/**
 * Converts tokens to approximate characters
 */
export function tokensToChars(tokens: number): number {
  return Math.ceil(tokens * CHARS_PER_TOKEN);
}

/**
 * Gets a random number within a range
 */
export function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Estimates the character count of a content record JSON
 */
export function estimateSampleSize(sampleContent: unknown): number {
  if (!sampleContent) return 0;
  try {
    return JSON.stringify(sampleContent).length;
  } catch {
    return 0;
  }
}

/**
 * Estimates tokens for AI generation operation
 */
export function estimateGenerationTokens(params: {
  sampleContent?: unknown;
  userPrompt: string;
  limitType: LimitType;
  limitValue?: number;
}): TokenEstimation {
  const { sampleContent, userPrompt, limitType, limitValue } = params;

  // Input breakdown
  const systemPromptChars = getRandomInRange(
    SYSTEM_PROMPT_OVERHEAD.generation.min,
    SYSTEM_PROMPT_OVERHEAD.generation.max
  );
  const sampleChars = estimateSampleSize(sampleContent);
  const userPromptChars = countCharacters(userPrompt);

  const inputBreakdown = {
    systemPrompt: charsToTokens(systemPromptChars),
    sampleContent: charsToTokens(sampleChars),
    userPrompt: charsToTokens(userPromptChars),
  };

  const inputTokens =
    inputBreakdown.systemPrompt + inputBreakdown.sampleContent + inputBreakdown.userPrompt;

  // Output estimation based on limit type
  let outputChars: number;
  if (limitType === "none" || !limitValue) {
    outputChars = DEFAULT_OUTPUT_CHARS;
  } else if (limitType === "characters") {
    outputChars = limitValue;
  } else {
    // words - convert to characters (average 5 chars per word)
    outputChars = limitValue * 5;
  }

  const outputTokens = charsToTokens(outputChars);
  const totalTokens = inputTokens + outputTokens;

  // Estimated time based on output tokens
  const tokensPerSecond = getRandomInRange(TOKEN_GENERATION_SPEED.min, TOKEN_GENERATION_SPEED.max);
  const estimatedSeconds = Math.ceil(outputTokens / tokensPerSecond);

  // Estimated cost
  const estimatedCost = calculateTokenCost(inputTokens, outputTokens);

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedSeconds,
    estimatedCost,
    inputBreakdown,
  };
}

/**
 * Estimates tokens for AI edit operation
 */
export function estimateEditTokens(params: {
  currentContent: unknown;
  userPrompt: string;
  limitType: LimitType;
  limitValue?: number;
}): TokenEstimation {
  const { currentContent, userPrompt, limitType, limitValue } = params;

  // Input breakdown
  const systemPromptChars = getRandomInRange(
    SYSTEM_PROMPT_OVERHEAD.edit.min,
    SYSTEM_PROMPT_OVERHEAD.edit.max
  );
  const contentChars = estimateSampleSize(currentContent);
  const userPromptChars = countCharacters(userPrompt);

  const inputBreakdown = {
    systemPrompt: charsToTokens(systemPromptChars),
    sampleContent: charsToTokens(contentChars),
    userPrompt: charsToTokens(userPromptChars),
  };

  const inputTokens =
    inputBreakdown.systemPrompt + inputBreakdown.sampleContent + inputBreakdown.userPrompt;

  // Output estimation - for edits, default to similar size as input content
  let outputChars: number;
  if (limitType === "none" || !limitValue) {
    // For edits without limit, estimate output similar to input content size
    outputChars = Math.max(contentChars, DEFAULT_OUTPUT_CHARS / 2);
  } else if (limitType === "characters") {
    outputChars = limitValue;
  } else {
    // words - convert to characters
    outputChars = limitValue * 5;
  }

  const outputTokens = charsToTokens(outputChars);
  const totalTokens = inputTokens + outputTokens;

  // Estimated time based on output tokens
  const tokensPerSecond = getRandomInRange(TOKEN_GENERATION_SPEED.min, TOKEN_GENERATION_SPEED.max);
  const estimatedSeconds = Math.ceil(outputTokens / tokensPerSecond);

  // Estimated cost
  const estimatedCost = calculateTokenCost(inputTokens, outputTokens);

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedSeconds,
    estimatedCost,
    inputBreakdown,
  };
}

/**
 * Calculate the cost of tokens based on GPT-5.2 pricing
 */
export function calculateTokenCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * TOKEN_PRICING.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * TOKEN_PRICING.outputPerMillion;
  return inputCost + outputCost;
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return "<$0.01";
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Format estimated time for display
 */
export function formatEstimatedTime(seconds: number): string {
  if (seconds < 60) {
    return `~${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `~${minutes}m`;
  }
  return `~${minutes}m ${remainingSeconds}s`;
}

/**
 * Centralized AI model configuration.
 * All model references should use these constants instead of hardcoded strings.
 */
export const MODELS = {
    /** Primary model for complex tasks (course outlines, career advice, resume analysis) */
    PRIMARY: "llama-3.3-70b-versatile",
    /** Lighter model for fallback, quizzes, and simple tasks */
    FALLBACK: "llama-3.1-8b-instant",
    /** Model used for quiz generation */
    QUIZ: "llama-3.1-8b-instant",
    /** Model for video ranking (lightweight, no JSON mode) */
    RANKING: "llama-3.1-8b-instant",
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];

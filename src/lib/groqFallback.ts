import Groq from "groq-sdk";

type Role = "system" | "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
};

type GroqCompletionOptions = {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
};

const PRIMARY_MODEL = process.env.MODEL || process.env.PRIMARY_MODEL || "auto";
const FALLBACK_MODEL = process.env.FALLBACK_MODEL || "llama-3.3-70b-versatile";
const SAFE_MODEL = process.env.SAFE_MODEL || "llama-3.1-8b-instant";

const MODEL_CHAIN = Array.from(new Set([PRIMARY_MODEL, FALLBACK_MODEL, SAFE_MODEL]));

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.toLowerCase();
  }
  return String(error).toLowerCase();
}

function shouldRetryWithAnotherModel(error: unknown): boolean {
  const msg = getErrorMessage(error);
  return (
    msg.includes("rate limit") ||
    msg.includes("rate_limit") ||
    msg.includes("rate_limit_exceeded") ||
    msg.includes("tokens per day") ||
    msg.includes("429") ||
    msg.includes("model_decommissioned") ||
    msg.includes("decommissioned") ||
    msg.includes("not supported") ||
    msg.includes("does not exist") ||
    msg.includes("invalid_request_error")
  );
}

function getRetryDelayMs(error: unknown): number | null {
  const msg = getErrorMessage(error);
  const colonMatch = msg.match(/try again in\s+(\d+)m(\d+(?:\.\d+)?)s/);
  if (colonMatch) {
    const minutes = Number(colonMatch[1]);
    const seconds = Number(colonMatch[2]);
    return (minutes * 60 + seconds) * 1000;
  }

  const secondMatch = msg.match(/try again in\s+(\d+(?:\.\d+)?)s/);
  if (secondMatch) {
    return Number(secondMatch[1]) * 1000;
  }

  return null;
}

async function waitBeforeRetry(error: unknown): Promise<void> {
  const delayMs = getRetryDelayMs(error) ?? 60_000;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function hasGroqApiKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export async function createGroqCompletion(options: GroqCompletionOptions): Promise<{ content: string; model: string }> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  let lastError: unknown;

  for (const model of MODEL_CHAIN) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        response_format: options.response_format,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("Groq returned empty content");
      }

      return { content: content.trim(), model };
    } catch (error) {
      lastError = error;
      if (!shouldRetryWithAnotherModel(error)) {
        break;
      }

      await waitBeforeRetry(error);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to generate completion with model fallback");
}

export function getModelChain(): string[] {
  return MODEL_CHAIN;
}

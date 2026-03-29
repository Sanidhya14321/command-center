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

const PRIMARY_MODEL = process.env.PRIMARY_MODEL || "llama3-70b-8192";
const FALLBACK_MODEL = process.env.FALLBACK_MODEL || "mixtral-8x7b-32768";
const SAFE_MODEL = process.env.SAFE_MODEL || "llama-3.3-70b-versatile";

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
    msg.includes("model_decommissioned") ||
    msg.includes("decommissioned") ||
    msg.includes("not supported") ||
    msg.includes("does not exist") ||
    msg.includes("invalid_request_error")
  );
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
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to generate completion with model fallback");
}

export function getModelChain(): string[] {
  return MODEL_CHAIN;
}

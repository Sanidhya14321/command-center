export type PromptPreset = {
  id: string;
  label: string;
  prompt: string;
};

export const promptPresets: PromptPreset[] = [
  {
    id: "system-design",
    label: "System Design",
    prompt:
      "Generate 5 senior AI engineering interview questions focused on system design for LLM applications. Include one architecture tradeoff for each question.",
  },
  {
    id: "rag",
    label: "RAG",
    prompt:
      "Generate 5 deep interview questions about retrieval systems, chunking, embeddings, reranking, and grounding validation.",
  },
  {
    id: "agents",
    label: "Agents",
    prompt:
      "Generate 5 practical agent engineering interview questions that test tool orchestration, memory design, and multi-agent safety.",
  },
  {
    id: "deployment",
    label: "Deployment",
    prompt:
      "Generate 5 deployment and production operations interview questions for AI systems with focus on reliability, SLOs, and rollback strategy.",
  },
  {
    id: "prompt-engineering",
    label: "Prompt Engineering",
    prompt:
      "Generate 5 prompt engineering interview questions that assess structured output design, failure recovery, and prompt testing strategy.",
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    prompt:
      "Generate 5 incident-style AI engineering interview questions where the candidate must debug latency spikes, hallucinations, and tool failures.",
  },
];

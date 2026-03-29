export const masteryTopics = [
  "Prompt engineering",
  "Structured outputs",
  "Function calling and tool use",
  "Agent design patterns",
  "RAG and retrieval systems",
  "Embeddings and vector databases",
  "Model selection and tradeoffs",
  "Evaluation strategies and test sets",
  "Safety, privacy, and guardrails",
  "Latency and cost optimization",
  "Observability and tracing",
  "Fine-tuning basics",
  "Multimodal AI basics",
  "Production deployment patterns",
];

export const decisionGuide = [
  {
    scenario: "Knowledge freshness is critical and domain data changes daily",
    choose: "RAG",
    rationale: "Keep model static, update retrieval index frequently, and ground answers with citations.",
  },
  {
    scenario: "Response format must be deterministic JSON for downstream systems",
    choose: "Structured prompting first, then tools",
    rationale: "Constrain schema in prompts and add tool calls when deterministic actions are required.",
  },
  {
    scenario: "Need external actions like ticketing, DB writes, or API calls",
    choose: "Tools and function calling",
    rationale: "Model plans, tools execute side-effects with auditable logs and access controls.",
  },
  {
    scenario: "Model repeatedly fails a narrow repetitive task despite prompt iterations",
    choose: "Fine-tuning",
    rationale: "When behavior is stable and examples are plentiful, fine-tune for precision and lower token cost.",
  },
];

export const safetyChecklist = [
  "Define disallowed content and refusal policy",
  "Add prompt injection and jailbreak defenses",
  "Mask PII before retrieval and generation",
  "Scope tool permissions to least privilege",
  "Log and review safety incidents",
  "Run adversarial eval sets before release",
];

export const observabilityChecklist = [
  "Trace every request with request-id and user context",
  "Record model, prompt version, and tool path",
  "Track latency by stage: retrieval, generation, tooling",
  "Persist eval outcomes for every deployment",
  "Measure token spend by endpoint and tenant",
  "Monitor hallucination and policy-violation rates",
];

export const productionChecklist = [
  "Set SLOs for latency, reliability, and answer quality",
  "Add retry, timeout, and fallback strategies",
  "Implement canary deploys for model and prompt updates",
  "Use feature flags for risky agent capabilities",
  "Create incident runbooks for degraded model behavior",
  "Validate security posture and secret management",
];

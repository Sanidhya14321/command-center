export type Chapter = {
  id: number;
  slug: string;
  title: string;
  level: "Foundation" | "Core" | "Advanced" | "Production";
  outcome: string;
  coreTopics: string[];
  deliverables: string[];
};

export const chapters: Chapter[] = [
  {
    id: 1,
    slug: "intro-language-models",
    title: "Introduction to Language Models",
    level: "Foundation",
    outcome: "Explain model families, capabilities, and where LLM systems fail in production.",
    coreTopics: [
      "Pretraining vs instruction tuning",
      "Inference lifecycle",
      "Capabilities and limitations",
      "Risk surfaces in real products",
    ],
    deliverables: ["LLM landscape memo", "Capability-risk matrix"],
  },
  {
    id: 2,
    slug: "tokens-and-embeddings",
    title: "Tokens and Embeddings",
    level: "Foundation",
    outcome: "Design token-aware prompts and embedding pipelines for retrieval and semantic systems.",
    coreTopics: ["Tokenization", "Context windows", "Embedding geometry", "Vector similarity"],
    deliverables: ["Embedding benchmark notebook", "Chunking playbook"],
  },
  {
    id: 3,
    slug: "inside-transformers",
    title: "Looking Inside Transformer LLMs",
    level: "Foundation",
    outcome: "Reason about attention, context behavior, and why model outputs can degrade.",
    coreTopics: ["Self-attention", "Positional encoding", "Layers and heads", "Scaling behavior"],
    deliverables: ["Transformer explainer", "Failure mode map"],
  },
  {
    id: 4,
    slug: "text-classification",
    title: "Text Classification",
    level: "Core",
    outcome: "Ship robust classification workflows using prompting, embeddings, and fine-tuned heads.",
    coreTopics: ["Zero-shot classification", "Label design", "Calibration", "Evaluation sets"],
    deliverables: ["Classifier baseline", "Error analysis deck"],
  },
  {
    id: 5,
    slug: "clustering-topic-modeling",
    title: "Text Clustering and Topic Modeling",
    level: "Core",
    outcome: "Build unsupervised understanding layers for large corpora and incident triage.",
    coreTopics: ["Clustering", "Topic extraction", "Semantic groups", "Cluster quality"],
    deliverables: ["Topic explorer", "Cluster drift monitor"],
  },
  {
    id: 6,
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    level: "Core",
    outcome: "Create reusable prompt strategies with structured outputs and test harnesses.",
    coreTopics: ["Instruction design", "Few-shot examples", "Schema constraints", "Prompt evals"],
    deliverables: ["Prompt cookbook", "Prompt regression suite"],
  },
  {
    id: 7,
    slug: "advanced-generation",
    title: "Advanced Text Generation Techniques and Tools",
    level: "Advanced",
    outcome: "Orchestrate generation quality with tool use, planning, and controlled decoding.",
    coreTopics: ["Decoding strategies", "Tool calling", "Self-critique loops", "Guarded generation"],
    deliverables: ["Tool-enabled agent flow", "Generation quality report"],
  },
  {
    id: 8,
    slug: "semantic-search-rag",
    title: "Semantic Search and Retrieval-Augmented Generation",
    level: "Advanced",
    outcome: "Design retrieval architectures for grounded and low-hallucination enterprise assistants.",
    coreTopics: ["Index design", "Reranking", "Grounding", "Citation strategies"],
    deliverables: ["RAG blueprint", "Retrieval eval dashboard"],
  },
  {
    id: 9,
    slug: "multimodal-llms",
    title: "Multimodal Large Language Models",
    level: "Advanced",
    outcome: "Integrate text, image, and document understanding workflows in production pipelines.",
    coreTopics: ["Vision-language models", "Multimodal prompting", "OCR + reasoning", "Use-case design"],
    deliverables: ["Multimodal prototype", "Latency-cost analysis"],
  },
  {
    id: 10,
    slug: "creating-embedding-models",
    title: "Creating Text Embedding Models",
    level: "Advanced",
    outcome: "Evaluate and adapt embedding models for domain retrieval and ranking quality.",
    coreTopics: ["Contrastive learning", "Embedding eval", "Hard negatives", "Domain adaptation"],
    deliverables: ["Embedding model comparison", "Domain adaptation notes"],
  },
  {
    id: 11,
    slug: "finetuning-representation-models",
    title: "Fine-tuning Representation Models for Classification",
    level: "Production",
    outcome: "Plan and execute fine-tuning for classification with observability and rollback paths.",
    coreTopics: ["Dataset curation", "Training loops", "Validation strategy", "Deployment gates"],
    deliverables: ["Fine-tune runbook", "Classifier release checklist"],
  },
  {
    id: 12,
    slug: "finetuning-generation-models",
    title: "Fine-tuning Generation Models",
    level: "Production",
    outcome: "Assess when fine-tuning generation beats prompt/RAG/tool strategies and deploy safely.",
    coreTopics: ["SFT and preference tuning", "Safety tuning", "Regression controls", "Canary rollouts"],
    deliverables: ["Generation tuning brief", "Production launch plan"],
  },
];

export const phaseSummary = [
  {
    title: "Phase 1 - Foundation",
    chapters: "1-3",
    focus: "Model fundamentals, tokens, embeddings, transformer internals",
  },
  {
    title: "Phase 2 - Core Application",
    chapters: "4-6",
    focus: "Classification, clustering, prompt engineering, practical eval workflows",
  },
  {
    title: "Phase 3 - Advanced Systems",
    chapters: "7-10",
    focus: "Tooling, advanced generation, RAG, multimodal, embedding systems",
  },
  {
    title: "Phase 4 - Productionization",
    chapters: "11-12 + deployment",
    focus: "Fine-tuning, safety gates, observability, release engineering and operations",
  },
];

export const deploymentTopics = [
  "Serving architecture, caching, and autoscaling",
  "Latency and cost budgets with token-level telemetry",
  "Model fallback strategy and rollback controls",
  "Evaluation gates and online quality monitoring",
  "Tracing, logging, and prompt versioning",
  "Security, privacy, and policy guardrails",
  "Tool orchestration and least-privilege access",
  "Conversation state and memory lifecycle",
];

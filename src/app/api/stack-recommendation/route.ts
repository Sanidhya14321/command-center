import { createGroqCompletion, hasGroqApiKey } from '@/lib/groqFallback';

interface RecommendationRequest {
  useCase: string;
  scale: string;
  latency: string;
}

interface StackRecommendation {
  name: string;
  components: string[];
  tradeoffs: string;
  cost: string;
  difficulty: string;
}

interface StackResult {
  recommended: StackRecommendation;
  alternatives: StackRecommendation[];
  thinkingProcess: string;
}

const CURATED_RECOMMENDATIONS: Record<string, Record<string, Record<string, StackResult>>> = {
  chatbot: {
    small: {
      realtime: {
        recommended: {
          name: 'Groq + FastAPI + SQLite',
          components: ['Groq LLM', 'FastAPI', 'SQLite', 'Redis Cache'],
          tradeoffs: 'Low cost, single-server deployment. Trade-off: limited concurrency.',
          cost: '$0-50/month',
          difficulty: 'Easy',
        },
        alternatives: [
          {
            name: 'OpenAI API + Vercel',
            components: ['OpenAI GPT-4', 'Vercel', 'Postgres'],
            tradeoffs: 'Higher cost but managed infrastructure. Better for rapid iteration.',
            cost: '$100-500/month',
            difficulty: 'Easy',
          },
          {
            name: 'Claude API + Lambda',
            components: ['Claude', 'AWS Lambda', 'DynamoDB'],
            tradeoffs: 'Serverless with per-invocation pricing. Better for variable load.',
            cost: '$50-200/month',
            difficulty: 'Medium',
          },
        ],
        thinkingProcess: `For a real-time chatbot at startup scale:
      - Real-time means <100ms latency and requires fast inference
      - Small scale (<1K) means cost optimization is key
      - Groq excels at low-latency inference
      - FastAPI gives control without heavy operational overhead
      - SQLite fits <1K users; Redis adds response caching
      - This stack can fit on a single low-cost compute instance`,
      },
    },
  },
};

async function generateRecommendationWithGroq(
  useCase: string,
  scale: string,
  latency: string
): Promise<StackResult> {
  const prompt = `You are a principal AI infrastructure architect.
Your job is to recommend a practical, production-ready stack under explicit constraints.

Rules:
- Prefer concrete technologies over generic terms.
- Mention tradeoffs honestly (latency, reliability, observability, security, team skill).
- Keep cost realistic and concise.
- Do not use markdown.
- Return valid JSON only.
- thinkingProcess must be 4-7 concise steps.

Use Case: ${useCase}
Scale: ${scale}
Latency: ${latency}

Return JSON with this exact schema:
{
  "recommended": {
    "name": "Stack name",
    "components": ["component1", "component2"],
    "tradeoffs": "2-3 sentence tradeoff explanation",
    "cost": "monthly estimate range",
    "difficulty": "Easy" | "Medium" | "Hard"
  },
  "alternatives": [
    {"name": "...", "components": [...], "tradeoffs": "...", "cost": "...", "difficulty": "..."}
  ],
  "thinkingProcess": "Step 1 ...\\nStep 2 ...\\nStep 3 ..."
}`;

  try {
    const completion = await createGroqCompletion({
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });

    const normalized = completion.content.trim().replace(/^```json\s*/i, '').replace(/```$/i, '');
    const parsed = JSON.parse(normalized) as Partial<StackResult>;

    if (!parsed.recommended || !parsed.recommended.name || !Array.isArray(parsed.recommended.components)) {
      throw new Error('Incomplete stack recommendation payload');
    }

    return {
      recommended: {
        name: parsed.recommended.name,
        components: parsed.recommended.components,
        tradeoffs: parsed.recommended.tradeoffs ?? 'Tradeoff details unavailable.',
        cost: parsed.recommended.cost ?? 'Cost not specified',
        difficulty: parsed.recommended.difficulty ?? 'Medium',
      },
      alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
      thinkingProcess: parsed.thinkingProcess ?? 'Reasoning unavailable from model response.',
    };
  } catch {
    throw new Error('Failed to generate recommendation with Groq');
  }
}

export async function POST(request: Request) {
  try {
    const { useCase, scale, latency } = (await request.json()) as RecommendationRequest;

    // Try curated recommendation first
    if (CURATED_RECOMMENDATIONS[useCase]?.[scale]?.[latency]) {
      return Response.json(CURATED_RECOMMENDATIONS[useCase][scale][latency]);
    }

    // Fall back to Groq if available
    if (hasGroqApiKey()) {
      const recommendation = await generateRecommendationWithGroq(useCase, scale, latency);
      return Response.json(recommendation);
    }

    // Generic fallback
    return Response.json({
      recommended: {
        name: 'Recommended Stack',
        components: ['LLM API', 'Backend Framework', 'Database'],
        tradeoffs: 'Contact us for personalized recommendation',
        cost: 'Depends on configuration',
        difficulty: 'Medium',
      },
      alternatives: [],
      thinkingProcess: 'Default recommendation - enable Groq API for personalized suggestions',
    });
  } catch (error) {
    console.error('Stack recommendation error:', error);
    return Response.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}

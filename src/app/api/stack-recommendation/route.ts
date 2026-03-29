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
• Real-time means <100ms latency - requires fast inference
• Small scale (<1K) means cost optimization is key
• Groq excels at latency (< 50ms for inference)
• FastAPI gives you control without operational overhead
• SQLite fits <1K users; Redis adds response caching
• This stack fits on a single t3.micro EC2 instance (~$10/month)`,
      },
    },
  },
};

async function generateRecommendationWithGroq(
  useCase: string,
  scale: string,
  latency: string
): Promise<StackResult> {
  const prompt = `You are an expert AI infrastructure architect. Provide a stack recommendation.

Use Case: ${useCase}
Scale: ${scale}
Latency: ${latency}

Return ONLY valid JSON (no markdown, no extra text) with this structure:
{
  "recommended": {
    "name": "Stack name",
    "components": ["component1", "component2"],
    "tradeoffs": "description",
    "cost": "monthly estimate",
    "difficulty": "Easy/Medium/Hard"
  },
  "alternatives": [
    {"name": "...", "components": [...], "tradeoffs": "...", "cost": "...", "difficulty": "..."}
  ],
  "thinkingProcess": "explain your reasoning..."
}`;

  try {
    const completion = await createGroqCompletion({
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return JSON.parse(completion.content) as StackResult;
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

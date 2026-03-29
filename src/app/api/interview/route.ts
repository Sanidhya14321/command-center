import { createGroqCompletion, hasGroqApiKey } from '@/lib/groqFallback';

interface InterviewRequest {
  topic: string;
  difficulty: string;
  personality?: 'faang' | 'startup' | 'principal';
  action: 'start' | 'answer';
  previousQuestion?: string;
  answer?: string;
  messages?: Array<{ role: string; content: string }>;
}

const INTERVIEW_QUESTIONS: Record<string, Record<string, string[]>> = {
  rag: {
    junior: [
      'What is RAG and how does it differ from traditional ML?',
      'Why would you use a vector database in a RAG system?',
      'How do you choose between semantic and BM25 search?',
    ],
    mid: [
      'Design a RAG system that handles 100M+ documents with sub-100ms latency.',
      'How would you evaluate RAG quality? What metrics matter?',
      'Explain the tradeoffs between retrieval and generation accuracy.',
    ],
    senior: [
      'Build a RAG system that handles domain shifts and out-of-distribution queries.',
      'How do you avoid hallucination while maintaining informativeness?',
      'Design a federated RAG across multiple knowledge bases with different access controls.',
    ],
  },
  agents: {
    junior: [
      'What is an AI agent and what makes it different from a chatbot?',
      'Name three tools an agent might have and when to use them.',
      'How does an agent decide which tool to use?',
    ],
    mid: [
      'Design an agentic system for customer support that handles 1000 concurrent users.',
      'How do you prevent infinite loops and control token usage in agents?',
      'Compare ReAct, Chain-of-Thought, and tree-search approaches.',
    ],
    senior: [
      'Build a multi-agent system where agents collaborate and negotiate.',
      'How do you ensure consistency and reliability in agentic systems at scale?',
      'Design an agent that can learn and improve its strategies from past interactions.',
    ],
  },
};

const TOPIC_GUIDES: Record<string, string> = {
  rag: 'retrieval quality, chunking strategy, grounding, vector index behavior, and online relevance feedback',
  agents: 'tool routing, memory strategy, planning loops, safeguards, observability, and failure recovery',
  prompting: 'instruction design, schema constraints, prompt testing, and guardrail-aware prompting',
  evaluation: 'offline benchmarks, golden sets, online metrics, error taxonomy, and regression gating',
  deployment: 'latency budgets, SLOs, rollout strategy, rollback triggers, and incident handling',
  finetuning: 'dataset curation, eval-driven tuning, drift monitoring, and post-deployment validation',
};

const PERSONALITY_GUIDES: Record<'faang' | 'startup' | 'principal', string> = {
  faang:
    'Ask for clear decomposition, scale assumptions, reliability details, and measurable tradeoffs. Bar is high for structured communication.',
  startup:
    'Prioritize pragmatic choices, lean architecture, build-vs-buy decisions, and fast iteration under resource constraints.',
  principal:
    'Focus on cross-team architecture strategy, long-term maintainability, governance, and executive-level technical decisions.',
};

async function generateInterviewQuestion(
  topic: string,
  difficulty: string,
  personality: 'faang' | 'startup' | 'principal',
  previousMessages: Array<{ role: string; content: string }> = []
): Promise<string> {
  const recentContext = previousMessages
    .slice(-6)
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const prompt = `You are running a live AI engineering interview.
Generate exactly one ${difficulty}-level question about ${topic}.
Topic focus areas: ${TOPIC_GUIDES[topic] ?? 'architecture design, reliability, and evaluation'}.

Rules:
- Scenario-based, concrete, and production-relevant.
- Avoid repeating earlier questions.
- Keep to 1-2 sentences.
Interview style: ${PERSONALITY_GUIDES[personality]}.

Recent interview context:
${recentContext || 'No previous context'}

Return plain text only.`;

  try {
    const completion = await createGroqCompletion({
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    if (completion.content.trim()) {
      return completion.content;
    }
  } catch (error) {
    console.error('Error generating interview question:', error);
  }

  if (INTERVIEW_QUESTIONS[topic]?.[difficulty]) {
    const questions = INTERVIEW_QUESTIONS[topic][difficulty];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  return 'Tell me about your experience with AI systems.';
}

async function evaluateAnswer(
  question: string,
  answer: string,
  difficulty: string,
  topic: string,
  personality: 'faang' | 'startup' | 'principal'
): Promise<{ feedback: string; score: number }> {
  const prompt = `You are an AI engineering interviewer evaluating a candidate's answer.

Question: ${question}
Answer: ${answer}
Difficulty: ${difficulty}
Topic: ${topic}
Personality mode: ${personality}

Return JSON only using this schema:
{
  "score": 0,
  "strengths": ["...", "..."],
  "gaps": ["...", "..."],
  "nextStep": "one concise coaching tip"
}

Scoring rubric:
- Technical correctness and depth: 35
- Production constraints and tradeoffs: 25
- Reliability and observability thinking: 20
- Communication clarity: 20

Interviewer behavior guidance:
${PERSONALITY_GUIDES[personality]}`;

  try {
    const completion = await createGroqCompletion({
      max_tokens: 450,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });

    if (completion.content) {
      const parsed = JSON.parse(completion.content) as {
        score?: number;
        strengths?: string[];
        gaps?: string[];
        nextStep?: string;
      };

      const score = Math.max(0, Math.min(100, parsed.score ?? 75));
      const strengths = (parsed.strengths ?? []).slice(0, 2).join('; ') || 'You explained the core approach clearly.';
      const gaps = (parsed.gaps ?? []).slice(0, 2).join('; ') || 'Include more detail about production constraints.';
      const nextStep = parsed.nextStep || 'Add one metric and one rollback condition to strengthen the answer.';
      const feedback = `Strengths: ${strengths}\nGaps: ${gaps}\nNext step: ${nextStep}`;

      return { feedback, score };
    }
  } catch (error) {
    console.error('Error evaluating answer:', error);
  }

  return {
    feedback: 'Good response - consider the production implications.',
    score: 70,
  };
}

export async function POST(request: Request) {
  try {
    const { topic, difficulty, personality = 'faang', action, previousQuestion, answer, messages } =
      (await request.json()) as InterviewRequest;

    if (!hasGroqApiKey()) {
      const fallbackQuestion = INTERVIEW_QUESTIONS[topic]?.[difficulty]?.[0] || 'Tell me about your experience with AI systems.';
      if (action === 'start') {
        return Response.json({ question: fallbackQuestion });
      }
      if (action === 'answer' && previousQuestion && answer) {
        return Response.json({
          feedback: 'Good response. Add more detail on tradeoffs, latency, and evaluation metrics.',
          score: 70,
          nextQuestion: fallbackQuestion,
        });
      }
    }

    if (action === 'start') {
      const question = await generateInterviewQuestion(topic, difficulty, personality, messages ?? []);
      return Response.json({ question });
    }

    if (action === 'answer' && previousQuestion && answer) {
      const { feedback, score } = await evaluateAnswer(previousQuestion, answer, difficulty, topic, personality);
      const nextQuestion = await generateInterviewQuestion(topic, difficulty, personality, messages ?? []);

      return Response.json({
        feedback,
        score,
        nextQuestion,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Interview error:', error);
    return Response.json(
      { error: 'Failed to process interview request' },
      { status: 500 }
    );
  }
}

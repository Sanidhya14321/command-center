import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface InterviewRequest {
  topic: string;
  difficulty: string;
  action: 'start' | 'answer';
  previousQuestion?: string;
  answer?: string;
  messages?: Array<{ role: string; content: string }>;
}

interface InterviewResponse {
  question?: string;
  nextQuestion?: string;
  feedback?: string;
  score?: number;
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

const CURATED_FEEDBACK: Record<string, Record<string, string>> = {
  'good understanding': 'Excellent point - shows you understand the core concept.',
  'needs depth': 'Valid approach, but consider the tradeoffs at scale.',
  'incomplete': 'Right direction - think about edge cases and failure modes.',
};

async function generateInterviewQuestion(
  topic: string,
  difficulty: string
): Promise<string> {
  if (INTERVIEW_QUESTIONS[topic]?.[difficulty]) {
    const questions = INTERVIEW_QUESTIONS[topic][difficulty];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  const prompt = `Generate a ${difficulty} level interview question about ${topic} for AI engineers. Be specific and technical.`;

  try {
    const message = await groq.messages.create({
      model: 'llama3-70b-8192',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }
  } catch (error) {
    console.error('Error generating interview question:', error);
  }

  return INTERVIEW_QUESTIONS[topic]?.[difficulty]?.[0] || 'Tell me about your experience with AI systems.';
}

async function evaluateAnswer(
  question: string,
  answer: string,
  difficulty: string
): Promise<{ feedback: string; score: number }> {
  const prompt = `You are an AI engineering interviewer evaluating a candidate's answer.

Question: ${question}
Answer: ${answer}
Difficulty: ${difficulty}

Provide:
1. Brief feedback (1-2 sentences)
2. Score (0-100)

Format: FEEDBACK: [feedback] | SCORE: [score]`;

  try {
    const message = await groq.messages.create({
      model: 'llama3-70b-8192',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const text = content.text;
      const feedbackMatch = text.match(/FEEDBACK:\s*(.+?)\s*\|/);
      const scoreMatch = text.match(/SCORE:\s*(\d+)/);

      const feedback = feedbackMatch?.[1] || 'Good answer - think about scalability.';
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

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
    const { topic, difficulty, action, previousQuestion, answer } =
      (await request.json()) as InterviewRequest;

    if (action === 'start') {
      const question = await generateInterviewQuestion(topic, difficulty);
      return Response.json({ question });
    }

    if (action === 'answer' && previousQuestion && answer) {
      const { feedback, score } = await evaluateAnswer(previousQuestion, answer, difficulty);
      const nextQuestion = await generateInterviewQuestion(topic, difficulty);

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

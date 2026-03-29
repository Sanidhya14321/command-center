'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw, Lightbulb } from 'lucide-react';

interface InterviewMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  feedback?: string;
}

interface InterviewSession {
  topic: string;
  difficulty: 'junior' | 'mid' | 'senior';
  score: number;
  messages: InterviewMessage[];
  currentQuestion: string;
  questionCount: number;
}

interface InterviewAnswerResponse {
  feedback: string;
  score: number;
  nextQuestion?: string;
}

const INTERVIEW_TOPICS = [
  { value: 'rag', label: '🔍 RAG Systems', difficulty: ['mid', 'senior'] },
  { value: 'agents', label: '🤖 AI Agents', difficulty: ['mid', 'senior'] },
  { value: 'prompting', label: '💬 Advanced Prompting', difficulty: ['junior', 'mid'] },
  { value: 'evaluation', label: '📊 LLM Evaluation', difficulty: ['mid', 'senior'] },
  { value: 'deployment', label: '🚀 Production Systems', difficulty: ['senior'] },
  { value: 'finetuning', label: '🎯 Fine-tuning', difficulty: ['mid', 'senior'] },
];

export function InterviewModeAgent({ sectionId = 'interview-mode' }: { sectionId?: string }) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [inputAnswer, setInputAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startInterview = async () => {
    if (!selectedTopic) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          action: 'start',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSession({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          score: 0,
          messages: [
            {
              role: 'interviewer',
              content: data.question,
            },
          ],
          currentQuestion: data.question,
          questionCount: 1,
        });
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!inputAnswer.trim() || !session) return;

    setIsLoading(true);
    const newMessages: InterviewMessage[] = [
      ...session.messages,
      { role: 'candidate', content: inputAnswer },
    ];
    setInputAnswer('');

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: session.topic,
          difficulty: session.difficulty,
          action: 'answer',
          previousQuestion: session.currentQuestion,
          answer: inputAnswer,
          messages: session.messages,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as InterviewAnswerResponse;
        const feedbackMessage: InterviewMessage = {
          role: 'interviewer',
          content: data.feedback,
          feedback: data.feedback,
        };

        const newSession: InterviewSession = {
          ...session,
          messages: [...newMessages, feedbackMessage],
          score: data.score,
          currentQuestion: data.nextQuestion || '',
          questionCount: session.questionCount + 1,
        };

        if (data.nextQuestion) {
          newSession.messages.push({
            role: 'interviewer',
            content: data.nextQuestion,
          });
        }

        setSession(newSession);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <section id={sectionId} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-[24px] border border-[var(--m3-outline)]/30 bg-gradient-to-br from-[var(--m3-surface-container-low)] to-[var(--m3-surface-container)] p-6 md:p-8"
        >
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-bold text-[var(--m3-on-surface)]">
              🎤 Interview Mode Agent
            </h2>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">
              Get real-time feedback from an AI interviewer. Practice for technical interviews.
            </p>
          </div>

          <div className="space-y-6">
            {/* Topic Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[var(--m3-on-surface)]">
                📚 Select Interview Topic
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {INTERVIEW_TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => setSelectedTopic(topic.value)}
                    disabled={!topic.difficulty.includes(selectedDifficulty)}
                    className={`rounded-lg px-3 py-3 text-sm font-semibold transition text-left flex items-center gap-2 ${
                      selectedTopic === topic.value
                        ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                        : !topic.difficulty.includes(selectedDifficulty)
                          ? 'opacity-40 cursor-not-allowed bg-[var(--m3-surface-container-high)]'
                          : 'border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container-high)] hover:border-[var(--m3-primary)]/50'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[var(--m3-on-surface)]">
                ⚡ Difficulty Level
              </label>
              <div className="flex gap-2">
                {['junior', 'mid', 'senior'].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedDifficulty(level as 'junior' | 'mid' | 'senior');
                      setSelectedTopic('');
                    }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      selectedDifficulty === level
                        ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                        : 'border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container-high)] hover:border-[var(--m3-primary)]/50'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              disabled={!selectedTopic || isLoading}
              className={`w-full rounded-lg px-4 py-3 font-semibold transition ${
                selectedTopic && !isLoading
                  ? 'bg-[var(--m3-accent)] text-[var(--m3-on-primary)] hover:shadow-lg'
                  : 'bg-[var(--m3-outline-variant)]/30 text-[var(--m3-on-surface-variant)]'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Starting interview...
                </span>
              ) : (
                '🎬 Start Interview'
              )}
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  // Interview Session UI
  return (
    <section id={sectionId} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] border border-[var(--m3-outline)]/30 bg-gradient-to-br from-[var(--m3-surface-container-low)] to-[var(--m3-surface-container)] p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--m3-on-surface)]">
              🎤 Interview Session
            </h2>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">
              Question {session.questionCount} • Score: {session.score}/100
            </p>
          </div>
          <button
            onClick={() => setSession(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--m3-outline)]/40 hover:bg-[var(--m3-surface-container-high)]"
          >
            <RotateCcw className="w-4 h-4" />
            New Interview
          </button>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto bg-[var(--m3-surface-container-lowest)] rounded-lg p-4">
          <AnimatePresence>
            {session.messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === 'candidate'
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                      : 'bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)]'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.feedback && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <p className="text-xs opacity-80">
                        <Lightbulb className="inline w-3 h-3 mr-1" />
                        {msg.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        {session.currentQuestion && session.questionCount < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
              placeholder="Type your answer..."
              className="flex-1 rounded-lg bg-[var(--m3-surface-container-high)] px-4 py-2 text-sm border border-[var(--m3-outline)]/40 focus:outline-none focus:border-[var(--m3-primary)]"
            />
            <button
              onClick={submitAnswer}
              disabled={!inputAnswer.trim() || isLoading}
              className="px-4 py-2 rounded-lg bg-[var(--m3-accent)] text-[var(--m3-on-primary)] hover:shadow-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {session.questionCount >= 5 && (
          <div className="text-center p-4 bg-[var(--m3-surface-container-high)] rounded-lg">
            <p className="font-bold text-[var(--m3-on-surface)]">Interview Complete!</p>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">
              Final Score: {session.score}/100
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}

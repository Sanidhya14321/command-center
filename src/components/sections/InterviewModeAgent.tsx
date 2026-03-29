'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Brain,
  Gauge,
  LoaderCircle,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Target,
} from 'lucide-react';

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
  { value: 'rag', label: 'RAG Systems', difficulty: ['mid', 'senior'], icon: Target },
  { value: 'agents', label: 'AI Agents', difficulty: ['mid', 'senior'], icon: Bot },
  { value: 'prompting', label: 'Advanced Prompting', difficulty: ['junior', 'mid'], icon: MessageSquare },
  { value: 'evaluation', label: 'LLM Evaluation', difficulty: ['mid', 'senior'], icon: Gauge },
  { value: 'deployment', label: 'Production Systems', difficulty: ['senior'], icon: Sparkles },
  { value: 'finetuning', label: 'Fine-tuning', difficulty: ['mid', 'senior'], icon: Brain },
];

const MAX_QUESTIONS = 5;

export function InterviewModeAgent({ sectionId = 'interview-mode' }: { sectionId?: string }) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [inputAnswer, setInputAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [session?.messages.length, isLoading]);

  const progressPercent = useMemo(() => {
    if (!session) return 0;
    return Math.min(100, Math.round((session.questionCount / MAX_QUESTIONS) * 100));
  }, [session]);

  const answerWordCount = useMemo(() => {
    return inputAnswer.trim() ? inputAnswer.trim().split(/\s+/).length : 0;
  }, [inputAnswer]);

  const canSubmitAnswer = answerWordCount >= 12 && !isLoading;

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
            <h2 className="flex items-center gap-2 text-2xl font-bold text-[var(--m3-on-surface)]">
              <Bot className="size-6 text-[var(--m3-primary)]" />
              Interview Mode Agent
            </h2>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">
              Get real-time feedback from an AI interviewer. Practice for technical interviews.
            </p>
          </div>

          <div className="space-y-6">
            {/* Topic Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--m3-on-surface)]">
                <Target className="size-4" />
                Select Interview Topic
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
                    <topic.icon className="size-4" />
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--m3-on-surface)]">
                <Gauge className="size-4" />
                Difficulty Level
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
                  <LoaderCircle className="size-4 animate-spin" />
                  Starting interview...
                </span>
              ) : (
                'Start Interview'
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
            <h2 className="flex items-center gap-2 text-2xl font-bold text-[var(--m3-on-surface)]">
              <Bot className="size-6 text-[var(--m3-primary)]" />
              Interview Session
            </h2>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">
              Question {session.questionCount} of {MAX_QUESTIONS} | Score: {session.score}/100
            </p>
            <div className="mt-2 h-2 w-52 overflow-hidden rounded-full bg-[var(--m3-surface-container-high)]">
              <div
                className="h-full rounded-full bg-[var(--m3-primary)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
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
        <div
          ref={messagesRef}
          className="space-y-4 mb-6 max-h-96 overflow-y-auto bg-[var(--m3-surface-container-lowest)] rounded-lg p-4"
        >
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
                      <p className="text-xs whitespace-pre-line opacity-90">{msg.feedback}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--m3-surface-container-high)] px-3 py-2 text-xs text-[var(--m3-on-surface-variant)]">
                  <LoaderCircle className="size-3 animate-spin" />
                  Interviewer is analyzing your answer...
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        {session.currentQuestion && session.questionCount < MAX_QUESTIONS && (
          <div className="space-y-2">
            <textarea
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && canSubmitAnswer) {
                  event.preventDefault();
                  void submitAnswer();
                }
              }}
              placeholder="Type your answer with architecture choice, tradeoffs, and production validation..."
              rows={4}
              className="w-full rounded-lg bg-[var(--m3-surface-container-high)] px-4 py-3 text-sm border border-[var(--m3-outline)]/40 focus:outline-none focus:border-[var(--m3-primary)]"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[var(--m3-on-surface-variant)]">
                Tip: include one metric and one fallback strategy in each answer. Press Ctrl+Enter to submit.
              </p>
              <button
                onClick={submitAnswer}
                disabled={!canSubmitAnswer}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--m3-accent)] text-[var(--m3-on-primary)] hover:shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Submit Answer
              </button>
            </div>
            <div className="text-xs text-[var(--m3-on-surface-variant)]">
              {answerWordCount < 12
                ? `Write at least ${12 - answerWordCount} more words for a stronger answer.`
                : `${answerWordCount} words`}
            </div>
          </div>
        )}

        {session.questionCount >= MAX_QUESTIONS && (
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

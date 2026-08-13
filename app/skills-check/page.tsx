'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  AlertCircle,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Keyboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
  Users2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { testService } from '@/services/testService';
import { ITestQuestion, TestType } from '@/types/test';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const testTypes: TestType[] = ['DISC', 'PAEI'];

const TEST_TYPE_INFO: Record<TestType, { description: string; icon: typeof Users2 }> = {
  DISC: { description: "Muloqot va xulq-atvor uslubingizni aniqlaydi", icon: Users2 },
  PAEI: { description: "Boshqaruv va yetakchilik uslubingizni aniqlaydi", icon: Compass },
};

const EASE = [0.22, 1, 0.36, 1] as const;

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Ma'lumot", 'Test', 'Tayyor'];
  return (
    <div className="flex items-center gap-2" aria-label="Jarayon bosqichlari">
      {items.map((label, idx) => {
        const num = idx + 1;
        const active = step === num;
        const done = step > num;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                done && 'bg-primary text-white',
                active && !done && 'bg-primary/10 text-primary ring-2 ring-primary',
                !active && !done && 'bg-gray-100 text-gray-400'
              )}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : num}
            </span>
            <span className={cn('text-xs font-semibold', active ? 'text-dark' : 'text-gray-400')}>{label}</span>
            {num < items.length && <span className="mx-1 h-px w-5 bg-gray-200" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}

export default function SkillsCheck() {
  const reduceMotion = useReducedMotion();
  const t = (duration: number) => ({ duration: reduceMotion ? 0.01 : duration, ease: EASE });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    testType: 'DISC' as TestType,
  });

  const [questions, setQuestions] = useState<ITestQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (!isTestRunning) return;
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isTestRunning]);

  useEffect(() => {
    if (!isTestRunning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isTestRunning]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMsg("Iltimos, ism va familiyangizni to'liq kiriting.");
      return;
    }

    setLoading(true);
    try {
      const data = await testService.getQuestions(formData.testType);
      if (data.length === 0) {
        setErrorMsg("Ushbu test turi uchun hozircha savollar mavjud emas. Boshqa turini tanlab ko'ring.");
        return;
      }
      setQuestions(data);
      setCurrentQuestion(0);
      setAnswers([]);
      setSelectedIndex(null);
      setTimer(0);
      setStep(2);
      setIsTestRunning(true);
    } catch {
      setErrorMsg("Savollarni yuklab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const commitAnswer = (index: number, prevAnswers: number[]) => {
    const newAnswers = [...prevAnswers, index];
    setAnswers(newAnswers);
    setSelectedIndex(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      finishTest(newAnswers);
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    window.setTimeout(() => commitAnswer(index, answers), reduceMotion ? 90 : 280);
  };

  useEffect(() => {
    if (step !== 2 || selectedIndex !== null || questions.length === 0) return;
    const optionCount = questions[currentQuestion]?.options.length ?? 0;
    const handler = (e: KeyboardEvent) => {
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= optionCount) {
        handleAnswer(num - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedIndex, questions, currentQuestion]);

  const finishTest = async (finalAnswers: number[]) => {
    setIsTestRunning(false);
    setStep(3);

    const timeSpent = Math.floor(timer / 60);

    const detailedResponses = questions.map((q, idx) => ({
      question: q.question,
      answer: q.options[finalAnswers[idx]],
    }));

    const resultData = {
      ...formData,
      timeSpent: timeSpent > 0 ? timeSpent : 1,
      totalQuestions: questions.length,
      detailedResponses,
    };

    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
      });
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const handleExitTest = () => {
    setIsTestRunning(false);
    setStep(1);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedIndex(null);
    setTimer(0);
    setShowExitConfirm(false);
  };

  const formattedTime = `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`;
  const currentQ = questions[currentQuestion];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--paper)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_12%_-10%,rgba(13,177,128,0.12),transparent_45%),radial-gradient(circle_at_88%_115%,rgba(188,142,91,0.12),transparent_42%)]"
      />
      <Header />

      <main className="relative flex flex-col items-center justify-center px-4 pb-16 pt-[130px] sm:pt-[150px]">
        <div className="mb-6">
          <StepIndicator step={step} />
        </div>

        <div
          className={cn(
            'w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-primary/5',
            step === 1 ? 'max-w-4xl' : 'max-w-2xl'
          )}
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -14 }}
                transition={t(0.32)}
                className="grid lg:grid-cols-[1fr_1.25fr]"
              >
                <div className="relative hidden flex-col justify-between gap-10 overflow-hidden p-10 text-white lg:flex bg-[linear-gradient(150deg,var(--ink)_0%,#0f2a22_55%,var(--primary-dark)_150%)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
                  />
                  <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/80">
                      <Sparkles className="h-3.5 w-3.5" /> Skills Check
                    </span>
                    <h1 className="mt-6 text-3xl font-bold leading-tight">
                      O‘zingizni bir necha daqiqada tanishtiring.
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      Qisqa test orqali kuchli tomonlaringizni aniqlang — natija to‘g‘ridan-to‘g‘ri Najot Ta’lim HR jamoasiga yetadi.
                    </p>
                  </div>
                  <ul className="relative space-y-4 text-sm text-white/85">
                    <li className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Atigi 5–10 daqiqa vaqt oladi
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Javoblaringiz faqat HR jamoasi bilan ulashiladi
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      To‘g‘ri yoki noto‘g‘ri javob yo‘q — o‘zingizga sodiq bo‘ling
                    </li>
                  </ul>
                </div>

                <div className="p-8 md:p-12">
                  <div className="mb-8 flex items-center gap-3 lg:hidden">
                    <div className="rounded-2xl bg-primary/10 p-3">
                      <Brain className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-dark">Skills Check</h1>
                      <p className="text-sm text-gray-500">Bir necha daqiqada o‘zingizni tanishtiring</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={t(0.2)}
                        className="flex items-start gap-2.5 overflow-hidden rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleStart} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <User className="h-4 w-4" /> Ism
                        </label>
                        <input
                          id="firstName"
                          required
                          type="text"
                          disabled={loading}
                          className="h-14 w-full rounded-xl border border-gray-200 px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50"
                          placeholder="Masalan: Eshmat"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <User className="h-4 w-4" /> Familiya
                        </label>
                        <input
                          id="lastName"
                          required
                          type="text"
                          disabled={loading}
                          className="h-14 w-full rounded-xl border border-gray-200 px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50"
                          placeholder="Masalan: Toshmatov"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="mb-3 block text-sm font-semibold text-gray-700">Test turini tanlang</span>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {testTypes.map((type) => {
                          const info = TEST_TYPE_INFO[type];
                          const Icon = info.icon;
                          const active = formData.testType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              disabled={loading}
                              aria-pressed={active}
                              onClick={() => setFormData({ ...formData, testType: type })}
                              className={cn(
                                'group relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all',
                                active ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                                  active ? 'bg-primary text-white' : 'bg-white text-gray-400 group-hover:text-gray-600'
                                )}
                              >
                                <Icon className="h-4.5 w-4.5" />
                              </span>
                              <span className={cn('font-bold', active ? 'text-primary' : 'text-dark')}>{type} testi</span>
                              <span className="text-xs leading-relaxed text-gray-500">{info.description}</span>
                              {active && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button type="submit" isLoading={loading} className="mt-4 h-14 w-full">
                      {!loading && 'Testni boshlash'}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === 2 && currentQ && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -14 }}
                transition={t(0.32)}
                className="p-8 md:p-12"
              >
                <div className="mb-8 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
                    {formData.testType} Testi
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 font-mono font-bold text-gray-500">
                      <Clock className="h-4.5 w-4.5 text-primary" />
                      {formattedTime}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(true)}
                      aria-label="Testni tark etish"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span aria-live="polite">
                    Savol {currentQuestion + 1} / {questions.length}
                  </span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    transition={t(0.35)}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
                    transition={t(0.22)}
                  >
                    <h2 className="mb-8 text-xl font-bold text-dark md:text-2xl text-balance">{currentQ.question}</h2>
                    <div role="radiogroup" aria-label="Javob variantlari" className="space-y-3">
                      {currentQ.options.map((option, idx) => {
                        const selected = selectedIndex === idx;
                        const dimmed = selectedIndex !== null && !selected;
                        return (
                          <motion.button
                            key={idx}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={selectedIndex !== null}
                            onClick={() => handleAnswer(idx)}
                            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                            animate={{ opacity: dimmed ? 0.45 : 1 }}
                            transition={t(0.18)}
                            className={cn(
                              'group flex w-full items-center rounded-2xl border-2 p-4 text-left transition-colors sm:p-5',
                              selected ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary hover:bg-primary/5'
                            )}
                          >
                            <span
                              className={cn(
                                'mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold transition-colors',
                                selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary group-hover:text-white'
                              )}
                            >
                              {selected ? <CheckCircle2 className="h-4.5 w-4.5" /> : idx + 1}
                            </span>
                            <span className="font-medium text-gray-700 group-hover:text-dark">{option}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <p className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                  <Keyboard className="h-3.5 w-3.5" /> 1–{currentQ.options.length} raqam tugmalari orqali ham javob berishingiz mumkin
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -14 }}
                transition={t(0.32)}
                className="p-8 text-center md:p-12"
              >
                <motion.div
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...t(0.4), delay: reduceMotion ? 0 : 0.05 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
                >
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="mb-3 text-3xl font-bold text-dark">Rahmat, {formData.firstName}!</h2>
                <p className="mx-auto mb-8 max-w-sm text-gray-500">
                  Javoblaringiz qabul qilindi va HR jamoamizga yuborildi. Tez orada siz bilan bog‘lanamiz.
                </p>

                <div className="mx-auto mb-10 flex max-w-sm items-center justify-center gap-3">
                  <div className="flex-1 rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="text-lg font-bold text-dark">{formattedTime}</div>
                    <div className="text-xs text-gray-400">Sarflangan vaqt</div>
                  </div>
                  <div className="flex-1 rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="text-lg font-bold text-dark">{questions.length}</div>
                    <div className="text-xs text-gray-400">Savollar soni</div>
                  </div>
                  <div className="flex-1 rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="text-lg font-bold text-dark">{formData.testType}</div>
                    <div className="text-xs text-gray-400">Test turi</div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/vacancies"
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-opacity-90 active:scale-95 sm:w-auto"
                  >
                    Ochiq vakansiyalarni ko‘rish <ArrowUpRight className="h-4.5 w-4.5" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-gray-100 px-8 font-bold text-gray-700 transition-all hover:bg-gray-200 active:scale-95 sm:w-auto"
                  >
                    Bosh sahifaga qaytish
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleExitTest}
        title="Testni tark etasizmi?"
        description="Hozirgi javoblaringiz saqlanmaydi va testni boshidan boshlashingizga to‘g‘ri keladi."
      />
    </div>
  );
}

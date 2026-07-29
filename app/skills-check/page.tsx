'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { CheckCircle2, Clock, Brain, User, Loader2 } from 'lucide-react';
import { testService } from '@/services/testService';
import { ITestQuestion, TestType } from '@/types/test';

const testTypes: TestType[] = ['DISC', 'PAEI'];

export default function SkillsCheck() {
  const [step, setStep] = useState(1); // 1: Info, 2: Testing, 3: Finished
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    testType: 'DISC' as TestType
  });

  const [questions, setQuestions] = useState<ITestQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTestRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestRunning]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName) {
      setLoading(true);
      try {
        const data = await testService.getQuestions(formData.testType);
        if (data.length === 0) {
          alert("Ushbu turdagi test uchun savollar hali qo'shilmagan.");
          return;
        }
        setQuestions(data);
        setStep(2);
        setIsTestRunning(true);
      } catch {
        alert("Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishTest(newAnswers);
    }
  };

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

    // Send to Telegram API
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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {step === 1 && (
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-dark">Skills Check</h1>
                  <p className="text-gray-500 text-sm">Candidat malakasini aniqlash testi</p>
                </div>
              </div>

              <form onSubmit={handleStart} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" /> Ism
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full h-14 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Masalan: Eshmat"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" /> Familiya
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full h-14 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Masalan: Toshmatov"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Test turini tanlang</label>
                  <div className="grid grid-cols-2 gap-4">
                    {testTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, testType: type})}
                        className={`h-16 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                          formData.testType === type 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {type} Testi
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-opacity-95 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Testni boshlash'}
                </button>
              </form>
            </div>
          )}

          {step === 2 && questions.length > 0 && (
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <span className="px-4 py-1.5 bg-accent/10 text-accent text-sm font-bold rounded-full">
                  {formData.testType} Testi
                </span>
                <div className="flex items-center gap-2 text-gray-500 font-mono font-bold">
                  <Clock className="h-5 w-5 text-primary" />
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="mb-8">
                <div className="w-full bg-gray-100 h-2 rounded-full mb-6">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-dark mb-8">
                  {questions[currentQuestion].question}
                </h2>
                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="w-full p-5 text-left rounded-2xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary group-hover:text-white transition-colors mr-4 font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-medium text-gray-700 group-hover:text-dark">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-dark mb-4">Rahmat!</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Sizning javoblaringiz qabul qilindi. Natijalar HR menejerlarimizga yuborildi. Tez orada siz bilan bog‘lanamiz.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="h-14 px-10 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 transition-all"
              >
                Bosh sahifaga qaytish
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

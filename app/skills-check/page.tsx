'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { CheckCircle2, Clock, Brain, User } from 'lucide-react';

export default function SkillsCheck() {
  const [step, setStep] = useState(1); // 1: Info, 2: Testing, 3: Finished
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    testType: 'DISC'
  });
  
  const [timer, setTimer] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Mock questions for the test
  const questions = [
    { q: "Siz qiyin vaziyatlarda qanday qaror qabul qilasiz?", options: ["Tez va qat'iy", "Boshqalar bilan maslahatlashib", "Uzoq o'ylab", "Ehtiyotkorlik bilan"] },
    { q: "Jamoada sizning rolingiz qanday?", options: ["Lider", "Ijrochi", "G'oya muallifi", "Tanqidchi"] },
    { q: "Ish jarayonida siz uchun nima muhimroq?", options: ["Natija", "Muhit", "Tartib", "Innovatsiya"] },
    { q: "Stress holatida o'zingizni qanday tutasiz?", options: ["Faollashaman", "Vahimaga tushaman", "Sokinlashaman", "Yolg'iz qolishni xohlayman"] },
    { q: "Yangi loyihani boshlashda birinchi navbatda nima qilasiz?", options: ["Reja tuzaman", "Darrov ishga kirishaman", "Jamoani yig'aman", "Xavflarni o'rganaman"] },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  
  useEffect(() => {
    let interval: any;
    if (isTestRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestRunning]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName) {
      setStep(2);
      setIsTestRunning(true);
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
    // Mock calculation for "correct" answers
    const correctAnswers = finalAnswers.filter(a => a === 0 || a === 2).length; 

    const detailedResults = questions.map((q, idx) => ({
      question: q.q,
      answer: q.options[finalAnswers[idx]]
    }));

    const resultData = {
      ...formData,
      timeSpent: timeSpent > 0 ? timeSpent : 1,
      correctAnswers: correctAnswers,
      totalQuestions: questions.length,
      detailedResults: detailedResults
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
                    {['DISC', 'PAEI'].map((type) => (
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
                  type="submit" 
                  className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-opacity-95 active:scale-[0.98] transition-all mt-4"
                >
                  Testni boshlash
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
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
                  {questions[currentQuestion].q}
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
                Sizning javoblaringiz qabul qilindi. Natijalar HR menejerlarimizga yuborildi. Tez orada siz bilan bog'lanamiz.
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

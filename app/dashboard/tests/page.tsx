'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  X,
  Circle
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { testService } from '@/services/testService';
import { ITestQuestion, TestFormData, TestType } from '@/types/test';

export default function TestsAdminPage() {
  const [questions, setQuestions] = useState<ITestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TestType>('DISC');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<ITestQuestion | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<TestFormData>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    type: 'DISC'
  });

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await testService.getQuestions(activeTab);
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [activeTab]);

  const handleOpenForm = (q?: ITestQuestion) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        type: q.type
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        type: activeTab
      });
    }
    setIsFormModalOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingQuestion) {
        await testService.updateQuestion(editingQuestion._id, formData);
      } else {
        await testService.createQuestion(formData);
      }
      setIsFormModalOpen(false);
      loadQuestions();
    } catch (error) {
      alert("Xatolik yuz berdi");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    setActionLoading(true);
    try {
      await testService.deleteQuestion(questionToDelete);
      setIsDeleteModalOpen(false);
      loadQuestions();
    } catch (error) {
      alert("O'chirishda xatolik");
    } finally {
      setActionLoading(false);
      setQuestionToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Testlar boshqaruvi</h1>
          <p className="text-gray-500 text-sm">Candidatlar uchun DISC va PAEI testlarini sozlash</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => handleOpenForm()}>
          Yangi savol
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-full md:w-fit">
        {(['DISC', 'PAEI'] as TestType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-grow md:flex-none px-8 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-500 hover:text-dark'
            }`}
          >
            {tab} Testi
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          </div>
        ) : questions.length > 0 ? (
          questions.map((q, idx) => (
            <div key={q._id} className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                      #{questions.length - idx}
                    </span>
                    <h3 className="font-bold text-dark text-base md:text-lg leading-tight pt-1">{q.question}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl shrink-0">
                    <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-white" onClick={() => handleOpenForm(q)}>
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-white" onClick={() => { setQuestionToDelete(q._id); setIsDeleteModalOpen(true); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 md:pl-11">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl border text-sm font-bold ${
                      i === q.correctAnswer 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' 
                        : 'bg-gray-50/50 border-gray-100 text-gray-500'
                    }`}>
                      {i === q.correctAnswer ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Circle className="h-4 w-4 shrink-0 opacity-20" />}
                      <span className="leading-tight">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white py-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
            <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Hozircha savollar mavjud emas</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={editingQuestion ? 'Savolni tahrirlash' : 'Yangi savol qo\'shish'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Savol matni</label>
            <textarea 
              required
              rows={3}
              className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-dark resize-none"
              placeholder="Savolni kiriting..."
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Variantlar (To'g'ri javobni tanlang)</label>
            <div className="grid grid-cols-1 gap-3">
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex gap-3 items-center group">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, correctAnswer: idx})}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      formData.correctAnswer === idx 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {formData.correctAnswer === idx ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </button>
                  <input 
                    required
                    className={`flex-grow h-12 px-4 rounded-xl border outline-none transition-all font-medium ${
                      formData.correctAnswer === idx 
                        ? 'border-emerald-200 bg-emerald-50/30 focus:border-emerald-500' 
                        : 'border-gray-100 bg-gray-50 focus:border-primary focus:bg-white'
                    }`}
                    placeholder={`Variant ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-14" isLoading={actionLoading}>
            {editingQuestion ? 'Saqlash' : 'Savolni qo\'shish'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Savolni o'chirib tashlaysizmi?"
        description="Ushbu savol testdan butunlay o'chiriladi."
        isLoading={actionLoading}
      />
    </div>
  );
}

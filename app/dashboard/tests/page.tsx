'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
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
        type: q.type
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: '',
        options: ['', '', '', ''],
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
      alert(error instanceof Error ? error.message : 'Savolni saqlashda xatolik yuz berdi');
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
      alert(error instanceof Error ? error.message : 'Savolni o‘chirishda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
      setQuestionToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark font-sans tracking-tight">Testlar boshqaruvi</h1>
          <p className="text-gray-500 text-xs md:text-sm">Candidatlar uchun DISC va PAEI testlarini sozlash</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => handleOpenForm()}>
          Yangi savol
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-lg w-full md:w-fit overflow-x-auto no-scrollbar border border-gray-200 shadow-sm">
        {(['DISC', 'PAEI'] as TestType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-md font-bold text-xs md:text-sm whitespace-nowrap outline-none transition-colors ${
              activeTab === tab 
                ? 'bg-white text-primary shadow-sm border border-gray-100' 
                : 'text-gray-500 hover:text-dark border border-transparent'
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
            <div key={q._id} className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                      {questions.length - idx}
                    </span>
                    <h3 className="font-bold text-dark text-base md:text-lg leading-snug pt-0.5 break-words">{q.question}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg shrink-0 border border-gray-100">
                    <button onClick={() => handleOpenForm(q)} className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-md transition-all" title="Tahrirlash">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setQuestionToDelete(q._id); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-md transition-all" title="O'chirish">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:pl-11">
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-semibold text-gray-600">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-gray-400 ring-1 ring-gray-100">{String.fromCharCode(65 + i)}</div>
                      <span className="leading-tight">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white py-16 md:py-24 rounded-xl border border-dashed border-gray-200 text-center px-6 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <FileText className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">Savollar topilmadi</p>
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
        <form onSubmit={handleFormSubmit} className="space-y-6 overflow-y-auto max-h-[70vh] px-1 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Savol matni</label>
            <textarea 
              required
              rows={3}
              className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark resize-none text-sm md:text-base leading-relaxed"
              placeholder="Savolni kiriting..."
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3 text-sm leading-relaxed text-gray-600">Bu profil testi: variantlar orasida to‘g‘ri yoki noto‘g‘ri javob belgilanmaydi. Nomzod tanlagan javob botga faqat profil tahlili uchun yuboriladi.</div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Javob variantlari</label>
            <div className="grid grid-cols-1 gap-3">
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex gap-3 items-center group">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-400">{String.fromCharCode(65 + idx)}</span>
                  <input 
                    required
                    className="h-11 flex-grow rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white"
                    placeholder={`Variant ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-14 text-base rounded-xl font-bold" isLoading={actionLoading}>
              {editingQuestion ? 'O\'zgarishlarni saqlash' : 'Savolni qo\'shish'}
            </Button>
          </div>
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

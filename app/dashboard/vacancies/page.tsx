'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  DollarSign, 
  Clock, 
  X,
  PlusCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { vacancyService } from '@/services/vacancyService';
import { IVacancy, VacancyFormData, VacancyCategory, VacancyType } from '@/types/vacancy';

const categories: VacancyCategory[] = ['IT', 'HR', "O'quv bo'limi", 'SMM', 'Marketing', 'Sales', 'Other'];
const types: VacancyType[] = ['Full-time', 'Part-time', 'Remote', 'Internship'];

export default function VacanciesAdminPage() {
  const [vacancies, setVacancies] = useState<IVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<string | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<IVacancy | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<VacancyFormData>({
    title: '',
    category: 'IT',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: [''],
    benefits: ['']
  });

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const data = await vacancyService.getVacancies(true);
      setVacancies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacancies();
  }, []);

  const handleOpenForm = (vacancy?: IVacancy) => {
    if (vacancy) {
      setEditingVacancy(vacancy);
      setFormData({
        title: vacancy.title,
        category: vacancy.category,
        location: vacancy.location,
        type: vacancy.type,
        salary: vacancy.salary,
        description: vacancy.description,
        requirements: vacancy.requirements.length > 0 ? vacancy.requirements : [''],
        benefits: vacancy.benefits.length > 0 ? vacancy.benefits : ['']
      });
    } else {
      setEditingVacancy(null);
      setFormData({
        title: '',
        category: 'IT',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        requirements: [''],
        benefits: ['']
      });
    }
    setIsFormModalOpen(true);
  };

  const handleAddField = (field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveField = (field: 'requirements' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (field: 'requirements' | 'benefits', index: number, value: string) => {
    const newFields = [...formData[field]];
    newFields[index] = value;
    setFormData(prev => ({ ...prev, [field]: newFields }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      // Bo'sh fieldlarni tozalash
      const cleanData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        benefits: formData.benefits.filter(b => b.trim() !== '')
      };

      if (editingVacancy) {
        await vacancyService.updateVacancy(editingVacancy._id, cleanData);
      } else {
        await vacancyService.createVacancy(cleanData);
      }
      setIsFormModalOpen(false);
      loadVacancies();
    } catch (error) {
      alert("Xatolik yuz berdi");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleVisibility = async (vacancy: IVacancy) => {
    try {
      await vacancyService.updateVacancy(vacancy._id, { isVisible: !vacancy.isVisible });
      loadVacancies();
    } catch (error) {
      alert("Xatolik yuz berdi");
    }
  };

  const handleDeleteClick = (id: string) => {
    setVacancyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!vacancyToDelete) return;
    setActionLoading(true);
    try {
      await vacancyService.deleteVacancy(vacancyToDelete);
      setIsDeleteModalOpen(false);
      loadVacancies();
    } catch (error) {
      alert("O'chirishda xatolik");
    } finally {
      setActionLoading(false);
      setVacancyToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-sans tracking-tight">Vakansiyalar boshqaruvi</h1>
          <p className="text-gray-500 text-sm">Landing pagedagi vakansiyalarni tahrirlash va yangilarini qo'shish</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => handleOpenForm()}>
          Yangi vakansiya
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-gray-400 mt-4 font-medium">Vakansiyalar yuklanmoqda...</p>
          </div>
        ) : vacancies.length > 0 ? (
          vacancies.map((vacancy) => (
            <div key={vacancy._id} className={`bg-white p-6 rounded-3xl border transition-all ${vacancy.isVisible ? 'border-gray-100 shadow-sm' : 'border-gray-200 bg-gray-50/50 opacity-75 grayscale'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-grow space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {vacancy.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {vacancy.type}
                    </span>
                    {!vacancy.isVisible && (
                      <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                        <EyeOff className="h-3 w-3" /> Yopilgan
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-dark">{vacancy.title}</h3>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> {vacancy.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" /> {vacancy.salary}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4" /> {new Date(vacancy.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl shrink-0">
                  <Button variant="ghost" className="h-11 w-11 p-0 hover:bg-white" onClick={() => toggleVisibility(vacancy)}>
                    {vacancy.isVisible ? <Eye className="h-5 w-5 text-emerald-500" /> : <EyeOff className="h-5 w-5 text-red-500" />}
                  </Button>
                  <Button variant="ghost" className="h-11 w-11 p-0 hover:bg-white" onClick={() => handleOpenForm(vacancy)}>
                    <Edit2 className="h-5 w-5 text-primary" />
                  </Button>
                  <Button variant="ghost" className="h-11 w-11 p-0 hover:bg-white" onClick={() => handleDeleteClick(vacancy._id)}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white py-20 rounded-[2rem] border border-dashed border-gray-200 text-center">
            <Briefcase className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Hozircha vakansiyalar mavjud emas</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={editingVacancy ? 'Vakansiyani tahrirlash' : 'Yangi vakansiya qo\'shish'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-8 overflow-y-auto max-h-[70vh] px-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Sarlavha</label>
              <input 
                required
                className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-dark"
                placeholder="Masalan: Senior Backend Developer"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Manzil</label>
              <input 
                required
                className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-dark"
                placeholder="Masalan: Toshkent (Hadra)"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bo'lim</label>
              <select 
                className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-dark appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as VacancyCategory})}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ish turi</label>
              <select 
                className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-dark appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as VacancyType})}
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Maosh</label>
              <input 
                required
                className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-dark"
                placeholder="Masalan: 1000$ - 1500$"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Batafsil tavsif (Description)</label>
            <textarea 
              required
              rows={4}
              className="w-full p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-dark resize-none"
              placeholder="Ish haqida qisqacha ma'lumot..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Dynamic Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nomzodga talablar</label>
              <button type="button" onClick={() => handleAddField('requirements')} className="text-primary hover:text-emerald-700 font-bold text-xs flex items-center gap-1">
                <PlusCircle className="h-4 w-4" /> Qo'shish
              </button>
            </div>
            <div className="space-y-3">
              {formData.requirements.map((req, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    className="flex-grow h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-dark"
                    placeholder={`Talab #${idx + 1}`}
                    value={req}
                    onChange={(e) => handleFieldChange('requirements', idx, e.target.value)}
                  />
                  {formData.requirements.length > 1 && (
                    <button type="button" onClick={() => handleRemoveField('requirements', idx)} className="h-12 w-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Benefits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Biz nima taklif qilamiz?</label>
              <button type="button" onClick={() => handleAddField('benefits')} className="text-accent hover:text-amber-700 font-bold text-xs flex items-center gap-1">
                <PlusCircle className="h-4 w-4" /> Qo'shish
              </button>
            </div>
            <div className="space-y-3">
              {formData.benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    className="flex-grow h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-dark"
                    placeholder={`Imtiyoz #${idx + 1}`}
                    value={benefit}
                    onChange={(e) => handleFieldChange('benefits', idx, e.target.value)}
                  />
                  {formData.benefits.length > 1 && (
                    <button type="button" onClick={() => handleRemoveField('benefits', idx)} className="h-12 w-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-16 text-lg" isLoading={actionLoading}>
            {editingVacancy ? 'Vakansiyani saqlash' : 'Vakansiyani e\'lon qilish'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Vakansiyani o'chirib tashlaysizmi?"
        description="Bu vakansiya tizimdan butunlay o'chib ketadi. Buning o'rniga uni 'yopib qo'yishingiz' (Eye icon) ham mumkin."
        isLoading={actionLoading}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}

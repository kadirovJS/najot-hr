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
import { IVacancy, VacancyFormData, VacancyCategory, VacancyType, VACANCY_CATEGORIES } from '@/types/vacancy';

const categories = VACANCY_CATEGORIES;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">Vakansiyalar boshqaruvi</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Landing pagedagi vakansiyalarni tahrirlash va yangilarini qo'shish</p>
        </div>
        <Button className="w-full md:w-auto h-11 px-8 rounded-lg text-sm" icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenForm()}>
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
            <div key={vacancy._id} className={`bg-white p-5 md:p-6 rounded-xl border transition-all ${vacancy.isVisible ? 'border-gray-200 shadow-sm' : 'border-gray-300 bg-gray-50/50 opacity-75 grayscale'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-grow space-y-4 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded border border-primary/10">
                      {vacancy.category}
                    </span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200">
                      {vacancy.type}
                    </span>
                    {!vacancy.isVisible && (
                      <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded border border-red-100 flex items-center gap-1.5">
                        <EyeOff className="h-3 w-3" /> Yopilgan
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-dark truncate leading-snug">{vacancy.title}</h3>
                  
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs md:text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" /> <span className="truncate">{vacancy.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400 shrink-0" /> {vacancy.salary}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4 shrink-0" /> {new Date(vacancy.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-lg shrink-0 w-fit border border-gray-100">
                  <button onClick={() => toggleVisibility(vacancy)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-gray-100" title={vacancy.isVisible ? 'Yopish' : 'Ochish'}>
                    {vacancy.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <button onClick={() => handleOpenForm(vacancy)} className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-gray-100" title="Tahrirlash">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteClick(vacancy._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-gray-100" title="O'chirish">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white py-16 md:py-24 rounded-xl border border-dashed border-gray-200 text-center px-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Briefcase className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Hozircha vakansiyalar mavjud emas</p>
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
        <form onSubmit={handleFormSubmit} className="space-y-6 md:space-y-8 overflow-y-auto max-h-[75vh] px-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sarlavha</label>
              <input 
                required
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark text-sm"
                placeholder="Senior Backend Developer"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Manzil</label>
              <input 
                required
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark text-sm"
                placeholder="Toshkent (Hadra)"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bo'lim</label>
              <div className="relative">
                <select 
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark appearance-none text-sm cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as VacancyCategory})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <PlusCircle className="h-4 w-4 rotate-45" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Ish turi</label>
              <div className="relative">
                <select 
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark appearance-none text-sm cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as VacancyType})}
                >
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <PlusCircle className="h-4 w-4 rotate-45" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Maosh</label>
              <input 
                required
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark text-sm"
                placeholder="1000$ - 1500$"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Batafsil tavsif (Description)</label>
            <textarea 
              required
              rows={4}
              className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-medium text-dark resize-none text-sm leading-relaxed"
              placeholder="Ish haqida qisqacha ma'lumot..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Dynamic Requirements */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nomzodga talablar</label>
              <button type="button" onClick={() => handleAddField('requirements')} className="text-primary hover:text-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1.5 transition-all">
                <PlusCircle className="h-3.5 w-3.5" /> Talab qo'shish
              </button>
            </div>
            <div className="space-y-3">
              {formData.requirements.map((req, idx) => (
                <div key={idx} className="flex gap-3">
                  <input 
                    className="flex-grow h-10 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-medium text-dark text-sm"
                    placeholder={`Talab #${idx + 1}`}
                    value={req}
                    onChange={(e) => handleFieldChange('requirements', idx, e.target.value)}
                  />
                  {formData.requirements.length > 1 && (
                    <button type="button" onClick={() => handleRemoveField('requirements', idx)} className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 border border-transparent hover:border-red-100 transition-all">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Benefits */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Biz nima taklif qilamiz?</label>
              <button type="button" onClick={() => handleAddField('benefits')} className="text-accent hover:text-amber-700 font-bold text-[10px] uppercase flex items-center gap-1.5 transition-all">
                <PlusCircle className="h-3.5 w-3.5" /> Imtiyoz qo'shish
              </button>
            </div>
            <div className="space-y-3">
              {formData.benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-3">
                  <input 
                    className="flex-grow h-10 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-medium text-dark text-sm"
                    placeholder={`Imtiyoz #${idx + 1}`}
                    value={benefit}
                    onChange={(e) => handleFieldChange('benefits', idx, e.target.value)}
                  />
                  {formData.benefits.length > 1 && (
                    <button type="button" onClick={() => handleRemoveField('benefits', idx)} className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 border border-transparent hover:border-red-100 transition-all">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-14 text-base rounded-xl font-bold" isLoading={actionLoading}>
              {editingVacancy ? 'O\'zgarishlarni saqlash' : 'Vakansiyani e\'lon qilish'}
            </Button>
          </div>
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

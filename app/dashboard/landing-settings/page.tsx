'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Image as ImageIcon,
  Users,
  Handshake,
  PanelsTopLeft,
  Save,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

import { landingService } from '@/services/landingService';
import { createShowcaseDraft, type ShowcaseSettings } from '@/lib/landing';

interface HeroSlide {
  _id?: string;
  title: string;
  description: string;
  image: string;
}

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  image: string;
  order: number;
}

interface Partner {
  _id: string;
  name: string;
  logo: string;
}

export default function LandingSettingsPage() {
  const [showcase, setShowcase] = useState<ShowcaseSettings>(() => createShowcaseDraft());
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [heroFormData, setHeroFormData] = useState<HeroSlide>({ title: '', description: '', image: '' });
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  // Team Member Modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    role: '',
    image: '',
    order: 0
  });
  const [teamFile, setTeamFile] = useState<File | null>(null);
  const teamInputRef = useRef<HTMLInputElement>(null);

  // Partner Modal
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    logo: ''
  });
  const [partnerFile, setPartnerFile] = useState<File | null>(null);
  const partnerInputRef = useRef<HTMLInputElement>(null);
  const showcaseMetricLimitReached = showcase.metrics.length >= 4;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string | number, type: 'team' | 'partner' | 'hero' } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsData, teamData, partnersData] = await Promise.all([
        landingService.getSettings(),
        landingService.getTeam(),
        landingService.getPartners()
      ]);
      
      if (settingsData?.showcase) setShowcase(createShowcaseDraft(settingsData.showcase));
      if (settingsData?.heroSlides) setHeroSlides(settingsData.heroSlides);
      if (teamData) setTeamMembers(teamData || []);
      if (partnersData) setPartners(partnersData || []);
    } catch (error) {
      console.error("Error fetching landing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateShowcaseField = <Field extends Exclude<keyof ShowcaseSettings, 'metrics'>>(field: Field, value: ShowcaseSettings[Field]) => {
    setShowcase((current) => ({ ...current, [field]: value }));
  };

  const updateMetric = (index: number, field: 'value' | 'label', value: string) => {
    setShowcase((current) => ({
      ...current,
      metrics: current.metrics.map((metric, metricIndex) => metricIndex === index ? { ...metric, [field]: value } : metric),
    }));
  };

  const addMetric = () => {
    if (showcaseMetricLimitReached) return;
    setShowcase((current) => ({ ...current, metrics: [...current.metrics, { value: '', label: '' }] }));
  };

  const removeMetric = (index: number) => {
    if (showcase.metrics.length === 1) return;
    setShowcase((current) => ({ ...current, metrics: current.metrics.filter((_, metricIndex) => metricIndex !== index) }));
  };

  const saveShowcase = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionLoading(true);
    try {
      const settings = await landingService.updateSettings({ showcase });
      setShowcase(createShowcaseDraft(settings.showcase));
    } catch (error) {
      console.error(error);
      alert("Showcase saqlanmadi. Barcha maydonlarni to‘ldirganingizni tekshiring.");
    } finally {
      setActionLoading(false);
    }
  };

  const openHeroForm = (index: number | null = null) => {
    setHeroFile(null);
    if (index === null) {
      setEditingSlideIndex(null);
      setHeroFormData({ title: '', description: '', image: '' });
    } else {
      setEditingSlideIndex(index);
      setHeroFormData(heroSlides[index]);
    }
    setIsHeroModalOpen(true);
  };

  const saveHeroSlide = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionLoading(true);
    try {
      let image = heroFormData.image;
      if (heroFile) {
        const upload = await landingService.uploadImage(heroFile);
        image = upload.secure_url;
      }
      if (!image) throw new Error("Hero rasmi majburiy");
      const nextSlides = [...heroSlides];
      const nextSlide = { ...heroFormData, image };
      if (editingSlideIndex === null) nextSlides.push(nextSlide);
      else nextSlides[editingSlideIndex] = nextSlide;
      const settings = await landingService.updateSettings({ heroSlides: nextSlides });
      setHeroSlides(settings.heroSlides);
      setIsHeroModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Hero slaydi saqlanmadi");
    } finally {
      setActionLoading(false);
    }
  };

  // Partner Handlers
  const handleOpenPartnerForm = (partner: Partner | null = null) => {
    setPartnerFile(null);
    if (partner) {
      setEditingPartner(partner);
      setPartnerFormData({ name: partner.name, logo: partner.logo });
    } else {
      setEditingPartner(null);
      setPartnerFormData({ name: '', logo: '' });
    }
    setIsPartnerModalOpen(true);
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let logoUrl = partnerFormData.logo;
      if (partnerFile) {
        const uploadRes = await landingService.uploadImage(partnerFile);
        logoUrl = uploadRes.secure_url;
      }
      if (!logoUrl) return alert("Logo yuklanishi shart");

      const finalData = { ...partnerFormData, logo: logoUrl };
      if (editingPartner) await landingService.updatePartner(editingPartner._id, finalData);
      else await landingService.createPartner(finalData);

      const updatedPartners = await landingService.getPartners();
      setPartners(updatedPartners);
      setIsPartnerModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Saqlashda xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  // Team Member Handlers
  const handleOpenTeamForm = (member: TeamMember | null = null) => {
    setTeamFile(null);
    if (member) {
      setEditingMember(member);
      setTeamFormData({ name: member.name, role: member.role, image: member.image, order: member.order });
    } else {
      setEditingMember(null);
      setTeamFormData({ name: '', role: '', image: '', order: teamMembers.length });
    }
    setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let imageUrl = teamFormData.image;
      if (teamFile) {
        const uploadRes = await landingService.uploadImage(teamFile);
        imageUrl = uploadRes.secure_url;
      }
      if (!imageUrl) return alert("Rasm yuklanishi shart");

      const finalData = { ...teamFormData, image: imageUrl };
      if (editingMember) await landingService.updateTeamMember(editingMember._id, finalData);
      else await landingService.createTeamMember(finalData);
      
      const updatedTeam = await landingService.getTeam();
      setTeamMembers(updatedTeam);
      setIsTeamModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Saqlashda xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = (id: string | number, type: 'team' | 'partner' | 'hero') => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      if (itemToDelete.type === 'team') {
        await landingService.deleteTeamMember(itemToDelete.id as string);
        setTeamMembers(prev => prev.filter(m => m._id !== itemToDelete.id));
      } else if (itemToDelete.type === 'partner') {
        await landingService.deletePartner(itemToDelete.id as string);
        setPartners(prev => prev.filter(p => p._id !== itemToDelete.id));
      } else {
        const nextSlides = heroSlides.filter((_, index) => index !== itemToDelete.id);
        const settings = await landingService.updateSettings({ heroSlides: nextSlides });
        setHeroSlides(settings.heroSlides);
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("O'chirishda xatolik");
    } finally {
      setActionLoading(false);
      setItemToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-gray-500 mt-4 font-medium">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <PanelsTopLeft className="h-5 w-5 text-primary" /> Showcase
            </h2>
            <p className="text-gray-500 text-xs mt-1">Landing sahifasining birinchi ekrani. Undagi barcha matn, tugma va ko‘rsatkichlarni shu yerdan boshqaring.</p>
          </div>
        </div>

        <form onSubmit={saveShowcase} className="bg-white rounded-xl border border-gray-200 p-5 md:p-7 space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">Yuqori yozuv</span>
              <input required value={showcase.eyebrow} onChange={(event) => updateShowcaseField('eyebrow', event.target.value)} className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm" placeholder="Masalan: Najot Ta'lim jamoasi" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">Asosiy tugma manzili</span>
              <input required value={showcase.primaryCtaHref} onChange={(event) => updateShowcaseField('primaryCtaHref', event.target.value)} className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm" placeholder="/vacancies" />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-gray-700">Sarlavha</span>
            <textarea required rows={2} value={showcase.title} onChange={(event) => updateShowcaseField('title', event.target.value)} className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-base font-semibold text-dark resize-y" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-gray-700">Tavsif</span>
            <textarea required rows={3} value={showcase.description} onChange={(event) => updateShowcaseField('description', event.target.value)} className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm leading-relaxed resize-y" />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">Asosiy tugma matni</span>
              <input required value={showcase.primaryCtaLabel} onChange={(event) => updateShowcaseField('primaryCtaLabel', event.target.value)} className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">Ikkinchi tugma matni</span>
              <input required value={showcase.secondaryCtaLabel} onChange={(event) => updateShowcaseField('secondaryCtaLabel', event.target.value)} className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-700">Ikkinchi tugma manzili</span>
              <input required value={showcase.secondaryCtaHref} onChange={(event) => updateShowcaseField('secondaryCtaHref', event.target.value)} className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm" placeholder="/skills-check" />
            </label>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div><h3 className="font-semibold text-dark">Ko‘rsatkichlar</h3><p className="text-xs text-gray-500 mt-1">1–4 ta qiymat qo‘shishingiz mumkin.</p></div>
              <button type="button" disabled={showcaseMetricLimitReached} onClick={addMetric} className="inline-flex items-center gap-2 text-sm font-semibold text-primary disabled:text-gray-400 disabled:cursor-not-allowed"><Plus className="h-4 w-4" /> Qo‘shish</button>
            </div>
            <div className="space-y-3">
              {showcase.metrics.map((metric, index) => (
                <div key={index} className="grid grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)_auto] gap-3 items-center">
                  <input required value={metric.value} onChange={(event) => updateMetric(index, 'value', event.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm font-semibold" placeholder="350+" aria-label={`${index + 1}-ko‘rsatkich qiymati`} />
                  <input required value={metric.label} onChange={(event) => updateMetric(index, 'label', event.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm" placeholder="jamoa a’zosi" aria-label={`${index + 1}-ko‘rsatkich nomi`} />
                  <button type="button" disabled={showcase.metrics.length === 1} onClick={() => removeMetric(index)} className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-200 disabled:cursor-not-allowed" aria-label="Ko‘rsatkichni o‘chirish"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto h-11 rounded-lg" icon={<Save className="h-4 w-4" />} isLoading={actionLoading}>Showcase&apos;ni saqlash</Button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-dark flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Hero fon slaydlari</h2>
            <p className="text-gray-500 text-xs mt-1">Bu rasmlar hero fonida chiqadi; har bir rasm o‘z sarlavhasi va tavsifiga ega.</p>
          </div>
          <Button className="w-full sm:w-auto h-11 text-sm rounded-lg" icon={<Plus className="h-4 w-4" />} onClick={() => openHeroForm()}>Slayd qo‘shish</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {heroSlides.map((slide, index) => (
            <article key={slide._id || `${slide.image}-${index}`} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="relative h-44 bg-gray-100">
                <img src={slide.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute right-3 top-3 flex gap-2">
                  <button type="button" onClick={() => openHeroForm(index)} className="rounded-lg bg-white p-2 text-primary shadow-sm transition-colors hover:bg-gray-50" aria-label="Slaydni tahrirlash"><Edit2 className="h-4 w-4" /></button>
                  <button type="button" disabled={heroSlides.length === 1} onClick={() => handleDeleteItem(index, 'hero')} className="rounded-lg bg-white p-2 text-red-500 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300" aria-label="Slaydni o‘chirish"><Trash2 className="h-4 w-4" /></button>
                </div>
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-white">{index + 1}-slayd</span>
              </div>
              <div className="p-4"><h3 className="font-semibold text-dark line-clamp-1">{slide.title}</h3><p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{slide.description}</p></div>
            </article>
          ))}
        </div>
      </section>

      {/* Partners Settings */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" /> Hamkorlar
            </h2>
            <p className="text-gray-500 text-xs mt-1">Hamkor kompaniyalar logotiplari</p>
          </div>
          <Button className="w-full sm:w-48 h-11 text-sm rounded-lg" icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenPartnerForm()}>
            Hamkor qo'shish
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {partners.map((partner) => (
            <div key={partner._id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-3 relative group hover:shadow-sm transition-all">
              <div className="h-16 w-full flex items-center justify-center">
                <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 text-center line-clamp-1 uppercase tracking-wider">{partner.name}</span>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenPartnerForm(partner)} className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-primary hover:bg-gray-50">
                  <Edit2 className="h-3 w-3" />
                </button>
                <button onClick={() => handleDeleteItem(partner._id, 'partner')} className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-red-500 hover:bg-gray-50">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Settings */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Jamoa a'zolari
            </h2>
            <p className="text-gray-500 text-xs mt-1">Xodimlar ro'yxati va tartibi</p>
          </div>
          <Button className="w-full sm:w-48 h-11 text-sm rounded-lg" icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenTeamForm()}>
            A'zo qo'shish
          </Button>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">A'zo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kasbi</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamMembers.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={member.image} alt={member.name} className="w-9 h-9 rounded-full object-cover border border-gray-100 shadow-sm" />
                      <span className="font-semibold text-dark text-sm">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">{member.role}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenTeamForm(member)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteItem(member._id, 'team')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {teamMembers.map((member) => (
            <div key={member._id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div>
                  <h4 className="font-bold text-dark text-sm">{member.name}</h4>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenTeamForm(member)} className="p-2 text-gray-400 active:text-primary transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteItem(member._id, 'team')} className="p-2 text-gray-400 active:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={isHeroModalOpen} onClose={() => setIsHeroModalOpen(false)} title={editingSlideIndex === null ? 'Yangi hero slaydi' : 'Hero slaydini tahrirlash'}>
        <form onSubmit={saveHeroSlide} className="space-y-5">
          <div className="space-y-2">
            <button type="button" onClick={() => heroInputRef.current?.click()} className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-primary/50">
              {(heroFile || heroFormData.image) ? <img src={heroFile ? URL.createObjectURL(heroFile) : heroFormData.image} className="h-full w-full object-cover" alt="Hero rasmi preview" /> : <span className="text-center text-sm font-medium text-gray-400"><ImageIcon className="mx-auto mb-2 h-7 w-7" />Rasm yuklash</span>}
            </button>
            <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(event) => setHeroFile(event.target.files?.[0] || null)} />
          </div>
          <label className="block space-y-1.5"><span className="text-xs font-semibold text-gray-700">Sarlavha</span><input required value={heroFormData.title} onChange={(event) => setHeroFormData((current) => ({ ...current, title: event.target.value }))} className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm font-semibold outline-none focus:border-primary focus:bg-white" /></label>
          <label className="block space-y-1.5"><span className="text-xs font-semibold text-gray-700">Tavsif</span><textarea required rows={3} value={heroFormData.description} onChange={(event) => setHeroFormData((current) => ({ ...current, description: event.target.value }))} className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed outline-none focus:border-primary focus:bg-white" /></label>
          <Button type="submit" className="h-11 w-full rounded-lg" isLoading={actionLoading}>Slaydni saqlash</Button>
        </form>
      </Modal>

      {/* Partner Modal */}
      <Modal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} title={editingPartner ? 'Hamkorni tahrirlash' : 'Yangi hamkor qo\'shish'}>
        <form onSubmit={handlePartnerSubmit} className="space-y-5">
          <div className="space-y-2">
            <div onClick={() => partnerInputRef.current?.click()} className="relative h-32 w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all hover:border-primary/50">
              {(partnerFile || partnerFormData.logo) ? <img src={partnerFile ? URL.createObjectURL(partnerFile) : partnerFormData.logo} className="max-h-full max-w-full object-contain p-6" alt="Preview" /> : (
                <div className="text-center p-4">
                  <ImageIcon className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logo yuklash</p>
                </div>
              )}
            </div>
            <input type="file" ref={partnerInputRef} className="hidden" accept="image/*" onChange={(e) => setPartnerFile(e.target.files?.[0] || null)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kompaniya nomi</label>
            <input required className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="Kompaniya nomi..." value={partnerFormData.name} onChange={(e) => setPartnerFormData({...partnerFormData, name: e.target.value})} />
          </div>
          <Button type="submit" className="w-full h-12 rounded-lg font-bold" isLoading={actionLoading}>Saqlash</Button>
        </form>
      </Modal>

      {/* Team Modal */}
      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title={editingMember ? 'A\'zoni tahrirlash' : 'Yangi a\'zo qo\'shish'}>
        <form onSubmit={handleTeamSubmit} className="space-y-5">
          <div className="flex justify-center">
            <div onClick={() => teamInputRef.current?.click()} className="w-28 h-28 rounded-full border-4 border-gray-50 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-primary/30 transition-all">
              {(teamFile || teamFormData.image) ? <img src={teamFile ? URL.createObjectURL(teamFile) : teamFormData.image} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            <input type="file" ref={teamInputRef} className="hidden" accept="image/*" onChange={(e) => setTeamFile(e.target.files?.[0] || null)} />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">F.I.SH</label>
              <input required className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="F.I.SH..." value={teamFormData.name} onChange={(e) => setTeamFormData({...teamFormData, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kasbi</label>
              <input required className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="Kasbi..." value={teamFormData.role} onChange={(e) => setTeamFormData({...teamFormData, role: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tartib raqami</label>
              <input type="number" className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="Tartib raqami..." value={teamFormData.order} onChange={(e) => setTeamFormData({...teamFormData, order: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-lg font-bold" isLoading={actionLoading}>Saqlash</Button>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteItem} title="O'chirib tashlaysizmi?" description="Ushbu ma'lumot tizimdan butunlay o'chib ketadi." isLoading={actionLoading} />
    </div>
  );
}

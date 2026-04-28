'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  PlusCircle,
  Loader2,
  Image as ImageIcon,
  Users,
  Layout,
  Upload,
  Handshake
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

import { landingService } from '@/services/landingService';

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
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Hero Modal
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [heroFormData, setHeroFormData] = useState<HeroSlide>({
    title: '',
    description: '',
    image: ''
  });
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
      
      if (settingsData) setHeroSlides(settingsData.heroSlides || []);
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

  // Hero Slide Handlers
  const handleOpenHeroForm = (index: number | null = null) => {
    setHeroFile(null);
    if (index !== null) {
      setEditingSlideIndex(index);
      setHeroFormData(heroSlides[index]);
    } else {
      setEditingSlideIndex(null);
      setHeroFormData({ title: '', description: '', image: '' });
    }
    setIsHeroModalOpen(true);
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let imageUrl = heroFormData.image;
      if (heroFile) {
        const uploadRes = await landingService.uploadImage(heroFile);
        imageUrl = uploadRes.secure_url;
      }
      if (!imageUrl) return alert("Rasm yuklanishi shart");

      let newSlides = [...heroSlides];
      const slideData = { ...heroFormData, image: imageUrl };
      if (editingSlideIndex !== null) newSlides[editingSlideIndex] = slideData;
      else newSlides.push(slideData);

      await landingService.updateSettings({ heroSlides: newSlides });
      setHeroSlides(newSlides);
      setIsHeroModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Saqlashda xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteHeroSlide = (index: number) => {
    setItemToDelete({ id: index, type: 'hero' });
    setIsDeleteModalOpen(true);
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
      } else if (itemToDelete.type === 'hero') {
        const newSlides = heroSlides.filter((_, i) => i !== itemToDelete.id);
        await landingService.updateSettings({ heroSlides: newSlides });
        setHeroSlides(newSlides);
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
      {/* Hero Settings */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-dark flex items-center gap-2">
              <Layout className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Hero Slaydlar
            </h2>
            <p className="text-gray-500 text-xs md:text-sm">Landing pagedagi asosiy showcase qismi</p>
          </div>
          <Button className="w-full sm:w-auto h-11 md:h-12" icon={<Plus className="h-5 w-5" />} onClick={() => handleOpenHeroForm()}>
            Slayd qo'shish
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {heroSlides.map((slide, idx) => (
            <div key={idx} className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden group">
              <div className="relative h-40 md:h-48 bg-gray-100">
                {slide.image && <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />}
                <div className="absolute top-3 right-3 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenHeroForm(idx)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-primary hover:text-emerald-700">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteHeroSlide(idx)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <h3 className="font-bold text-dark line-clamp-1">{slide.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2 line-clamp-2">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Settings */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-dark flex items-center gap-2">
              <Handshake className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Hamkorlar
            </h2>
            <p className="text-gray-500 text-xs md:text-sm">Landing pagedagi hamkorlar logotiplari</p>
          </div>
          <Button className="w-full sm:w-auto h-11 md:h-12" icon={<Plus className="h-5 w-5" />} onClick={() => handleOpenPartnerForm()}>
            Hamkor qo'shish
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {partners.map((partner) => (
            <div key={partner._id} className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 flex flex-col items-center gap-2 md:gap-3 relative group">
              <div className="h-12 md:h-16 w-full flex items-center justify-center">
                <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain grayscale md:group-hover:grayscale-0 transition-all" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-dark text-center line-clamp-1">{partner.name}</span>
              <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenPartnerForm(partner)} className="p-1.5 bg-white shadow-sm border border-gray-50 rounded-lg text-primary hover:text-emerald-700">
                  <Edit2 className="h-3 w-3" />
                </button>
                <button onClick={() => handleDeleteItem(partner._id, 'partner')} className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-lg text-red-500 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Settings */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-dark flex items-center gap-2">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Jamoa a'zolari
            </h2>
            <p className="text-gray-500 text-xs md:text-sm">Landing pagedagi "Jamoamiz" bo'limi</p>
          </div>
          <Button className="w-full sm:w-auto h-11 md:h-12" icon={<Plus className="h-5 w-5" />} onClick={() => handleOpenTeamForm()}>
            A'zo qo'shish
          </Button>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">A'zo</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Kasbi</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teamMembers.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                      <span className="font-bold text-dark">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{member.role}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenTeamForm(member)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteItem(member._id, 'team')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {teamMembers.map((member) => (
            <div key={member._id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <h4 className="font-bold text-dark text-sm">{member.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenTeamForm(member)} className="p-2 text-primary active:bg-primary/5 rounded-lg transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteItem(member._id, 'team')} className="p-2 text-red-500 active:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals are unchanged but updated to use new handlers */}
      <Modal isOpen={isHeroModalOpen} onClose={() => setIsHeroModalOpen(false)} title={editingSlideIndex !== null ? 'Slaydni tahrirlash' : 'Yangi slayd qo\'shish'}>
        <form onSubmit={handleHeroSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <div onClick={() => heroInputRef.current?.click()} className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
              {(heroFile || heroFormData.image) ? <img src={heroFile ? URL.createObjectURL(heroFile) : heroFormData.image} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon className="h-10 w-10 text-gray-300" />}
            </div>
            <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} />
          </div>
          <input required className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-bold" placeholder="Sarlavha" value={heroFormData.title} onChange={(e) => setHeroFormData({...heroFormData, title: e.target.value})} />
          <textarea required rows={3} className="w-full p-5 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-medium resize-none" placeholder="Tavsif" value={heroFormData.description} onChange={(e) => setHeroFormData({...heroFormData, description: e.target.value})} />
          <Button type="submit" className="w-full h-14" isLoading={actionLoading}>Saqlash</Button>
        </form>
      </Modal>

      <Modal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} title={editingPartner ? 'Hamkorni tahrirlash' : 'Yangi hamkor qo\'shish'}>
        <form onSubmit={handlePartnerSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <div onClick={() => partnerInputRef.current?.click()} className="relative h-32 w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
              {(partnerFile || partnerFormData.logo) ? <img src={partnerFile ? URL.createObjectURL(partnerFile) : partnerFormData.logo} className="max-h-full max-w-full object-contain p-4" alt="Preview" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            <input type="file" ref={partnerInputRef} className="hidden" accept="image/*" onChange={(e) => setPartnerFile(e.target.files?.[0] || null)} />
          </div>
          <input required className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-bold" placeholder="Kompaniya nomi" value={partnerFormData.name} onChange={(e) => setPartnerFormData({...partnerFormData, name: e.target.value})} />
          <Button type="submit" className="w-full h-14" isLoading={actionLoading}>Saqlash</Button>
        </form>
      </Modal>

      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title={editingMember ? 'A\'zoni tahrirlash' : 'Yangi a\'zo qo\'shish'}>
        <form onSubmit={handleTeamSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div onClick={() => teamInputRef.current?.click()} className="w-32 h-32 rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden relative">
              {(teamFile || teamFormData.image) ? <img src={teamFile ? URL.createObjectURL(teamFile) : teamFormData.image} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            <input type="file" ref={teamInputRef} className="hidden" accept="image/*" onChange={(e) => setTeamFile(e.target.files?.[0] || null)} />
          </div>
          <input required className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-bold" placeholder="F.I.SH" value={teamFormData.name} onChange={(e) => setTeamFormData({...teamFormData, name: e.target.value})} />
          <input required className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-bold" placeholder="Kasbi" value={teamFormData.role} onChange={(e) => setTeamFormData({...teamFormData, role: e.target.value})} />
          <input type="number" className="w-full h-14 px-5 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-bold" placeholder="Tartib raqami" value={teamFormData.order} onChange={(e) => setTeamFormData({...teamFormData, order: parseInt(e.target.value) || 0})} />
          <Button type="submit" className="w-full h-14" isLoading={actionLoading}>Saqlash</Button>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteItem} title="O'chirib tashlaysizmi?" description="Ushbu ma'lumot tizimdan butunlay o'chib ketadi." isLoading={actionLoading} />
    </div>
  );
}

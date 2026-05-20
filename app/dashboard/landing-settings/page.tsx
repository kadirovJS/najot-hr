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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" /> Hero Slaydlar
            </h2>
            <p className="text-gray-500 text-xs mt-1">Landing pagedagi asosiy banner qismi</p>
          </div>
          <Button className="w-full sm:w-48 h-11 text-sm rounded-lg" icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenHeroForm()}>
            Slayd qo'shish
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {heroSlides.map((slide, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition-all">
              <div className="relative h-44 bg-gray-50 border-b border-gray-100">
                {slide.image && <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => handleOpenHeroForm(idx)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-primary hover:bg-white transition-colors border border-gray-100">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteHeroSlide(idx)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-red-500 hover:bg-white transition-colors border border-gray-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-dark text-base line-clamp-1">{slide.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{slide.description}</p>
              </div>
            </div>
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

      {/* Hero Modal */}
      <Modal isOpen={isHeroModalOpen} onClose={() => setIsHeroModalOpen(false)} title={editingSlideIndex !== null ? 'Slaydni tahrirlash' : 'Yangi slayd qo\'shish'}>
        <form onSubmit={handleHeroSubmit} className="space-y-5">
          <div className="space-y-2">
            <div onClick={() => heroInputRef.current?.click()} className="relative aspect-video w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all hover:border-primary/50">
              {(heroFile || heroFormData.image) ? <img src={heroFile ? URL.createObjectURL(heroFile) : heroFormData.image} className="w-full h-full object-cover" alt="Preview" /> : (
                <div className="text-center p-4">
                  <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rasm yuklash</p>
                </div>
              )}
            </div>
            <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sarlavha</label>
              <input required className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-semibold text-dark text-sm" placeholder="Sarlavha..." value={heroFormData.title} onChange={(e) => setHeroFormData({...heroFormData, title: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tavsif</label>
              <textarea required rows={3} className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none font-medium text-dark text-sm resize-none" placeholder="Tavsif..." value={heroFormData.description} onChange={(e) => setHeroFormData({...heroFormData, description: e.target.value})} />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-lg font-bold" isLoading={actionLoading}>Saqlash</Button>
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

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  Bell, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { onboardingService } from '@/services/onboardingService';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  
  // Profile state
  const [profileData, setProfileData] = useState({ name: '', phone: '', image: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security state
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);

  // Notification state
  const [notifData, setNotifData] = useState({ browser: true, email: false });
  const [emailToVerify, setEmailToVerify] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/me');
      const data = await res.json();
      setUser(data);
      setProfileData({ name: data.name, phone: data.phone, image: data.image || '' });
      setNotifData(data.notificationSettings || { browser: true, email: false });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) alert("Profil yangilandi");
      else alert("Xatolik yuz berdi");
    } catch (error) {
      alert("Xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await onboardingService.uploadImageToCloudinary(file);
      const imageUrl = res.secure_url;
      
      // Bazaga darhol saqlash
      await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData, image: imageUrl })
      });
      
      setProfileData({ ...profileData, image: imageUrl });
      alert("Profil rasmi yangilandi");
      
      // Sahifani yangilamasdan sessionni yangilash imkoni bo'lmasa, ma'lumotni qayta yuklaymiz
      loadUser();
    } catch (error) {
      alert("Rasm yuklashda xatolik");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      return alert("Yangi parollar mos kelmadi");
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/settings/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Parol yangilandi");
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!emailToVerify) return alert("Email kiriting");
    setVerifyingEmail(true);
    try {
      const res = await fetch('/api/settings/email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify })
      });
      if (res.ok) setCodeSent(true);
      else alert("Xatolik");
    } catch (error) {
      alert("Xatolik");
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifyingEmail(true);
    try {
      const res = await fetch('/api/settings/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify, code: verificationCode })
      });
      if (res.ok) {
        alert("Email tasdiqlandi!");
        loadUser();
        setCodeSent(false);
        setVerificationCode('');
      } else {
        alert("Kod noto'g'ri");
      }
    } catch (error) {
      alert("Xatolik");
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleToggleNotif = async (field: 'browser' | 'email', value: boolean) => {
    const newData = { ...notifData, [field]: value };
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (res.ok) setNotifData(newData);
      else {
        const d = await res.json();
        alert(d.error || "Xatolik");
      }
    } catch (error) {
      alert("Xatolik");
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20 px-4 md:px-0">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">Sozlamalar</h1>
        <p className="text-gray-500 text-xs md:text-sm font-medium">Shaxsiy ma'lumotlar va xavfsizlik boshqaruvi</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-1.5">
          <TabButton active={activeTab === 'profile'} icon={<UserIcon className="h-4 w-4" />} label="Profil" onClick={() => setActiveTab('profile')} />
          <TabButton active={activeTab === 'security'} icon={<Lock className="h-4 w-4" />} label="Xavfsizlik" onClick={() => setActiveTab('security')} />
          <TabButton active={activeTab === 'notifications'} icon={<Bell className="h-4 w-4" />} label="Bildirishnomalar" onClick={() => setActiveTab('notifications')} />
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10 min-h-[500px]">
          {activeTab === 'profile' && (
            <div className="space-y-8 md:space-y-10">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                   <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-gray-50 bg-gray-50 flex items-center justify-center overflow-hidden shadow-md">
                      {profileData.image ? (
                        <img src={profileData.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-300" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-dark/40 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                   </div>
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all border-4 border-white"
                   >
                     <Camera className="h-4 w-4" />
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="text-center">
                   <h3 className="text-lg md:text-xl font-bold text-dark">{user.name}</h3>
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mt-1 border border-gray-100 bg-gray-50 px-2 py-0.5 rounded-full inline-block">{user.role} • {user.department}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg mx-auto">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">F.I.SH</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input className="w-full h-11 pl-12 pr-6 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none font-semibold text-dark transition-all text-sm" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Telefon raqami</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input className="w-full h-11 pl-12 pr-6 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none font-semibold text-dark transition-all text-sm" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                </div>
                <Button className="w-full h-12 rounded-lg font-bold" isLoading={actionLoading}>O'zgarishlarni saqlash</Button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 md:space-y-10">
              <div className="flex items-start gap-4 p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                   <h4 className="font-bold text-amber-800 text-sm">Xavfsizlik maslahati</h4>
                   <p className="text-amber-700/80 text-xs mt-1 leading-relaxed">Kuchli va takrorlanmas parollardan foydalaning. Parolingizni hech kimga bermang.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg mx-auto">
                <PasswordField label="Joriy parol" value={securityData.currentPassword} onChange={(val:any) => setSecurityData({...securityData, currentPassword: val})} show={showPass} onToggle={() => setShowPass(!showPass)} />
                <div className="w-full h-px bg-gray-100" />
                <PasswordField label="Yangi parol" value={securityData.newPassword} onChange={(val:any) => setSecurityData({...securityData, newPassword: val})} show={showPass} onToggle={() => setShowPass(!showPass)} />
                <PasswordField label="Yangi parolni tasdiqlash" value={securityData.confirmPassword} onChange={(val:any) => setSecurityData({...securityData, confirmPassword: val})} show={showPass} onToggle={() => setShowPass(!showPass)} />
                <Button className="w-full h-12 rounded-lg font-bold" isLoading={actionLoading}>Parolni yangilash</Button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-dark tracking-tight">Bildirishnomalar</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Yangiliklardan xabardor bo'lish usulini tanlang</p>
                </div>
              </div>

              <div className="grid gap-4">
                <ToggleItem 
                  icon={<Bell className="h-5 w-5" />}
                  title="Brauzer" 
                  description="Muhim bildirishnomalarni brauzer orqali ko'rish"
                  active={notifData.browser}
                  onToggle={() => handleToggleNotif('browser', !notifData.browser)}
                />
                
                <ToggleItem 
                  icon={<Mail className="h-5 w-5" />}
                  title="Email" 
                  description="Haftalik hisobotlar va yangiliklarni pochta orqali olish"
                  active={notifData.email}
                  onToggle={() => {
                    if (!user.emailVerified) alert("Emailni avval tasdiqlashingiz kerak");
                    else handleToggleNotif('email', !notifData.email);
                  }}
                />
              </div>

              {/* Email Verification Section */}
              <div className="pt-10 border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <h4 className="font-bold text-dark flex items-center gap-2 text-lg">
                         <ShieldCheck className="h-5 w-5 text-primary" /> Emailni tasdiqlash
                       </h4>
                       <p className="text-sm text-gray-500 font-medium">Email bildirishnomalari uchun pochtangizni tasdiqlang</p>
                    </div>

                    <div className="w-full md:w-auto">
                      {user.emailVerified ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-bold text-sm">
                          <CheckCircle2 className="h-4 w-4 shrink-0" /> 
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {!codeSent ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="relative flex-grow">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none font-semibold text-dark text-sm" 
                                  placeholder="Email manzilingiz" 
                                  value={emailToVerify}
                                  onChange={(e) => setEmailToVerify(e.target.value)}
                                />
                              </div>
                              <Button className="h-11 px-6 shrink-0 rounded-lg text-sm font-bold" isLoading={verifyingEmail} onClick={handleSendCode}>Kodni yuborish</Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between gap-4 bg-primary/5 p-3 rounded-lg border border-primary/10">
                                 <p className="text-xs font-bold text-primary italic truncate">Kod yuborildi: {emailToVerify}</p>
                                 <button className="text-[10px] font-bold uppercase text-primary hover:underline shrink-0" onClick={() => setCodeSent(false)}>O'zgartirish</button>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input 
                                  className="flex-grow h-11 px-4 rounded-lg border border-gray-200 bg-white outline-none font-bold text-dark text-center tracking-[8px] text-lg focus:ring-2 focus:ring-primary/20" 
                                  placeholder="0000" 
                                  maxLength={4}
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value)}
                                />
                                <Button className="h-11 px-6 shrink-0 rounded-lg text-sm font-bold" isLoading={verifyingEmail} onClick={handleVerifyEmail}>Tasdiqlash</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-3.5 rounded-lg font-bold text-sm transition-all border-l-4 ${active ? 'bg-primary text-white border-primary shadow-md' : 'text-gray-400 border-transparent hover:bg-gray-50 hover:text-dark'}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input 
          type={show ? 'text' : 'password'}
          className="w-full h-11 pl-12 pr-12 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none font-semibold text-dark transition-all text-sm" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
        />
        <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ToggleItem({ icon, title, description, active, onToggle }: any) {
  return (
    <div 
      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
        active 
          ? 'border-primary/20 bg-primary/[0.02]' 
          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50'
      }`}
    >
      <div className={`shrink-0 p-2.5 rounded-lg transition-colors ${
        active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
      }`}>
        {icon}
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-dark leading-tight text-sm md:text-base">{title}</h4>
        <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1 md:line-clamp-none">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-primary/20 shrink-0 ${
          active ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out transform ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

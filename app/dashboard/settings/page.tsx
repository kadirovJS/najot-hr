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
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-10 pb-20 px-4 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-dark tracking-tight">Sozlamalar</h1>
        <p className="text-gray-500 text-sm md:text-base font-medium italic">Shaxsiy ma'lumotlar va xavfsizlik boshqaruvi</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <TabButton active={activeTab === 'profile'} icon={<UserIcon className="h-5 w-5" />} label="Profil" onClick={() => setActiveTab('profile')} />
          <TabButton active={activeTab === 'security'} icon={<Lock className="h-5 w-5" />} label="Xavfsizlik" onClick={() => setActiveTab('security')} />
          <TabButton active={activeTab === 'notifications'} icon={<Bell className="h-5 w-5" />} label="Bildirishnomalar" onClick={() => setActiveTab('notifications')} />
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-12 min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="space-y-8 md:space-y-10">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                   <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-gray-50 bg-gray-50 flex items-center justify-center overflow-hidden shadow-xl">
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
                     className="absolute bottom-0 right-0 p-2.5 md:p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-all border-4 border-white"
                   >
                     <Camera className="h-4 w-4" />
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="text-center">
                   <h3 className="text-lg md:text-xl font-black text-dark">{user.name}</h3>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{user.role} • {user.department}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg mx-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">F.I.SH</label>
                  <div className="relative">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input className="w-full h-14 pl-14 pr-6 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none font-bold text-dark transition-all" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Telefon raqami</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input className="w-full h-14 pl-14 pr-6 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none font-bold text-dark transition-all" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                </div>
                <Button className="w-full h-14 shadow-lg shadow-primary/20" isLoading={actionLoading}>O'zgarishlarni saqlash</Button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 md:space-y-10">
              <div className="flex items-start gap-4 p-5 md:p-6 bg-amber-50 rounded-2xl md:rounded-[2rem] border border-amber-100">
                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-amber-500 shrink-0 mt-1 md:mt-0" />
                <div>
                   <h4 className="font-black text-amber-700 text-sm md:text-base">Xavfsizlik maslahati</h4>
                   <p className="text-amber-600 text-xs md:text-sm font-medium">Kuchli va takrorlanmas parollardan foydalaning. Parolingizni boshqalarga bermang.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg mx-auto">
              
                <PasswordField label="Joriy parol" value={securityData.currentPassword} onChange={(val:any) => setSecurityData({...securityData, currentPassword: val})} show={showPass} onToggle={() => setShowPass(!showPass)} />
                <div className="w-full h-px bg-gray-50 my-2" />
                <PasswordField label="Yangi parol" value={securityData.newPassword} onChange={(val:any) => setSecurityData({...securityData, newPassword: val})} show={showPass} onToggle={() => setShowPass(!showPass)} />
                <PasswordField label="Yangi parolni tasdiqlash" value={securityData.confirmPassword} onChange={(val:any) => setSecurityData({...securityData, confirmPassword: val})} show={showPass} onToggle={() => setShowPass(!showPass)} />
                <Button className="w-full h-14" isLoading={actionLoading}>Parolni yangilash</Button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 md:space-y-10">
              <div>
                <h3 className="text-xl font-black text-dark tracking-tight">Bildirishnoma sozlamalari</h3>
                <p className="text-gray-500 text-sm font-medium">Qanday qilib yangiliklardan xabardor bo'lishni xohlaysiz?</p>
              </div>

              <div className="space-y-4">
                <ToggleItem 
                  icon={<div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Bell className="h-5 w-5" /></div>}
                  title="Brauzer" 
                  description="Brauzerda ko'rish"
                  active={notifData.browser}
                  onToggle={() => handleToggleNotif('browser', !notifData.browser)}
                />
                
                <ToggleItem 
                  icon={<div className="p-3 bg-purple-50 text-purple-500 rounded-xl"><Mail className="h-5 w-5" /></div>}
                  title="Email" 
                  description="Pochta orqali olish"
                  active={notifData.email}
                  onToggle={() => {
                    if (!user.emailVerified) alert("Emailni avval tasdiqlashingiz kerak");
                    else handleToggleNotif('email', !notifData.email);
                  }}
                />
              </div>

              {/* Email Verification Section */}
              <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t border-gray-50 space-y-6">
                <div>
                   <h4 className="font-black text-dark flex items-center gap-2">
                     <Mail className="h-5 w-5 text-primary" /> Emailni tasdiqlash
                   </h4>
                   <p className="text-xs md:text-sm text-gray-500 font-medium">Email bildirishnomalari uchun pochtangizni tasdiqlang</p>
                </div>

                {user.emailVerified ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0" /> <span className="break-all">Tasdiqlangan: {user.email}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!codeSent ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          className="flex-grow h-14 px-6 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-bold text-dark w-full" 
                          placeholder="Email manzilingiz" 
                          value={emailToVerify}
                          onChange={(e) => setEmailToVerify(e.target.value)}
                        />
                        <Button className="h-14 px-8 shrink-0 w-full sm:w-auto" isLoading={verifyingEmail} onClick={handleSendCode}>Kodni yuborish</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                           <p className="text-xs font-bold text-primary italic break-all">{emailToVerify} manziliga kod yuborildi</p>
                           <button className="text-[10px] font-black uppercase text-gray-400 hover:text-dark text-left" onClick={() => setCodeSent(false)}>Emailni o'zgartirish</button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input 
                            className="flex-grow h-14 px-6 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-bold text-dark text-center tracking-[10px] text-2xl w-full" 
                            placeholder="0000" 
                            maxLength={4}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                          />
                          <Button className="h-14 px-8 shrink-0 w-full sm:w-auto" isLoading={verifyingEmail} onClick={handleVerifyEmail}>Tasdiqlash</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all border-l-4 ${active ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'text-gray-400 border-transparent hover:bg-gray-50 hover:text-dark'}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</label>
      <div className="relative">
        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type={show ? 'text' : 'password'}
          className="w-full h-14 pl-14 pr-14 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none font-bold text-dark transition-all" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
        />
        <button type="button" onClick={onToggle} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function ToggleItem({ icon, title, description, active, onToggle }: any) {
  return (
    <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-50 hover:border-primary/20 transition-all">
      <div className="shrink-0">{icon}</div>
      <div className="flex-grow">
        <h4 className="font-black text-dark leading-tight text-sm md:text-base">{title}</h4>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1 line-clamp-1 md:line-clamp-none">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 md:w-14 h-7 md:h-8 rounded-full p-1 transition-all duration-300 shrink-0 ${active ? 'bg-primary' : 'bg-gray-200'}`}
      >
        <div className={`w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${active ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

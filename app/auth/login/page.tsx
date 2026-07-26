'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        phone: `998${phone}`,
        password,
      });

      if (result?.error) {
        setError('Telefon raqami yoki parol xato!');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Tizimda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image 
              src="https://najottalim.uz/icons/logo.svg" 
              alt="Najot Ta'lim Logo" 
              width={160} 
              height={40} 
              className="h-10 w-auto mx-auto"
            />
          </Link>
          <h2 className="text-2xl font-bold text-dark">ERP Tizimiga kirish</h2>
          <p className="text-gray-500 mt-2 text-sm">O&apos;z hisobingiz ma&apos;lumotlarini kiriting</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Telefon raqami
            </label>
            <div className="flex h-12 overflow-hidden rounded-xl border border-gray-200 bg-white transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-700" aria-hidden="true">+998</span>
              <input
                id="login-phone"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[0-9]{9}"
                maxLength={9}
                className="min-w-0 flex-1 px-4 outline-none"
                placeholder="901234567"
                value={phone}
                onChange={(event) => setPhone(normalizePhoneNumber(event.target.value))}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Parol
              </label>
            </div>
            <div className="relative">
              <input 
                required
                type={showPassword ? "text" : "password"} 
                className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <button 
            disabled={loading}
            type="submit" 
            className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-opacity-95 active:scale-[0.98] transition-all mt-2 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Kirish'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Agar kirishda muammo bo&apos;lsa, HR bo&apos;limiga murojaat qiling.
          </p>
        </div>
      </div>
    </div>
  );
}

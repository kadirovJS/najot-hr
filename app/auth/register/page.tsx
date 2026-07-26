'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Phone } from 'lucide-react';

const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);

export default function RegisterPage() {
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
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
          <h2 className="text-2xl font-bold text-dark">Ro&apos;yxatdan o&apos;tish</h2>
          <p className="text-gray-500 mt-2 text-sm">Najot Ta&apos;lim jamoasiga qo&apos;shilish uchun ma&apos;lumotlaringizni kiriting</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">F.I.SH (To&apos;liq)</label>
            <input 
              type="text" 
              className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Eshmatov Toshmat"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="example@mail.com"
            />
          </div>
          <div>
            <label htmlFor="register-phone" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700"><Phone size={16} className="text-primary" /> Telefon raqami</label>
            <div className="flex h-12 overflow-hidden rounded-lg border border-gray-200 bg-white transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-700" aria-hidden="true">+998</span>
              <input
                id="register-phone"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition-colors hover:text-primary focus-visible:outline-none"
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parolni tasdiqlang</label>
            <div className="relative">
              <input
                type={showConfirmation ? 'text' : 'password'}
                className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmation((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition-colors hover:text-primary focus-visible:outline-none"
                aria-label={showConfirmation ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                aria-pressed={showConfirmation}
              >
                {showConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-2 py-2">
            <input type="checkbox" className="mt-1 accent-primary" id="terms" />
            <label htmlFor="terms" className="text-xs text-gray-600">
              Men <Link href="#" className="text-primary hover:underline">Foydalanish shartlari</Link> va <Link href="#" className="text-primary hover:underline">Maxfiylik siyosati</Link>ga roziman.
            </label>
          </div>
          
          <button 
            type="submit" 
            className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-sm hover:bg-opacity-95 active:scale-[0.98] transition-all"
          >
            Ro&apos;yxatdan o&apos;tish
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Hisobingiz bormi?{' '}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">
              Tizimga kiring
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

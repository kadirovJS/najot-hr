import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
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
          <h2 className="text-2xl font-bold text-dark">Ro'yxatdan o'tish</h2>
          <p className="text-gray-500 mt-2 text-sm">Najot Ta'lim jamoasiga qo'shilish uchun ma'lumotlaringizni kiriting</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">F.I.SH (To'liq)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
            <input 
              type="password" 
              className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parolni tasdiqlang</label>
            <input 
              type="password" 
              className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
            />
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
            Ro'yxatdan o'tish
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

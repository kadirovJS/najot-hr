import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
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
          <h2 className="text-2xl font-bold text-dark">Tizimga kirish</h2>
          <p className="text-gray-500 mt-2 text-sm">HR tizimidan foydalanish uchun hisobingizga kiring</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="example@mail.com"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Parol</label>
              <Link href="#" className="text-sm text-primary hover:underline">Parolni unutdingizmi?</Link>
            </div>
            <input 
              type="password" 
              className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-sm hover:bg-opacity-95 active:scale-[0.98] transition-all mt-2"
          >
            Kirish
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Hisobingiz yo'qmi?{' '}
            <Link href="/auth/register" className="font-bold text-primary hover:underline">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

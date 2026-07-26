'use client';

import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { userService } from '@/services/userService';
import { IUser, UserFormData, UserDepartment, UserRole } from '@/types/user';

const departments: UserDepartment[] = ['Support teacher', 'Main teacher', 'Management', 'Sales', 'Boshqaruv', 'Other'];
const PHONE_PREFIX = '+998';

const formatUzbekPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const subscriberNumber = digits.startsWith('998') ? digits.slice(3) : digits;
  return `${PHONE_PREFIX}${subscriberNumber.slice(0, 9)}`;
};

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    phone: PHONE_PREFIX,
    password: '',
    department: 'Support teacher',
    role: 'TEACHER'
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers(page, debouncedSearch);
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, debouncedSearch]);

  const handleOpenForm = (user?: IUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        phone: formatUzbekPhoneInput(user.phone),
        department: user.department,
        role: user.role,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        phone: PHONE_PREFIX,
        password: '',
        department: 'Support teacher',
        role: 'TEACHER'
      });
    }
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const phone = formData.phone.replace(/\D/g, '');
      if (!/^998\d{9}$/.test(phone)) {
        throw new Error('Telefon raqamini +998 XX XXX XX XX formatida kiriting');
      }
      const userData = { ...formData, phone };
      if (editingUser) {
        await userService.updateUser(editingUser._id, userData);
      } else {
        await userService.createUser(userData);
      }
      setIsFormModalOpen(false);
      loadUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: IUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await userService.updateUser(user._id, { status: newStatus });
      loadUsers();
    } catch (error) {
      alert("Xatolik yuz berdi");
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(userToDelete);
      setIsDeleteModalOpen(false);
      loadUsers();
    } catch (error) {
      alert("O'chirishda xatolik");
    } finally {
      setActionLoading(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">Xodimlar boshqaruvi</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Jamoani shakllantirish va nazorat qilish</p>
        </div>
        <Button className="w-full md:w-auto h-11 px-8 rounded-lg text-sm" icon={<UserPlus className="h-4 w-4" />} onClick={() => handleOpenForm()}>
          Yangi xodim
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-1.5 rounded-xl border border-gray-200 flex items-center px-4 gap-3 shadow-sm focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Ism yoki telefon raqami bo'yicha qidirish..."
          className="flex-grow min-w-0 h-10 bg-transparent outline-none text-sm text-dark font-medium placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Xodim</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bo'lim</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Holat</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                    <p className="text-sm text-gray-400 mt-4 font-medium">Ma'lumotlar yuklanmoqda...</p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold border border-primary/10 shadow-sm text-sm uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-dark text-sm">{user.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">+{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded border border-gray-200 uppercase tracking-tight">
                        {user.department}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${user.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" 
                          onClick={() => handleOpenForm(user)}
                          title="Tahrirlash"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          className={`p-1.5 rounded-lg transition-all ${user.status === 'ACTIVE' ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'ACTIVE' ? 'Bloklash' : 'Faollashtirish'}
                        >
                          {user.status === 'ACTIVE' ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        </button>
                        <button 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          onClick={() => handleDeleteClick(user._id)}
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Xodimlar topilmadi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="px-6 py-20 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
              <p className="text-sm text-gray-400 mt-4 font-medium">Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold border border-primary/10 shadow-sm text-sm uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-dark truncate text-sm">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">+{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {user.role}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className={`text-[8px] font-bold tracking-wider uppercase ${user.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight truncate">{user.department}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      className="p-2 text-gray-400 active:text-primary transition-colors" 
                      onClick={() => handleOpenForm(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      className={`p-2 transition-colors ${user.status === 'ACTIVE' ? 'text-gray-400 active:text-orange-500' : 'text-gray-400 active:text-emerald-500'}`}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === 'ACTIVE' ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </button>
                    <button 
                      className="p-2 text-gray-400 active:text-red-600 transition-colors" 
                      onClick={() => handleDeleteClick(user._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Xodimlar topilmadi</div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 md:px-8 py-4 md:py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sahifa {page} / {totalPages}</p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="h-9 flex-1 sm:flex-none px-4 text-xs rounded-lg" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:mr-1.5" /> 
              <span>Oldingi</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-9 flex-1 sm:flex-none px-4 text-xs rounded-lg" 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
            >
              <span>Keyingi</span>
              <ChevronRight className="h-3.5 w-3.5 sm:ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={editingUser ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Ism Familiya</label>
              <input 
                required
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark text-sm"
                placeholder="Eshmat Toshmatov"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Telefon raqami</label>
              <input 
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark text-sm"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: formatUzbekPhoneInput(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              {editingUser ? 'Yangi parol (ixtiyoriy)' : 'Parol'}
            </label>
            <input 
              required={!editingUser}
              type="password"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bo'lim</label>
              <div className="relative">
                <select 
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark appearance-none text-sm cursor-pointer"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value as UserDepartment})}
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Rol</label>
              <div className="relative">
                <select 
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary/50 outline-none transition-all font-semibold text-dark appearance-none text-sm cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value="TEACHER">TEACHER</option>
                  <option value="HR">HR</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-14 text-base rounded-xl font-bold" isLoading={actionLoading}>
              {editingUser ? 'Saqlash' : 'Xodimni qo\'shish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="O'chirishni tasdiqlaysizmi?"
        description="Ushbu xodim tizimdan butunlay o'chirib tashlanadi. Ushbu amalni ortga qaytarib bo'lmaydi."
        isLoading={actionLoading}
      />
    </div>
  );
}

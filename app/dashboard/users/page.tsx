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
    phone: '',
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
        phone: user.phone,
        department: user.department,
        role: user.role,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        phone: '',
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
      if (editingUser) {
        await userService.updateUser(editingUser._id, formData);
      } else {
        await userService.createUser(formData);
      }
      setIsFormModalOpen(false);
      loadUsers();
    } catch (error) {
      alert("Xatolik yuz berdi");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Xodimlar boshqaruvi</h1>
          <p className="text-gray-500 text-sm italic">Jamoani shakllantirish va nazorat qilish</p>
        </div>
        <Button icon={<UserPlus className="h-5 w-5" />} onClick={() => handleOpenForm()}>
          Yangi xodim
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 flex items-center px-4 gap-4 shadow-sm focus-within:border-primary transition-all">
        <Search className="h-5 w-5 text-gray-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Qidirish..."
          className="flex-grow min-w-0 h-12 bg-transparent outline-none text-sm text-dark"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Xodim</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Bo'lim</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Holat</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                    <p className="text-sm text-gray-400 mt-4">Ma'lumotlar yuklanmoqda...</p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black border border-primary/10">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-dark">{user.name}</p>
                          <p className="text-xs text-gray-400 font-medium">+{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                        {user.department}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-black tracking-wider uppercase ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          className="h-9 w-9 p-0 hover:bg-emerald-50" 
                          icon={<Edit2 className="h-4 w-4 text-emerald-600" />}
                          onClick={() => handleOpenForm(user)}
                        />
                        <Button 
                          variant="ghost" 
                          className="h-9 w-9 p-0 hover:bg-orange-50" 
                          icon={user.status === 'ACTIVE' 
                            ? <ShieldAlert className="h-4 w-4 text-orange-500" /> 
                            : <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          }
                          onClick={() => handleToggleStatus(user)}
                        />
                        <Button 
                          variant="ghost" 
                          className="h-9 w-9 p-0 hover:bg-red-50" 
                          icon={<Trash2 className="h-4 w-4 text-red-500" />}
                          onClick={() => handleDeleteClick(user._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">Xodimlar topilmadi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading ? (
            <div className="px-6 py-20 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
              <p className="text-sm text-gray-400 mt-4">Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black border border-primary/10">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-dark truncate text-sm">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium truncate">+{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black tracking-wider uppercase ${user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                      {user.role}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-[8px] font-black tracking-wider uppercase ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl border border-gray-100 gap-2">
                  <span className="text-[10px] font-bold text-gray-500 truncate">{user.department}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button 
                      variant="ghost" 
                      className="h-9 w-9 p-0 bg-white shadow-sm border border-gray-100" 
                      icon={<Edit2 className="h-4 w-4 text-emerald-600" />}
                      onClick={() => handleOpenForm(user)}
                    />
                    <Button 
                      variant="ghost" 
                      className="h-9 w-9 p-0 bg-white shadow-sm border border-gray-100" 
                      icon={user.status === 'ACTIVE' 
                        ? <ShieldAlert className="h-4 w-4 text-orange-500" /> 
                        : <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      }
                      onClick={() => handleToggleStatus(user)}
                    />
                    <Button 
                      variant="ghost" 
                      className="h-9 w-9 p-0 bg-white shadow-sm border border-gray-100" 
                      icon={<Trash2 className="h-4 w-4 text-red-500" />}
                      onClick={() => handleDeleteClick(user._id)}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-20 text-center text-gray-400 font-medium">Xodimlar topilmadi</div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 md:px-8 py-4 md:py-6 bg-gray-50/30 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sahifa {page} / {totalPages}</p>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="h-10 flex-1 sm:flex-none px-3 md:px-4 text-sm" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 sm:mr-2" /> 
              <span className="hidden sm:inline">Oldingi</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-10 flex-1 sm:flex-none px-3 md:px-4 text-sm" 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
            >
              <span className="hidden sm:inline">Keyingi</span>
              <ChevronRight className="h-4 w-4 sm:ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={editingUser ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ism Familiya</label>
              <input 
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-dark"
                placeholder="Eshmat Toshmatov"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Telefon</label>
              <input 
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-dark"
                placeholder="998901234567"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {editingUser ? 'Yangi parol (ixtiyoriy)' : 'Parol'}
            </label>
            <input 
              required={!editingUser}
              type="password"
              className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium text-dark"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bo'lim</label>
              <select 
                className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium appearance-none text-dark"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value as UserDepartment})}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Rol</label>
              <select 
                className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium appearance-none text-dark"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
              >
                <option value="TEACHER">TEACHER</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={actionLoading}>
            {editingUser ? 'Saqlash' : 'Xodimni qo\'shish'}
          </Button>
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

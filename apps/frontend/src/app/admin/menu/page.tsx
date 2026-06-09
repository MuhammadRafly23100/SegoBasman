'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function AdminMenuPage() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const queryClient = useQueryClient();

  const { data: menus = [] } = useQuery({
    queryKey: ['menus-admin'],
    queryFn: () => apiClient.get(API_ENDPOINTS.MENU.BASE).then(r => r.data),
  });

  const { data: kategoriList = [] } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => apiClient.get(API_ENDPOINTS.KATEGORI.BASE).then(r => r.data),
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, availability }: { id: string; availability: string }) =>
      apiClient.patch(API_ENDPOINTS.MENU.AVAILABILITY(id), { availability }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus-admin'] });
      toast.success('Status menu diperbarui');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ENDPOINTS.MENU.BY_ID(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus-admin'] });
      toast.success('Menu dihapus');
    },
  });

  // Ambil daftar unique kategori dari menu yang ada
  const categories = ['Semua', ...Array.from(new Set(menus.map((m: any) => m.kategori?.nama || 'Lainnya')))] as string[];

  // Filter menu berdasarkan kategori aktif
  const filteredMenus = selectedCategory === 'Semua' 
    ? menus 
    : menus.filter((m: any) => (m.kategori?.nama || 'Lainnya') === selectedCategory);

  const menuByKategori = filteredMenus.reduce((acc: any, menu: any) => {
    const nama = menu.kategori?.nama || 'Lainnya';
    if (!acc[nama]) acc[nama] = [];
    acc[nama].push(menu);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manajemen Menu</h1>
        <button
          onClick={() => { setEditData(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Tambah Menu
        </button>
      </div>

      {/* Filter Kategori (Pills) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {Object.entries(menuByKategori).map(([kategori, items]: any) => (
        <div key={kategori} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">{kategori}</h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            {items.map((menu: any) => (
              <div key={menu.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  {menu.gambar ? (
                    <img src={menu.gambar} alt={menu.nama} loading="lazy" className="h-14 w-14 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-300 flex-shrink-0">No img</div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{menu.nama}</p>
                    <p className="text-sm text-red-600 font-medium">{formatRupiah(Number(menu.harga))}</p>
                    {menu.deskripsi && <p className="text-xs text-gray-400 mt-0.5">{menu.deskripsi}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability.mutate({
                      id: menu.id,
                      availability: menu.availability === 'TERSEDIA' ? 'HABIS' : 'TERSEDIA',
                    })}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      menu.availability === 'TERSEDIA'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {menu.availability === 'TERSEDIA' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    {menu.availability === 'TERSEDIA' ? 'Tersedia' : 'Habis'}
                  </button>
                  <button
                    onClick={() => { setEditData(menu); setShowForm(true); }}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Hapus menu ini?')) deleteMutation.mutate(menu.id); }}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showForm && (
        <MenuForm
          editData={editData}
          kategoriList={kategoriList}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['menus-admin'] });
          }}
        />
      )}
    </div>
  );
}

function MenuForm({ editData, kategoriList, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    nama: editData?.nama || '',
    deskripsi: editData?.deskripsi || '',
    harga: editData?.harga ? String(Number(editData.harga)) : '',
    kategoriId: editData?.kategoriId || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Preview: file yang baru dipilih, atau gambar lama dari server
  const [preview, setPreview] = useState<string | null>(editData?.gambar || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // 1) Simpan data menu (create/update) untuk mendapatkan id
      const res = editData
        ? await apiClient.patch(API_ENDPOINTS.MENU.BY_ID(editData.id), data)
        : await apiClient.post(API_ENDPOINTS.MENU.BASE, data);
      // 2) Bila ada gambar baru, unggah byte-nya ke DB
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        await apiClient.post(API_ENDPOINTS.MENU.IMAGE(res.data.id), fd);
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success(editData ? 'Menu diperbarui' : 'Menu ditambahkan');
      onSuccess();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menyimpan menu'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.harga || !form.kategoriId) {
      toast.error('Nama, harga, dan kategori wajib diisi');
      return;
    }
    mutation.mutate({ ...form, harga: Number(form.harga) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{editData ? 'Edit Menu' : 'Tambah Menu'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
            <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
            <input type="number" value={form.harga} onChange={e => setForm(p => ({ ...p, harga: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select value={form.kategoriId} onChange={e => setForm(p => ({ ...p, kategoriId: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required>
              <option value="">Pilih kategori</option>
              {kategoriList.map((k: any) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
            <textarea value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar (opsional, maks 5MB)</label>
            <div className="flex items-center gap-3">
              {preview ? (
                <img src={preview} alt="Preview" className="h-16 w-16 rounded-lg object-cover bg-gray-100 flex-shrink-0 border" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-300 flex-shrink-0 border">No img</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50">
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

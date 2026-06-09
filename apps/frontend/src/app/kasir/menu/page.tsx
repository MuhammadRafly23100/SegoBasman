'use client';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import toast from 'react-hot-toast';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function KasirMenuPage() {
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const { data: menus = [] } = useQuery({
    queryKey: ['menus-kasir-availability'],
    queryFn: () => apiClient.get(API_ENDPOINTS.MENU.BASE).then(r => r.data),
  });

  const categories = useMemo(() => {
    const cats = new Set<string>();
    menus.forEach((menu: any) => {
      if (menu.kategori?.nama) cats.add(menu.kategori.nama);
    });
    const sortedCats = Array.from(cats).sort();
    return ['Semua', ...sortedCats];
  }, [menus]);

  const filteredMenus = useMemo(() => {
    if (selectedCategory === 'Semua') return menus;
    return menus.filter((m: any) => m.kategori?.nama === selectedCategory);
  }, [menus, selectedCategory]);

  const toggleAvailability = useMutation({
    mutationFn: ({ id, availability }: { id: string; availability: string }) =>
      apiClient.patch(API_ENDPOINTS.MENU.AVAILABILITY(id), { availability }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus-kasir-availability'] });
      toast.success('Ketersediaan menu diperbarui');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal memperbarui ketersediaan menu');
    },
  });

  const menuByKategori = filteredMenus.reduce((acc: any, menu: any) => {
    const namaKategori = menu.kategori?.nama || 'Lainnya';
    if (!acc[namaKategori]) acc[namaKategori] = [];
    acc[namaKategori].push(menu);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Ketersediaan Menu</h1>
        <p className="text-sm text-gray-500 mt-1">Kasir hanya dapat mengubah status tersedia/habis.</p>
      </div>

      {/* Kategori Filter */}
      <div className="mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2">
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#d92a2a] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
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
                  </div>
                </div>

                <button
                  onClick={() =>
                    toggleAvailability.mutate({
                      id: menu.id,
                      availability: menu.availability === 'TERSEDIA' ? 'HABIS' : 'TERSEDIA',
                    })
                  }
                  disabled={toggleAvailability.isPending}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    menu.availability === 'TERSEDIA'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {menu.availability === 'TERSEDIA' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {menu.availability === 'TERSEDIA' ? 'Tersedia' : 'Habis'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import toast from 'react-hot-toast';
import { Plus, Minus, Trash2, Printer, ShoppingCart, X } from 'lucide-react';

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

interface CartItem {
  menuId: string;
  nama: string;
  harga: number;
  quantity: number;
}

export default function TransaksiPage() {
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [receipt, setReceipt] = useState<any>(null);
  // Mengontrol bottom sheet "Detail Pesanan" pada tablet (di desktop selalu tampil sebagai side panel)
  const [panelOpen, setPanelOpen] = useState(true);
  const queryClient = useQueryClient();

  const { data: menus = [] } = useQuery({
    queryKey: ['menus-kasir'],
    queryFn: () => apiClient.get(API_ENDPOINTS.MENU.BASE).then(r => r.data),
  });

  const { data: kategoriList = [] } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => apiClient.get(API_ENDPOINTS.KATEGORI.BASE).then(r => r.data),
  });

  const createOrder = useMutation({
    mutationFn: (data: any) => apiClient.post(API_ENDPOINTS.ORDER.BASE, data),
    onSuccess: async (res) => {
      const orderId = res.data.id;
      const receiptRes = await apiClient.get(API_ENDPOINTS.ORDER.RECEIPT(orderId));
      setReceipt(receiptRes.data);
      setCart([]);
      setNamaPelanggan('');
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      toast.success(`Pesanan #${res.data.nomorAntrian} berhasil dibuat!`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    },
  });

  const addToCart = (menu: any) => {
    if (menu.availability === 'HABIS') return;
    setPanelOpen(true); // buka kembali bottom sheet di tablet saat menambah item
    setCart(prev => {
      const existing = prev.find(i => i.menuId === menu.id);
      if (existing) return prev.map(i => i.menuId === menu.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuId: menu.id, nama: menu.nama, harga: Number(menu.harga), quantity: 1 }];
    });
  };

  const updateQty = (menuId: string, delta: number) => {
    setCart(prev => prev
      .map(i => i.menuId === menuId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.harga * i.quantity, 0);

  const handleSubmit = () => {
    if (!namaPelanggan.trim() || namaPelanggan.length < 2) {
      toast.error('Nama pelanggan wajib diisi (minimal 2 karakter)');
      return;
    }
    if (cart.length === 0) {
      toast.error('Pilih minimal 1 menu');
      return;
    }
    createOrder.mutate({
      namaPelanggan: namaPelanggan.trim(),
      items: cart.map(i => ({ menuId: i.menuId, quantity: i.quantity })),
    });
  };

  const filteredMenus = selectedKategori === 'all'
    ? menus
    : menus.filter((m: any) => m.kategoriId === selectedKategori);

  if (receipt) {
    return <ReceiptView receipt={receipt} onClose={() => setReceipt(null)} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Input Transaksi</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Menu grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter kategori */}
          <div className="bg-white border-b px-4 py-3 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedKategori('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedKategori === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Semua
            </button>
            {kategoriList.map((k: any) => (
              <button
                key={k.id}
                onClick={() => setSelectedKategori(k.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedKategori === k.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {k.nama}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4 pb-24">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMenus.map((menu: any) => {
                const qtyInCart = cart.find(i => i.menuId === menu.id)?.quantity || 0;
                return (
                  <button
                    key={menu.id}
                    onClick={() => addToCart(menu)}
                    disabled={menu.availability === 'HABIS'}
                    className={`relative rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden flex flex-col ${
                      menu.availability === 'HABIS'
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : qtyInCart > 0
                          ? 'border-red-500 bg-red-50/30 shadow-md ring-2 ring-red-500/20'
                          : 'border-gray-200 bg-white hover:border-red-300 hover:shadow active:scale-[0.98]'
                    }`}
                  >
                    {qtyInCart > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-md z-10 animate-in zoom-in">
                        {qtyInCart}
                      </div>
                    )}
                    {menu.gambar ? (
                      <img
                        src={menu.gambar}
                        alt={menu.nama}
                        loading="lazy"
                        className="w-full h-40 shrink-0 object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-full h-40 shrink-0 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                        Tanpa Gambar
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between min-h-[88px]">
                      <p className="font-bold text-gray-900 text-base leading-tight pr-4">{menu.nama}</p>
                      <div>
                        <p className="text-red-700 font-extrabold mt-2 text-lg">{formatRupiah(Number(menu.harga))}</p>
                        {menu.availability === 'HABIS' && (
                          <span className="inline-block mt-1 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-bold">HABIS</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cart Panel - Side panel (desktop) / Bottom sheet (tablet) */}
        {cart.length > 0 && (
          <>
            {/* Backdrop gelap di belakang bottom sheet - tablet/mobile saja */}
            {panelOpen && (
              <div
                onClick={() => setPanelOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
              />
            )}

            {/* Tombol mengambang untuk membuka kembali sheet - tablet/mobile saja */}
            {!panelOpen && (
              <button
                onClick={() => setPanelOpen(true)}
                className="lg:hidden fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-red-600 text-white font-bold px-5 py-3 rounded-full shadow-xl shadow-red-300 active:scale-95 transition-transform"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{cart.reduce((s, i) => s + i.quantity, 0)} item</span>
              </button>
            )}

          <div
            className={`bg-white shadow-2xl flex flex-col
              fixed bottom-0 left-0 right-0 z-50 h-[50vh] w-full rounded-t-2xl
              transition-transform duration-300 ease-out
              ${panelOpen ? 'translate-y-0' : 'translate-y-full'}
              lg:static lg:h-auto lg:w-[400px] lg:rounded-none lg:translate-y-0 lg:z-10 lg:border-l lg:transition-none`}
          >
            {/* Drag handle indikator - tablet/mobile saja */}
            <div className="lg:hidden pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>

            <div className="p-5 border-b bg-gray-50 shrink-0 relative">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-6 w-6 text-red-600" />
                <h2 className="font-bold text-gray-900 text-lg">Detail Pesanan</h2>
              </div>
              {/* Tombol tutup (X) - tablet/mobile saja */}
              <button
                onClick={() => setPanelOpen(false)}
                aria-label="Tutup"
                className="lg:hidden absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <input
                value={namaPelanggan}
                onChange={e => setNamaPelanggan(e.target.value)}
                placeholder="Nama pelanggan (wajib)"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-4">
              {cart.map(item => (
                <div key={item.menuId} className="flex flex-col gap-3 p-4 border border-gray-100 rounded-xl shadow-sm bg-white">
                  <div className="flex justify-between items-start">
                    <p className="text-base font-bold text-gray-900 truncate pr-2">{item.nama}</p>
                    <p className="text-sm font-bold text-red-600">{formatRupiah(item.harga * item.quantity)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500">{formatRupiah(item.harga)} / item</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQty(item.menuId, -1)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors">
                        <Minus className="h-5 w-5 text-gray-700" />
                      </button>
                      <span className="w-8 text-center text-lg font-bold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.menuId, 1)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 active:bg-red-300 transition-colors">
                        <Plus className="h-5 w-5 text-red-700" />
                      </button>
                      <button onClick={() => setCart(prev => prev.filter(i => i.menuId !== item.menuId))} className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 ml-2 group transition-colors">
                        <Trash2 className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t bg-gray-50 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-600 text-lg">Total Pembayaran</span>
                <span className="font-black text-red-600 text-2xl">{formatRupiah(total)}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={createOrder.isPending}
                className="w-full min-h-[56px] text-lg bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
              >
                {createOrder.isPending ? 'Memproses...' : 'Buat Pesanan & Cetak Struk'}
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReceiptView({ receipt, onClose }: { receipt: any; onClose: () => void }) {
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm" id="receipt">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">Sego Pedes Basman</h1>
          <p className="text-gray-500 text-sm">{new Date(receipt.createdAt).toLocaleString('id-ID')}</p>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">Nomor Antrian</p>
          <p className="text-6xl font-black text-red-600">{receipt.nomorAntrian}</p>
          <p className="text-xl font-bold mt-1">{receipt.namaPelanggan}</p>
        </div>

        <div className="border-t border-dashed pt-4 mb-4 space-y-2">
          {receipt.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.nama} x{item.quantity}</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-red-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(receipt.totalHarga)}
          </span>
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">Kasir: {receipt.kasir}</p>
        <p className="text-center text-gray-400 text-xs mt-1">Terima kasih!</p>

        <div className="mt-6 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700"
          >
            <Printer className="h-4 w-4" />
            Cetak Struk
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50"
          >
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
}

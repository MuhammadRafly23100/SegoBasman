'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import { BarChart2, TrendingUp, ShoppingBag, XCircle, Download, Loader2 } from 'lucide-react';

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function AdminLaporanPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', period, date],
    queryFn: () => apiClient.get(`${API_ENDPOINTS.REPORT.SALES}?period=${period}&date=${date}`).then(r => r.data),
  });

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.REPORT.SALES_PDF, {
        params: { period, date },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const periodLabel = period === 'weekly' ? 'mingguan' : period === 'monthly' ? 'bulanan' : 'harian';
      link.href = url;
      link.download = `laporan-${periodLabel}-${date.replace(/-/g, '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Laporan berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengunduh laporan');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Laporan Penjualan</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading || isLoading || !report}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengunduh...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Memuat data...</div>
      ) : report ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Pesanan"
              value={report.totalOrders}
              icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
              color="blue"
            />
            <StatCard
              label="Selesai"
              value={report.completedOrders}
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
              color="green"
            />
            <StatCard
              label="Dibatalkan"
              value={report.cancelledOrders}
              icon={<XCircle className="h-5 w-5 text-red-600" />}
              color="red"
            />
            <StatCard
              label="Total Pendapatan"
              value={formatRupiah(report.totalRevenue)}
              icon={<BarChart2 className="h-5 w-5 text-yellow-600" />}
              color="yellow"
              isText
            />
          </div>

          {/* Top Menu */}
          {report.topMenus?.length > 0 && (
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-900 mb-4">Menu Terlaris</h2>
              <div className="space-y-3">
                {report.topMenus.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-red-100 text-red-700 text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-900">{item.nama}</span>
                    </div>
                    <span className="text-sm text-gray-500">{item.terjual} terjual</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, icon, color, isText }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
  };
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorMap[color]} mb-3`}>{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`font-bold mt-1 ${isText ? 'text-lg' : 'text-2xl'} text-gray-900`}>{value}</p>
    </div>
  );
}

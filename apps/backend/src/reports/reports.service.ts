import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSales(period: string, date?: string) {
    const baseDate = date ? new Date(date) : new Date();
    let start: Date;
    let end: Date;

    if (period === 'weekly') {
      start = startOfWeek(baseDate, { weekStartsOn: 1 });
      end = endOfWeek(baseDate, { weekStartsOn: 1 });
    } else if (period === 'monthly') {
      start = startOfMonth(baseDate);
      end = endOfMonth(baseDate);
    } else {
      start = startOfDay(baseDate);
      end = endOfDay(baseDate);
    }

    const [totalOrders, completedOrders, cancelledOrders, revenueData, topMenus] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
      this.prisma.order.count({ where: { status: OrderStatus.SELESAI, createdAt: { gte: start, lte: end } } }),
      this.prisma.order.count({ where: { status: OrderStatus.DIBATALKAN, createdAt: { gte: start, lte: end } } }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.SELESAI, createdAt: { gte: start, lte: end } },
        _sum: { totalHarga: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['menuId'],
        where: { order: { status: OrderStatus.SELESAI, createdAt: { gte: start, lte: end } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const topMenusWithNames = await Promise.all(
      topMenus.map(async (item) => {
        const menu = await this.prisma.menu.findUnique({ where: { id: item.menuId }, select: { nama: true } });
        return { nama: menu?.nama, terjual: item._sum.quantity };
      })
    );

    return {
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: Number(revenueData._sum.totalHarga ?? 0),
      topMenus: topMenusWithNames,
    };
  }

  async generateSalesPdf(period: string, date?: string): Promise<Buffer> {
    const data = await this.getSales(period, date);
    const periodLabel = period === 'weekly' ? 'Mingguan' : period === 'monthly' ? 'Bulanan' : 'Harian';
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const fmt = (d: Date) => format(d, 'dd MMMM yyyy', { locale: localeId });
    const rangeText = period === 'daily' ? fmt(start) : `${fmt(start)} — ${fmt(end)}`;
    const generatedAt = format(new Date(), "dd MMMM yyyy 'pukul' HH:mm", { locale: localeId });
    const rupiah = (n: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fillColor('#dc2626').fontSize(20).font('Helvetica-Bold').text('Sego Basman', { align: 'left' });
      doc.fillColor('#111827').fontSize(11).font('Helvetica').text('Laporan Penjualan', { align: 'left' });
      doc.moveDown(0.5);
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(13).text(`Periode ${periodLabel}`);
      doc.font('Helvetica').fontSize(11).fillColor('#374151').text(rangeText);
      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text('Ringkasan');
      doc.moveDown(0.5);

      const summary: Array<[string, string]> = [
        ['Total Pesanan', String(data.totalOrders)],
        ['Pesanan Selesai', String(data.completedOrders)],
        ['Pesanan Dibatalkan', String(data.cancelledOrders)],
        ['Total Pendapatan', rupiah(data.totalRevenue)],
      ];

      const labelX = 50;
      const valueX = 350;
      doc.fontSize(11);
      summary.forEach(([label, value]) => {
        const rowY = doc.y;
        doc.font('Helvetica').fillColor('#4b5563').text(label, labelX, rowY, { width: 280 });
        doc.font('Helvetica-Bold').fillColor('#111827').text(value, valueX, rowY, { width: 195, align: 'right' });
        doc.moveDown(0.6);
      });

      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text('Menu Terlaris');
      doc.moveDown(0.5);

      if (data.topMenus.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(11).fillColor('#9ca3af').text('Belum ada data menu terjual pada periode ini.');
      } else {
        doc.fontSize(11);
        data.topMenus.forEach((item, i) => {
          const rowY = doc.y;
          doc.font('Helvetica').fillColor('#4b5563').text(`${i + 1}. ${item.nama ?? '-'}`, labelX, rowY, { width: 360 });
          doc.font('Helvetica-Bold').fillColor('#111827').text(`${item.terjual ?? 0} terjual`, valueX, rowY, { width: 195, align: 'right' });
          doc.moveDown(0.5);
        });
      }

      doc.moveDown(2);
      doc.font('Helvetica-Oblique').fontSize(9).fillColor('#9ca3af').text(`Dicetak pada ${generatedAt}`, { align: 'right' });

      doc.end();
    });
  }
}

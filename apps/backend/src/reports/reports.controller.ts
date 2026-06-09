import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('report')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Laporan penjualan (daily/weekly/monthly)' })
  @ApiQuery({ name: 'period', enum: ['daily', 'weekly', 'monthly'], required: false })
  @ApiQuery({ name: 'date', required: false, example: '2026-04-08' })
  getSales(
    @Query('period') period: string = 'daily',
    @Query('date') date?: string,
  ) {
    return this.reportsService.getSales(period, date);
  }

  @Get('sales/pdf')
  @ApiOperation({ summary: 'Download laporan penjualan dalam bentuk PDF' })
  @ApiQuery({ name: 'period', enum: ['daily', 'weekly', 'monthly'], required: false })
  @ApiQuery({ name: 'date', required: false, example: '2026-04-08' })
  async downloadSalesPdf(
    @Query('period') period: string = 'daily',
    @Query('date') date: string | undefined,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.generateSalesPdf(period, date);
    const periodLabel = period === 'weekly' ? 'mingguan' : period === 'monthly' ? 'bulanan' : 'harian';
    const datePart = (date ?? new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    const filename = `laporan-${periodLabel}-${datePart}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);
  }
}

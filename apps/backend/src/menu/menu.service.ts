import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { AppGateway } from '../gateway/app.gateway';
import { MenuAvailability, Prisma } from '@prisma/client';
import { compressImage, COMPRESSED_MIME } from '../common/image.util';

// Field yang dikembalikan ke client. Sengaja TIDAK menyertakan gambarData
// (byte mentah) agar payload list menu tetap ringan — gambar diambil terpisah
// lewat endpoint GET /menu/:id/gambar.
const MENU_SELECT = {
  id: true,
  nama: true,
  deskripsi: true,
  harga: true,
  gambar: true,
  gambarMime: true,
  availability: true,
  kategoriId: true,
  kategori: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MenuSelect;

@Injectable()
export class MenuService {
  private readonly appUrl: string;

  constructor(
    private prisma: PrismaService,
    private appGateway: AppGateway,
    config: ConfigService,
  ) {
    this.appUrl = config.get('APP_URL', 'http://localhost:3001');
  }

  // Susun field `gambar` yang dipakai frontend: kalau ada gambar di DB,
  // kembalikan URL endpoint penyaji; kalau tidak, pakai URL eksternal (jika ada).
  private toResponse(menu: any) {
    const { gambarMime, gambar, ...rest } = menu;
    return {
      ...rest,
      gambar: gambarMime ? `${this.appUrl}/menu/${menu.id}/gambar` : (gambar ?? null),
    };
  }

  async findAll(kategoriId?: string) {
    const menus = await this.prisma.menu.findMany({
      where: { ...(kategoriId ? { kategoriId } : {}) },
      select: MENU_SELECT,
      orderBy: [{ kategori: { urutan: 'asc' } }, { nama: 'asc' }],
    });
    return menus.map((m) => this.toResponse(m));
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      select: MENU_SELECT,
    });
    if (!menu) throw new NotFoundException('Menu tidak ditemukan');
    return this.toResponse(menu);
  }

  async create(dto: CreateMenuDto) {
    const menu = await this.prisma.menu.create({
      data: dto,
      select: MENU_SELECT,
    });
    return this.toResponse(menu);
  }

  async update(id: string, dto: UpdateMenuDto) {
    await this.findOne(id);
    const menu = await this.prisma.menu.update({
      where: { id },
      data: dto,
      select: MENU_SELECT,
    });
    return this.toResponse(menu);
  }

  async updateAvailability(id: string, availability: MenuAvailability) {
    await this.findOne(id);
    const menu = await this.prisma.menu.update({
      where: { id },
      data: { availability },
      select: MENU_SELECT,
    });
    this.appGateway.emitMenuAvailabilityChanged(id, availability);
    return this.toResponse(menu);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menu.delete({ where: { id }, select: { id: true } });
  }

  // Kompres gambar yang diunggah admin lalu simpan byte-nya ke DB.
  async uploadImage(id: string, buffer: Buffer) {
    await this.findOne(id);
    let compressed: Buffer;
    try {
      compressed = await compressImage(buffer);
    } catch {
      throw new BadRequestException('File gambar tidak valid atau rusak');
    }
    const menu = await this.prisma.menu.update({
      where: { id },
      data: { gambarData: compressed, gambarMime: COMPRESSED_MIME, gambar: null },
      select: MENU_SELECT,
    });
    return this.toResponse(menu);
  }

  // Ambil byte gambar untuk disajikan oleh endpoint GET /menu/:id/gambar.
  async getImage(id: string): Promise<{ data: Buffer; mime: string }> {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      select: { gambarData: true, gambarMime: true },
    });
    if (!menu || !menu.gambarData || !menu.gambarMime) {
      throw new NotFoundException('Gambar tidak ditemukan');
    }
    return { data: Buffer.from(menu.gambarData), mime: menu.gambarMime };
  }
}

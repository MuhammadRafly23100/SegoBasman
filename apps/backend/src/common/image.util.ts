// sharp adalah modul CommonJS (module.exports = fungsi). Project ini tidak
// mengaktifkan esModuleInterop, jadi pakai import-equals agar binding-nya
// langsung ke fungsi sharp (bukan .default yang undefined).
import sharp = require('sharp');

// Semua gambar dikompres ke WebP — ukuran kecil, kualitas bagus, dukung
// transparansi, dan didukung semua browser modern.
export const COMPRESSED_MIME = 'image/webp';

/**
 * Kompres & resize gambar agar hemat ruang DB dan cepat dimuat.
 * - Auto-orient sesuai metadata EXIF (foto HP sering miring).
 * - Maksimal 800x800 px (rasio dijaga, tidak diperbesar).
 * - Output WebP kualitas 80.
 */
export async function compressImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

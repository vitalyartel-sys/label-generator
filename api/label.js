import { createCanvas } from 'canvas';
import QRCode from 'qrcode';

export default async function handler(req, res) {
  const { text = 'NO TEXT', qr = 'https://example.com' } = req.query;

  // Параметры этикетки: 58x39 мм ≈ 384x260 px при 203 DPI
  const width = 384;
  const height = 260;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Белый фон
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Повёрнутый текст слева (x=20, y=220)
  if (text) {
    ctx.save();
    ctx.translate(20, 220);
    ctx.rotate(-Math.PI / 2); // -90 градусов
    ctx.fillStyle = 'black';
    ctx.font = '32px Arial';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  // QR-код справа (x=160, y=40)
  if (qr) {
    const qrDataUrl = await QRCode.toDataURL(qr, { width: 180 });
    const img = new (await import('canvas')).Image();
    img.src = qrDataUrl;
    await new Promise((resolve) => (img.onload = resolve));
    ctx.drawImage(img, 160, 40);
  }

  // Отправка PNG
  const buffer = canvas.toBuffer('image/png');
  res.setHeader('Content-Type', 'image/png');
  res.end(buffer);
}
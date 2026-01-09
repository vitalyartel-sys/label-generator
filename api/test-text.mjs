// api/simple-label.mjs
import QRCode from 'qrcode';
import { PNG } from 'pngjs';

const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  QR_SIZE: 180
};

const FONT_8x8 = {
  'Т': [0xFF,0x18,0x18,0x18,0x18,0x18,0x18,0x00],
  'Е': [0xFF,0xC0,0xC0,0xFC,0xC0,0xC0,0xFF,0x00],
  'С': [0x3C,0x42,0x80,0x80,0x80,0x42,0x3C,0x00],
  // добавьте остальные символы
};

// Текст БЕЗ поворота - слева вертикально
function drawVerticalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  // Каждая буква рисуется под предыдущей
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    // Буква рисуется как столбец из 8 пикселей в ширину
    for (let col = 0; col < 8; col++) {
      const colData = glyph[col];
      
      for (let row = 0; row < 8; row++) {
        if (colData & (1 << (7 - row))) {
          // X - горизонталь (отступ слева)
          // Y - вертикаль (позиция буквы * 9 + строка)
          const x = startX + col;
          const y = startY + (i * 9) + row;
          
          if (x >= 0 && x < CONFIG.WIDTH && y >= 0 && y < CONFIG.HEIGHT) {
            const idx = (y * CONFIG.WIDTH + x) * 4;
            buffer[idx] = 0;
            buffer[idx+1] = 0;
            buffer[idx+2] = 0;
          }
        }
      }
    }
  }
}

export default async function handler(req, res) {
  try {
    const { text = 'ТЕСТ', qr = 'https://ya.ru' } = req.query;
    
    // Белый холст
    const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255; buffer[i+1] = 255; buffer[i+2] = 255; buffer[i+3] = 255;
    }
    
    // Красная рамка
    for (let x = 0; x < CONFIG.WIDTH; x++) {
      let idx = (0 * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255;
      idx = ((CONFIG.HEIGHT-1) * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255;
    }
    for (let y = 0; y < CONFIG.HEIGHT; y++) {
      let idx = (y * CONFIG.WIDTH + 0) * 4;
      buffer[idx] = 255;
      idx = (y * CONFIG.WIDTH + (CONFIG.WIDTH-1)) * 4;
      buffer[idx] = 255;
    }
    
    // Текст слева вертикально (без поворота координат)
    drawVerticalText(buffer, decodeURIComponent(text), 30, 20);
    
    // QR-код
    const qrBuffer = await QRCode.toBuffer(decodeURIComponent(qr), {
      width: CONFIG.QR_SIZE,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    const qrImage = PNG.sync.read(qrBuffer);
    const qrX = 40; // отступ справа
    const qrY = Math.floor((CONFIG.HEIGHT - CONFIG.QR_SIZE) / 2);
    
    for (let y = 0; y < CONFIG.QR_SIZE; y++) {
      for (let x = 0; x < CONFIG.QR_SIZE; x++) {
        const srcIdx = (y * CONFIG.QR_SIZE + x) * 4;
        const dstX = qrX + x;
        const dstY = qrY + y;
        
        if (dstX >= 0 && dstX < CONFIG.WIDTH && dstY >= 0 && dstY < CONFIG.HEIGHT) {
          const dstIdx = (dstY * CONFIG.WIDTH + dstX) * 4;
          if (qrImage.data[srcIdx] < 128) {
            buffer[dstIdx] = 0;
            buffer[dstIdx+1] = 0;
            buffer[dstIdx+2] = 0;
          }
        }
      }
    }
    
    const png = new PNG({ width: CONFIG.WIDTH, height: CONFIG.HEIGHT });
    png.data = Buffer.from(buffer);
    
    res.setHeader('Content-Type', 'image/png');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

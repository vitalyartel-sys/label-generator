import QRCode from 'qrcode';
import { PNG } from 'pngjs';

// Простейший шрифт 5x7 для кириллицы
const FONT = {
  'Т': [0x1F,0x04,0x04,0x04,0x04],
  'Е': [0x1F,0x15,0x15,0x15,0x11],
  'С': [0x0E,0x11,0x10,0x11,0x0E],
  '0': [0x0E,0x11,0x11,0x11,0x0E],
  '1': [0x04,0x0C,0x04,0x04,0x0E],
  'A': [0x0E,0x11,0x1F,0x11,0x11],
  'B': [0x1E,0x11,0x1E,0x11,0x1E]
};

// Рисует один символ
function drawChar(img, x, y, char) {
  const glyph = FONT[char] || FONT['A'];
  for (let col = 0; col < 5; col++) {
    const bits = glyph[col];
    for (let row = 0; row < 5; row++) {
      if (bits & (1 << row)) {
        const px = x + row;
        const py = y + (4 - col);
        if (px < 260 && py < 384) {
          const idx = (px * 384 + py) * 4;
          img[idx] = 0;     // R
          img[idx+1] = 0;   // G
          img[idx+2] = 0;   // B
          img[idx+3] = 255; // A
        }
      }
    }
  }
}

// Рисует вертикальный текст
function drawText(img, text, startX, startY) {
  let y = startY;
  for (const char of text.toUpperCase()) {
    drawChar(img, startX, y, char);
    y += 7; // 5px буква + 2px пробел
  }
}

export default async function handler(req, res) {
  try {
    // Параметры
    const text = decodeURIComponent(req.query.text || 'ТЕСТ');
    const qr = decodeURIComponent(req.query.qr || 'https://ya.ru');
    
    // Создаём белое изображение 384x260
    const width = 384;
    const height = 260;
    const img = new Uint8Array(width * height * 4);
    
    for (let i = 0; i < img.length; i += 4) {
      img[i] = 255;   // R
      img[i+1] = 255; // G
      img[i+2] = 255; // B
      img[i+3] = 255; // A
    }
    
    // 1. ТЕКСТ слева (вертикальный)
    console.log('Рисуем текст:', text);
    drawText(img, text, 30, 50);
    
    // 2. QR-код справа
    const qrSize = 180;
    const qrImage = await QRCode.toBuffer(qr, {
      width: qrSize,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    const qrPng = PNG.sync.read(qrImage);
    const qrX = 40; // отступ сверху
    const qrY = width - qrSize - 40; // отступ справа
    
    // Вставляем QR
    for (let y = 0; y < qrPng.height; y++) {
      for (let x = 0; x < qrPng.width; x++) {
        const srcIdx = (y * qrPng.width + x) * 4;
        const dstX = qrX + x;
        const dstY = qrY + y;
        
        if (dstX < height && dstY < width) {
          const dstIdx = (dstX * width + dstY) * 4;
          
          // Чёрные пиксели QR
          if (qrPng.data[srcIdx] < 128) {
            img[dstIdx] = 0;
            img[dstIdx+1] = 0;
            img[dstIdx+2] = 0;
            img[dstIdx+3] = 255;
          }
        }
      }
    }
    
    // 3. Добавляем отладочную рамку (красную)
    // Горизонтальные линии
    for (let x = 0; x < width; x++) {
      let idx = (0 * width + x) * 4;
      img[idx] = 255; img[idx+1] = 0; img[idx+2] = 0;
      idx = ((height-1) * width + x) * 4;
      img[idx] = 255; img[idx+1] = 0; img[idx+2] = 0;
    }
    // Вертикальные линии
    for (let y = 0; y < height; y++) {
      let idx = (y * width + 0) * 4;
      img[idx] = 255; img[idx+1] = 0; img[idx+2] = 0;
      idx = (y * width + (width-1)) * 4;
      img[idx] = 255; img[idx+1] = 0; img[idx+2] = 0;
    }
    
    // 4. Конвертируем в PNG
    const png = new PNG({ width, height });
    png.data = Buffer.from(img);
    
    // 5. Отправляем
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
}

import QRCode from 'qrcode';
import { PNG } from 'pngjs';

// ==================== 5x7 Bitmap Font ====================
const FONT_5X7 = {
  "A": [0x7C, 0x12, 0x11, 0x12, 0x7C],
  "B": [0x7F, 0x49, 0x49, 0x49, 0x36],
  // ... добавьте все нужные символы (кириллица важна!)
  // Для простоты демо - только латиница и цифры
};

// Простой латинский алфавит для демо
const simpleFont = {
  'A': [0x30,0x78,0xCC,0xCC,0xFC,0xCC,0xCC,0x00],
  'B': [0xFC,0x66,0x66,0x7C,0x66,0x66,0xFC,0x00],
  // ...
  '0': [0x7C,0xC6,0xCE,0xD6,0xE6,0xC6,0x7C,0x00],
  '1': [0x30,0x70,0x30,0x30,0x30,0x30,0xFC,0x00],
};

function drawRotatedText(buffer, width, text, startX, startY, color = [0, 0, 0]) {
  const chars = text.toUpperCase().split('');
  let xOffset = startX;
  
  for (const char of chars) {
    const glyph = simpleFont[char] || simpleFont['?'] || [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];
    
    // Рисуем глиф повёрнутым на 90° (каждый столбец -> строка)
    for (let col = 0; col < 8; col++) {
      const colByte = glyph[col] || 0;
      for (let row = 0; row < 8; row++) {
        if (colByte & (1 << (7 - row))) {
          const x = startX + col;
          const y = startY + row + xOffset;
          
          if (x >= 0 && x < 260 && y >= 0 && y < 384) {
            const idx = (x * width + y) * 4;
            buffer[idx] = color[0];     // R
            buffer[idx + 1] = color[1]; // G
            buffer[idx + 2] = color[2]; // B
            buffer[idx + 3] = 255;      // A
          }
        }
      }
    }
    xOffset += 10; // межбуквенный интервал
  }
}

function createPng(buffer, width, height) {
  const png = new PNG({ width, height });
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pngIdx = (y * width + x) * 4;
      
      png.data[pngIdx] = buffer[idx];       // R
      png.data[pngIdx + 1] = buffer[idx + 1]; // G
      png.data[pngIdx + 2] = buffer[idx + 2]; // B
      png.data[pngIdx + 3] = buffer[idx + 3]; // A
    }
  }
  
  return png;
}

export default async function handler(req, res) {
  try {
    const { text = 'TEST', qr = 'https://example.com' } = req.query;
    
    // Размер этикетки: 384x260 пикселей (58x39 мм @ 203 DPI)
    const width = 384;
    const height = 260;
    
    // Создаём белый холст (RGBA)
    const buffer = new Uint8Array(width * height * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;     // R
      buffer[i + 1] = 255; // G
      buffer[i + 2] = 255; // B
      buffer[i + 3] = 255; // A
    }
    
    // 1. Рисуем повёрнутый текст слева
    drawRotatedText(buffer, width, String(text), 20, 220, [0, 0, 0]);
    
    // 2. Генерируем QR-код
    const qrSize = 180;
    const qrDataUrl = await QRCode.toDataURL(String(qr), {
      width: qrSize,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Конвертируем DataURL в буфер
    const qrBase64 = qrDataUrl.split(',')[1];
    const qrBuffer = Buffer.from(qrBase64, 'base64');
    const qrImage = PNG.sync.read(qrBuffer);
    
    // 3. Вставляем QR-код справа (с поворотом если нужно)
    const qrX = 40;    // отступ сверху
    const qrY = 160;   // отступ слева
    
    for (let y = 0; y < qrImage.height; y++) {
      for (let x = 0; x < qrImage.width; x++) {
        const qrIdx = (y * qrImage.width + x) * 4;
        
        // Позиция в целевом изображении
        const dstX = qrX + y;
        const dstY = qrY + x;
        
        if (dstX < height && dstY < width) {
          const dstIdx = (dstX * width + dstY) * 4;
          
          // Копируем пиксель (только чёрные пиксели QR)
          if (qrImage.data[qrIdx] < 128) {
            buffer[dstIdx] = 0;     // R
            buffer[dstIdx + 1] = 0; // G
            buffer[dstIdx + 2] = 0; // B
            buffer[dstIdx + 3] = 255; // A
          }
        }
      }
    }
    
    // 4. Создаём PNG и отправляем
    const png = createPng(buffer, width, height);
    const pngBuffer = PNG.sync.write(png);
    
    // Настраиваем заголовки
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    // Отправляем изображение
    res.end(pngBuffer);
    
  } catch (error) {
    console.error('Error generating label:', error);
    res.status(500).json({ 
      error: 'Failed to generate label',
      message: error.message 
    });
  }
}

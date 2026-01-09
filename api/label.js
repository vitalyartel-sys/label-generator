import QRCode from 'qrcode';
import { PNG } from 'pngjs';

const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  QR_SIZE: 180,
  TEXT_OFFSET_X: 20,
  TEXT_OFFSET_Y: 30
};

// Шрифт 8x8
const FONT_8x8 = {
  'Т': [0xFF,0x18,0x18,0x18,0x18,0x18,0x18,0x00],
  'Е': [0xFF,0xC0,0xC0,0xFC,0xC0,0xC0,0xFF,0x00],
  'С': [0x3C,0x42,0x80,0x80,0x80,0x42,0x3C,0x00],
  'Х': [0x81,0x42,0x24,0x18,0x24,0x42,0x81,0x00],
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
};

// Текст БЕЗ поворота для теста
function drawText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  for (let letterIndex = 0; letterIndex < chars.length; letterIndex++) {
    const char = chars[letterIndex];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    // Рисуем символ 8x8
    for (let row = 0; row < 8; row++) {
      const rowData = glyph[row];
      
      for (let col = 0; col < 8; col++) {
        if (rowData & (1 << (7 - col))) {
          const x = startX + (letterIndex * 9) + col; // 9 = 8 + 1 пробел
          const y = startY + row;
          
          if (x >= 0 && x < CONFIG.WIDTH && y >= 0 && y < CONFIG.HEIGHT) {
            const idx = (y * CONFIG.WIDTH + x) * 4;
            buffer[idx] = 0;     // R
            buffer[idx + 1] = 0; // G
            buffer[idx + 2] = 0; // B
          }
        }
      }
    }
  }
}

export default async function handler(req, res) {
  try {
    // Получаем параметры
    const text = req.query.text || 'ТЕСТ';
    const qr = req.query.qr || 'https://ya.ru';
    
    const decodedText = decodeURIComponent(text);
    const decodedQR = decodeURIComponent(qr);
    
    console.log('Генерация этикетки:', { text: decodedText, qr: decodedQR });
    
    // Создаём белый холст
    const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;     // R
      buffer[i + 1] = 255; // G
      buffer[i + 2] = 255; // B
      buffer[i + 3] = 255; // A
    }
    
    // === 1. КРАСНАЯ РАМКА ДЛЯ ОТЛАДКИ ===
    for (let x = 0; x < CONFIG.WIDTH; x++) {
      // Верх
      let idx = (0 * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
      // Низ
      idx = ((CONFIG.HEIGHT-1) * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
    }
    for (let y = 0; y < CONFIG.HEIGHT; y++) {
      // Лево
      let idx = (y * CONFIG.WIDTH + 0) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
      // Право
      idx = (y * CONFIG.WIDTH + (CONFIG.WIDTH-1)) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
    }
    
    // === 2. ТЕКСТ СЛЕВА (просто, без поворота) ===
    console.log('Рисуем текст:', decodedText, 'по координатам (30, 50)');
    drawText(buffer, decodedText, 30, 50);
    
    // === 3. QR-КОД СПРАВА ===
    const qrBuffer = await QRCode.toBuffer(decodedQR, {
      width: CONFIG.QR_SIZE,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    const qrImage = PNG.sync.read(qrBuffer);
    
    // Позиция QR: справа, по центру вертикали
    const qrX = 40;  // отступ слева для QR
    const qrY = Math.floor((CONFIG.HEIGHT - CONFIG.QR_SIZE) / 2);
    
    console.log('QR позиция:', { qrX, qrY });
    
    for (let y = 0; y < CONFIG.QR_SIZE; y++) {
      for (let x = 0; x < CONFIG.QR_SIZE; x++) {
        const srcIdx = (y * CONFIG.QR_SIZE + x) * 4;
        const dstX = qrX + x;
        const dstY = qrY + y;
        
        if (dstX >= 0 && dstX < CONFIG.WIDTH && dstY >= 0 && dstY < CONFIG.HEIGHT) {
          const dstIdx = (dstY * CONFIG.WIDTH + dstX) * 4;
          
          // Копируем чёрные пиксели
          if (qrImage.data[srcIdx] < 128) {
            buffer[dstIdx] = 0;
            buffer[dstIdx+1] = 0;
            buffer[dstIdx+2] = 0;
          }
        }
      }
    }
    
    // === 4. СОЗДАЁМ PNG ===
    const png = new PNG({ width: CONFIG.WIDTH, height: CONFIG.HEIGHT });
    png.data = Buffer.from(buffer);
    
    // === 5. ОТПРАВЛЯЕМ ===
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('Изображение готово');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('Ошибка:', error);
    
    // Ошибка как JSON
    res.status(500).json({
      error: error.message,
      url: req.url,
      query: req.query
    });
  }
}

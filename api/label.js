const QRCode = require('qrcode');
const { PNG } = require('pngjs');

// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  TEXT_X: 50,
  TEXT_Y: 30,
  FONT_SIZE: 8,
  QR_SIZE: 150,
  QR_MARGIN: 40
};

// ==================== ПРОСТОЙ ШРИФТ 8x8 ====================
const FONT_8x8 = {
  'П': [0xFF,0x81,0x81,0x81,0x81,0x81,0x81,0x81],
  'Р': [0xFF,0x81,0x81,0xFF,0x80,0x80,0x80,0x80],
  'И': [0x81,0x83,0x85,0x89,0x91,0xA1,0xC1,0x81],
  'В': [0xFF,0x81,0x81,0xFF,0x81,0x81,0xFF,0x00],
  'Е': [0xFF,0x80,0x80,0xFC,0x80,0x80,0xFF,0x00],
  'Т': [0xFF,0x18,0x18,0x18,0x18,0x18,0x18,0x00],
  '1': [0x08,0x18,0x28,0x08,0x08,0x08,0x3E,0x00],
  '2': [0x3C,0x42,0x02,0x0C,0x30,0x40,0x7E,0x00],
  '3': [0x3C,0x42,0x02,0x1C,0x02,0x42,0x3C,0x00],
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
};

// ==================== ФУНКЦИИ ====================

/**
 * Рисует вертикальный текст шрифтом 8x8
 */
function drawVerticalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    if (!glyph) continue;
    
    // Каждая буква 8x8
    for (let col = 0; col < 8; col++) {
      const colData = glyph[col] || 0;
      
      for (let row = 0; row < 8; row++) {
        // Проверяем бит (7-row чтобы получить слева направо)
        if (colData & (1 << (7 - row))) {
          // ПОВОРОТ на 90°: row -> X, col -> Y
          const x = startX + row;
          const y = startY + (i * 9) + col; // 9 = 8 + 1 пробел
          
          if (x >= 0 && x < CONFIG.HEIGHT && y >= 0 && y < CONFIG.WIDTH) {
            const idx = (x * CONFIG.WIDTH + y) * 4;
            buffer[idx] = 0;     // R - чёрный
            buffer[idx + 1] = 0; // G
            buffer[idx + 2] = 0; // B
          }
        }
      }
    }
  }
}

/**
 * Рисует горизонтальный текст (для отладки)
 */
function drawHorizontalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    if (!glyph) continue;
    
    for (let row = 0; row < 8; row++) {
      const rowData = glyph[row] || 0;
      
      for (let col = 0; col < 8; col++) {
        if (rowData & (1 << (7 - col))) {
          const x = startX + (i * 9) + col;
          const y = startY + row;
          
          if (x >= 0 && x < CONFIG.WIDTH && y >= 0 && y < CONFIG.HEIGHT) {
            const idx = (y * CONFIG.WIDTH + x) * 4;
            buffer[idx] = 0;
            buffer[idx + 1] = 0;
            buffer[idx + 2] = 0;
          }
        }
      }
    }
  }
}

/**
 * Создаёт белый холст
 */
function createWhiteCanvas() {
  const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = 255;     // R
    buffer[i + 1] = 255; // G
    buffer[i + 2] = 255; // B
    buffer[i + 3] = 255; // A
  }
  return buffer;
}

// ==================== ОСНОВНОЙ КОД ====================

module.exports = async (req, res) => {
  console.log('🚀 Запуск генератора этикеток');
  
  try {
    // Параметры
    const text = req.query.text || 'ПРИВЕТ';
    const qr = req.query.qr || 'https://ya.ru';
    
    console.log('Параметры:', { text, qr });
    
    // 1. СОЗДАЁМ БЕЛЫЙ ХОЛСТ
    const buffer = createWhiteCanvas();
    
    // 2. КРАСНАЯ РАМКА
    for (let x = 0; x < CONFIG.WIDTH; x++) {
      let idx = (0 * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
      idx = ((CONFIG.HEIGHT-1) * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
    }
    for (let y = 0; y < CONFIG.HEIGHT; y++) {
      let idx = (y * CONFIG.WIDTH + 0) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
      idx = (y * CONFIG.WIDTH + (CONFIG.WIDTH-1)) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
    }
    
    // 3. ВЕРТИКАЛЬНЫЙ ТЕКСТ СЛЕВА
    drawVerticalText(buffer, text, CONFIG.TEXT_X, CONFIG.TEXT_Y);
    
    // 4. ГОРИЗОНТАЛЬНЫЙ ТЕКСТ ВНИЗУ (отладка)
    drawHorizontalText(buffer, text, 50, 200);
    
    // 5. QR-КОД
    try {
      console.log('Генерация QR...');
      const qrBuffer = await QRCode.toBuffer(qr, {
        width: CONFIG.QR_SIZE,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      const qrImage = PNG.sync.read(qrBuffer);
      const qrX = CONFIG.WIDTH - CONFIG.QR_SIZE - CONFIG.QR_MARGIN;
      const qrY = Math.floor((CONFIG.HEIGHT - CONFIG.QR_SIZE) / 2);
      
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
      
      console.log('QR готов');
      
    } catch (qrError) {
      console.error('Ошибка QR:', qrError.message);
      
      // Заглушка если QR не сгенерировался
      const qrX = CONFIG.WIDTH - CONFIG.QR_SIZE - CONFIG.QR_MARGIN;
      const qrY = Math.floor((CONFIG.HEIGHT - CONFIG.QR_SIZE) / 2);
      
      for (let y = qrY; y < qrY + CONFIG.QR_SIZE; y++) {
        for (let x = qrX; x < qrX + CONFIG.QR_SIZE; x++) {
          const idx = (y * CONFIG.WIDTH + x) * 4;
          buffer[idx] = 0;
          buffer[idx+1] = 0;
          buffer[idx+2] = 0;
        }
      }
    }
    
    // 6. СОЗДАЁМ PNG
    const png = new PNG({
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT
    });
    png.data = Buffer.from(buffer);
    
    // 7. ОТПРАВЛЯЕМ
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('✅ Этикетка готова');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('💥 Ошибка:', error);
    
    // Простая ошибка
    res.status(500).json({
      error: error.message,
      message: 'Ошибка генерации'
    });
  }
};

const { PNG } = require('pngjs');

const CONFIG = {
  WIDTH: 384,     // Ширина
  HEIGHT: 260,    // Высота
  TEXT_OFFSET_X: 30,  // Отступ слева для текста
  TEXT_OFFSET_Y: 50   // Отступ сверху для текста
};

// Шрифт 8x8 (основные буквы)
const FONT_8x8 = {
  'П': [0xFF,0x81,0x81,0x81,0x81,0x81,0x81,0x00],
  'Р': [0xFF,0x81,0x81,0xFF,0x80,0x80,0x80,0x00],
  'И': [0x81,0x83,0x85,0x89,0x91,0xA1,0xC1,0x00],
  'В': [0xFF,0x81,0x81,0xFF,0x81,0x81,0xFF,0x00],
  'Е': [0xFF,0xC0,0xC0,0xFC,0xC0,0xC0,0xFF,0x00],
  'Т': [0xFF,0x18,0x18,0x18,0x18,0x18,0x18,0x00],
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
};

/**
 * Рисуем текст СЛЕВА ВЕРТИКАЛЬНО (читается сверху вниз)
 * Без сложного поворота - просто рисуем буквы одна под другой
 */
function drawVerticalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  for (let letterIndex = 0; letterIndex < chars.length; letterIndex++) {
    const char = chars[letterIndex];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    // Каждая буква - 8x8 пикселей
    for (let row = 0; row < 8; row++) {          // строка в букве (0-7)
      const rowData = glyph[row];
      
      for (let col = 0; col < 8; col++) {        // колонка в букве (0-7)
        // Проверяем бит (справа налево: 7-col)
        if (rowData & (1 << (7 - col))) {
          // X - горизонтальная координата (отступ слева + колонка)
          // Y - вертикальная координата (отступ сверху + номер буквы*10 + строка)
          const x = startX + col;
          const y = startY + (letterIndex * 10) + row;
          
          if (x >= 0 && x < CONFIG.WIDTH && y >= 0 && y < CONFIG.HEIGHT) {
            const idx = (y * CONFIG.WIDTH + x) * 4;
            buffer[idx] = 0;     // R - чёрный
            buffer[idx + 1] = 0; // G
            buffer[idx + 2] = 0; // B
          }
        }
      }
    }
  }
}

module.exports = async (req, res) => {
  try {
    const text = req.query.text || 'ПРИВЕТ';
    console.log('Генерация этикетки:', text);
    
    // Создаём буфер для изображения
    const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
    
    // 1. БЕЛЫЙ ФОН
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;
      buffer[i+1] = 255;
      buffer[i+2] = 255;
      buffer[i+3] = 255;
    }
    
    // 2. КРАСНАЯ РАМКА (для ориентации)
    // Верхняя граница
    for (let x = 0; x < CONFIG.WIDTH; x++) {
      let idx = (0 * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
      // Нижняя граница
      idx = ((CONFIG.HEIGHT-1) * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
    }
    // Левая граница
    for (let y = 0; y < CONFIG.HEIGHT; y++) {
      let idx = (y * CONFIG.WIDTH + 0) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
      // Правая граница
      idx = (y * CONFIG.WIDTH + (CONFIG.WIDTH-1)) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
    }
    
    // 3. ТЕКСТ СЛЕВА (вертикальный, читается сверху вниз)
    console.log('Рисуем текст по координатам:', CONFIG.TEXT_OFFSET_X, CONFIG.TEXT_OFFSET_Y);
    drawVerticalText(buffer, text, CONFIG.TEXT_OFFSET_X, CONFIG.TEXT_OFFSET_Y);
    
    // 4. ОТЛАДОЧНЫЕ МЕТКИ
    // Синяя точка в начале текста
    const startIdx = (CONFIG.TEXT_OFFSET_Y * CONFIG.WIDTH + CONFIG.TEXT_OFFSET_X) * 4;
    buffer[startIdx] = 0; buffer[startIdx+1] = 0; buffer[startIdx+2] = 255;
    
    // Зелёная точка через 50px от начала текста
    const midIdx = ((CONFIG.TEXT_OFFSET_Y + 50) * CONFIG.WIDTH + CONFIG.TEXT_OFFSET_X) * 4;
    buffer[midIdx] = 0; buffer[midIdx+1] = 255; buffer[midIdx+2] = 0;
    
    // 5. ЧЁРНЫЙ КВАДРАТ СПРАВА (заглушка для QR)
    const qrSize = 150;
    const qrX = CONFIG.WIDTH - qrSize - 40;
    const qrY = Math.floor((CONFIG.HEIGHT - qrSize) / 2);
    
    for (let y = qrY; y < qrY + qrSize; y++) {
      for (let x = qrX; x < qrX + qrSize; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 0;
        buffer[idx+1] = 0;
        buffer[idx+2] = 0;
      }
    }
    
    // 6. БЕЛАЯ РАМКА ВНУТРИ QR (чтобы видеть квадрат)
    for (let y = qrY + 10; y < qrY + qrSize - 10; y++) {
      for (let x = qrX + 10; x < qrX + qrSize - 10; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 255;
        buffer[idx+1] = 255;
        buffer[idx+2] = 255;
      }
    }
    
    // 7. БУКВА "Q" в центре QR
    for (let y = qrY + 60; y < qrY + 90; y++) {
      for (let x = qrX + 60; x < qrX + 90; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 0;
        buffer[idx+1] = 0;
        buffer[idx+2] = 0;
      }
    }
    
    // 8. СОЗДАЁМ PNG
    const png = new PNG({
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT
    });
    png.data = Buffer.from(buffer);
    
    // 9. ОТПРАВЛЯЕМ
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({
      error: error.message,
      message: 'Ошибка генерации изображения'
    });
  }
};

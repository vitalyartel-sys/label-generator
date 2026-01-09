const { PNG } = require('pngjs');

const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  FONT_WIDTH: 4,    // 4 пикселя в ширину
  FONT_HEIGHT: 6,   // 6 пикселей в высоту
  LETTER_SPACING: 1,
  TEXT_OFFSET_X: 30,  // отступ слева
  TEXT_OFFSET_Y: 50   // отступ сверху
};

// Шрифт 4x6 (выше)

/**
 * Рисует текст ВЕРТИКАЛЬНО (повёрнутый на 90° по часовой стрелке)
 */
function drawVerticalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  for (let letterIndex = 0; letterIndex < chars.length; letterIndex++) {
    const char = chars[letterIndex];
    const glyph = FONT_4x6[char] || FONT_4x6['?'];
    
    // Каждая буква 4x6 пикселей
    for (let row = 0; row < CONFIG.FONT_HEIGHT; row++) {
      const rowData = glyph[row] || 0;
      
      for (let col = 0; col < CONFIG.FONT_WIDTH; col++) {
        // Проверяем бит (справа налево для 4-битных данных)
        if (rowData & (1 << (CONFIG.FONT_WIDTH - 1 - col))) {
          // ПОВОРОТ НА 90° ПО ЧАСОВОЙ СТРЕЛКЕ
          // row -> X координата (вертикаль)
          // col -> Y координата (горизонталь)
          const x = startX + row;
          const y = startY + letterIndex * (CONFIG.FONT_WIDTH + CONFIG.LETTER_SPACING) + col;
          
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
 * Рисует текст ГОРИЗОНТАЛЬНО (для теста)
 */
function drawHorizontalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = FONT_4x6[char] || FONT_4x6['?'];
    
    for (let row = 0; row < CONFIG.FONT_HEIGHT; row++) {
      const rowData = glyph[row] || 0;
      
      for (let col = 0; col < CONFIG.FONT_WIDTH; col++) {
        if (rowData & (1 << (CONFIG.FONT_WIDTH - 1 - col))) {
          const x = startX + i * (CONFIG.FONT_WIDTH + CONFIG.LETTER_SPACING) + col;
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

module.exports = async (req, res) => {
  try {
    const text = req.query.text || 'ПРИВЕТ';
    console.log('Генерация с шрифтом 4x6:', text);
    
    const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
    
    // 1. БЕЛЫЙ ФОН
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;
      buffer[i+1] = 255;
      buffer[i+2] = 255;
      buffer[i+3] = 255;
    }
    
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
    
    // 3. ВЕРТИКАЛЬНЫЙ ТЕКСТ СЛЕВА (основной)
    drawVerticalText(buffer, text, 50, 30);
    
    // 4. ГОРИЗОНТАЛЬНЫЙ ТЕКСТ ВНИЗУ (для сравнения)
    drawHorizontalText(buffer, text, 50, 200);
    
    // 5. QR-ЗАГЛУШКА СПРАВА
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
    
    // Белая рамка внутри QR
    for (let y = qrY + 10; y < qrY + qrSize - 10; y++) {
      for (let x = qrX + 10; x < qrX + qrSize - 10; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 255;
        buffer[idx+1] = 255;
        buffer[idx+2] = 255;
      }
    }
    
    // 6. СОЗДАЁМ PNG
    const png = new PNG({
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT
    });
    png.data = Buffer.from(buffer);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
};

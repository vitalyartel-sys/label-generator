const { PNG } = require('pngjs');

const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  FONT_WIDTH: 4,
  FONT_HEIGHT: 6,
  LETTER_SPACING: 1,
  TEXT_OFFSET_X: 50,
  TEXT_OFFSET_Y: 30
};

// ==================== ПОЛНЫЙ ШРИФТ 4x6 ====================
const FONT_4x6 = {
  // Русские буквы (основные)
  'А': [0x6, 0x9, 0x9, 0xF, 0x9, 0x9], // 0110 1001 1001 1111 1001 1001
  'Б': [0x7, 0x9, 0x7, 0x9, 0x9, 0x7],  // 0111 1001 0111 1001 1001 0111
  'В': [0x7, 0x9, 0x7, 0x9, 0x9, 0x7],  // 0111 1001 0111 1001 1001 0111
  'Г': [0xF, 0x8, 0x8, 0x8, 0x8, 0x8],  // 1111 1000 1000 1000 1000 1000
  'Д': [0x3, 0x5, 0x5, 0x5, 0x5, 0xF],  // 0011 0101 0101 0101 0101 1111
  'Е': [0xF, 0x8, 0xF, 0x8, 0x8, 0xF],  // 1111 1000 1111 1000 1000 1111
  'Ж': [0x9, 0x9, 0x6, 0x9, 0x9, 0x9],  // 1001 1001 0110 1001 1001 1001
  'З': [0x7, 0x8, 0x6, 0x8, 0x8, 0x7],  // 0111 1000 0110 1000 1000 0111
  'И': [0x9, 0x9, 0xB, 0xD, 0x9, 0x9],  // 1001 1001 1011 1101 1001 1001
  'Й': [0x9, 0x9, 0xB, 0xD, 0x9, 0x9],  // 1001 1001 1011 1101 1001 1001
  'К': [0x9, 0x9, 0x7, 0x9, 0x9, 0x9],  // 1001 1001 0111 1001 1001 1001
  'Л': [0x3, 0x5, 0x5, 0x5, 0x5, 0x5],  // 0011 0101 0101 0101 0101 0101
  'М': [0x9, 0xF, 0xF, 0x9, 0x9, 0x9],  // 1001 1111 1111 1001 1001 1001
  'Н': [0x9, 0x9, 0xF, 0x9, 0x9, 0x9],  // 1001 1001 1111 1001 1001 1001
  'О': [0x6, 0x9, 0x9, 0x9, 0x9, 0x6],  // 0110 1001 1001 1001 1001 0110
  'П': [0xF, 0x9, 0x9, 0x9, 0x9, 0x9],  // 1111 1001 1001 1001 1001 1001
  'Р': [0x7, 0x9, 0x9, 0x7, 0x1, 0x1],  // 0111 1001 1001 0111 0001 0001
  'С': [0x6, 0x9, 0x1, 0x1, 0x9, 0x6],  // 0110 1001 0001 0001 1001 0110
  'Т': [0xF, 0x4, 0x4, 0x4, 0x4, 0x4],  // 1111 0100 0100 0100 0100 0100
  'У': [0x9, 0x9, 0x9, 0x7, 0x1, 0x6],  // 1001 1001 1001 0111 0001 0110
  'Ф': [0x4, 0xE, 0xA, 0xA, 0xE, 0x4],  // 0100 1110 1010 1010 1110 0100
  'Х': [0x9, 0x9, 0x6, 0x6, 0x9, 0x9],  // 1001 1001 0110 0110 1001 1001
  'Ц': [0x9, 0x9, 0x9, 0x9, 0x9, 0xF],  // 1001 1001 1001 1001 1001 1111
  'Ч': [0x9, 0x9, 0x9, 0x7, 0x1, 0x1],  // 1001 1001 1001 0111 0001 0001
  'Ш': [0x9, 0x9, 0x9, 0x9, 0x9, 0xF],  // 1001 1001 1001 1001 1001 1111
  'Щ': [0x9, 0x9, 0x9, 0x9, 0xF, 0x1],  // 1001 1001 1001 1001 1111 0001
  'Ъ': [0x8, 0x8, 0xE, 0x9, 0x9, 0xE],  // 1000 1000 1110 1001 1001 1110
  'Ы': [0x9, 0x9, 0xF, 0x9, 0x9, 0xF],  // 1001 1001 1111 1001 1001 1111
  'Ь': [0x1, 0x1, 0x7, 0x9, 0x9, 0x7],  // 0001 0001 0111 1001 1001 0111
  'Э': [0x7, 0x8, 0x6, 0x8, 0x8, 0x7],  // 0111 1000 0110 1000 1000 0111
  'Ю': [0x9, 0xB, 0xF, 0xD, 0x9, 0x9],  // 1001 1011 1111 1101 1001 1001
  'Я': [0x7, 0x9, 0x9, 0x7, 0x5, 0x9],  // 0111 1001 1001 0111 0101 1001
  
  // Цифры
  '0': [0x6, 0x9, 0x9, 0x9, 0x9, 0x6],  // 0110 1001 1001 1001 1001 0110
  '1': [0x4, 0x6, 0x4, 0x4, 0x4, 0xE],  // 0100 0110 0100 0100 0100 1110
  '2': [0x6, 0x9, 0x2, 0x4, 0x8, 0xF],  // 0110 1001 0010 0100 1000 1111
  '3': [0x6, 0x9, 0x2, 0x2, 0x9, 0x6],  // 0110 1001 0010 0010 1001 0110
  '4': [0x2, 0x6, 0xA, 0xF, 0x2, 0x2],  // 0010 0110 1010 1111 0010 0010
  '5': [0xF, 0x8, 0xE, 0x2, 0x2, 0xE],  // 1111 1000 1110 0010 0010 1110
  '6': [0x6, 0x8, 0xE, 0x9, 0x9, 0x6],  // 0110 1000 1110 1001 1001 0110
  '7': [0xF, 0x2, 0x4, 0x4, 0x4, 0x4],  // 1111 0010 0100 0100 0100 0100
  '8': [0x6, 0x9, 0x6, 0x6, 0x9, 0x6],  // 0110 1001 0110 0110 1001 0110
  '9': [0x6, 0x9, 0x9, 0x7, 0x2, 0x6],  // 0110 1001 1001 0111 0010 0110
  
  // Специальные символы
  '?': [0x6, 0x9, 0x2, 0x4, 0x0, 0x4],  // знак вопроса
  '!': [0x4, 0x4, 0x4, 0x4, 0x0, 0x4],  // восклицание
  '.': [0x0, 0x0, 0x0, 0x0, 0x0, 0x4],  // точка
  ',': [0x0, 0x0, 0x0, 0x0, 0x4, 0x8],  // запятая
  '-': [0x0, 0x0, 0x7, 0x0, 0x0, 0x0],  // тире
  '_': [0x0, 0x0, 0x0, 0x0, 0x0, 0xF],  // подчёркивание
  ' ': [0x0, 0x0, 0x0, 0x0, 0x0, 0x0],  // пробел
  
  // Английские буквы (на всякий случай)
  'A': [0x6, 0x9, 0x9, 0xF, 0x9, 0x9],
  'B': [0x7, 0x9, 0x7, 0x9, 0x9, 0x7],
  'C': [0x6, 0x9, 0x1, 0x1, 0x9, 0x6],
  'D': [0x7, 0x9, 0x9, 0x9, 0x9, 0x7],
  'E': [0xF, 0x8, 0xF, 0x8, 0x8, 0xF],
  'F': [0xF, 0x8, 0xF, 0x8, 0x8, 0x8],
  'G': [0x6, 0x9, 0x1, 0x9, 0x9, 0x6],
  'H': [0x9, 0x9, 0xF, 0x9, 0x9, 0x9],
  'I': [0x7, 0x2, 0x2, 0x2, 0x2, 0x7],
  'J': [0x7, 0x2, 0x2, 0x2, 0xA, 0x4],
  'K': [0x9, 0x9, 0x7, 0x9, 0x9, 0x9],
  'L': [0x8, 0x8, 0x8, 0x8, 0x8, 0xF],
  'M': [0x9, 0xF, 0xF, 0x9, 0x9, 0x9],
  'N': [0x9, 0xD, 0xF, 0xB, 0x9, 0x9],
  'O': [0x6, 0x9, 0x9, 0x9, 0x9, 0x6],
  'P': [0x7, 0x9, 0x9, 0x7, 0x1, 0x1],
  'Q': [0x6, 0x9, 0x9, 0x9, 0xB, 0x6],
  'R': [0x7, 0x9, 0x9, 0x7, 0x9, 0x9],
  'S': [0x6, 0x9, 0x2, 0x4, 0x9, 0x6],
  'T': [0xF, 0x4, 0x4, 0x4, 0x4, 0x4],
  'U': [0x9, 0x9, 0x9, 0x9, 0x9, 0x6],
  'V': [0x9, 0x9, 0x9, 0x9, 0x6, 0x6],
  'W': [0x9, 0x9, 0x9, 0xF, 0xF, 0x9],
  'X': [0x9, 0x9, 0x6, 0x6, 0x9, 0x9],
  'Y': [0x9, 0x9, 0x6, 0x4, 0x4, 0x4],
  'Z': [0xF, 0x2, 0x4, 0x4, 0x8, 0xF]
};

// ==================== ФУНКЦИИ ====================

/**
 * Рисует текст ВЕРТИКАЛЬНО (повёрнутый на 90°)
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
        // Проверяем бит (4-битные данные, проверяем 3-col бит)
        const bitPos = CONFIG.FONT_WIDTH - 1 - col;
        if (rowData & (1 << bitPos)) {
          // ПОВОРОТ НА 90° ПО ЧАСОВОЙ СТРЕЛКЕ:
          // row -> X координата (вертикаль вниз)
          // col -> Y координата (горизонталь вправо)
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
        const bitPos = CONFIG.FONT_WIDTH - 1 - col;
        if (rowData & (1 << bitPos)) {
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

// ==================== ОСНОВНОЙ КОД ====================

module.exports = async (req, res) => {
  try {
    console.log('=== ГЕНЕРАЦИЯ ЭТИКЕТКИ (шрифт 4x6) ===');
    
    const text = req.query.text || 'ПРИВЕТ';
    console.log('Текст:', text);
    
    // 1. Создаём белый холст
    const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;     // R
      buffer[i + 1] = 255; // G
      buffer[i + 2] = 255; // B
      buffer[i + 3] = 255; // A
    }
    
    // 2. КРАСНАЯ РАМКА (для ориентации)
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
    console.log('Рисуем вертикальный текст...');
    drawVerticalText(buffer, text, CONFIG.TEXT_OFFSET_X, CONFIG.TEXT_OFFSET_Y);
    
    // 4. ГОРИЗОНТАЛЬНЫЙ ТЕКСТ ВНИЗУ (для сравнения)
    console.log('Рисуем горизонтальный текст для сравнения...');
    drawHorizontalText(buffer, text, 50, 200);
    
    // 5. ОТЛАДОЧНЫЕ МЕТКИ
    // Синяя точка в начале текста
    const startIdx = (CONFIG.TEXT_OFFSET_X * CONFIG.WIDTH + CONFIG.TEXT_OFFSET_Y) * 4;
    buffer[startIdx] = 0; buffer[startIdx+1] = 0; buffer[startIdx+2] = 255;
    
    // Зелёная точка через 50px
    const midIdx = (CONFIG.TEXT_OFFSET_X * CONFIG.WIDTH + (CONFIG.TEXT_OFFSET_Y + 50)) * 4;
    buffer[midIdx] = 0; buffer[midIdx+1] = 255; buffer[midIdx+2] = 0;
    
    // 6. QR-ЗАГЛУШКА СПРАВА
    const qrSize = 150;
    const qrX = CONFIG.WIDTH - qrSize - 40;
    const qrY = Math.floor((CONFIG.HEIGHT - qrSize) / 2);
    
    // Внешний чёрный квадрат
    for (let y = qrY; y < qrY + qrSize; y++) {
      for (let x = qrX; x < qrX + qrSize; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 0;
        buffer[idx+1] = 0;
        buffer[idx+2] = 0;
      }
    }
    
    // Внутренняя белая рамка
    for (let y = qrY + 10; y < qrY + qrSize - 10; y++) {
      for (let x = qrX + 10; x < qrX + qrSize - 10; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 255;
        buffer[idx+1] = 255;
        buffer[idx+2] = 255;
      }
    }
    
    // Буква "Q" в центре
    for (let y = qrY + 60; y < qrY + 90; y++) {
      for (let x = qrX + 60; x < qrX + 90; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 0;
        buffer[idx+1] = 0;
        buffer[idx+2] = 0;
      }
    }
    
    // 7. СОЗДАЁМ PNG
    const png = new PNG({
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT
    });
    png.data = Buffer.from(buffer);
    
    // 8. ОТПРАВЛЯЕМ
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('=== ЭТИКЕТКА ГОТОВА ===');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('=== ОШИБКА ===', error);
    res.status(500).json({
      error: error.message,
      message: 'Ошибка генерации изображения'
    });
  }
};

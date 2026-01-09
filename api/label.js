const { PNG } = require('pngjs');

const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  TEXT_OFFSET_X: 50,  // отступ слева для текста
  TEXT_OFFSET_Y: 30   // отступ сверху для текста
};

// ==================== ВАШ ШРИФТ ====================
const fontData = {

  // Русские буквы (8x8)
  'А': [0x18,0x24,0x42,0x42,0x7E,0x42,0x42,0x00],
  'Б': [0x7E,0x40,0x40,0x7C,0x42,0x42,0x7C,0x00],
  'В': [0x7C,0x42,0x42,0x7C,0x42,0x42,0x7C,0x00],
  'Г': [0x7E,0x40,0x40,0x40,0x40,0x40,0x40,0x00],
  'Д': [0x3C,0x22,0x22,0x22,0x22,0x22,0x7F,0x41],
  'Е': [0x7E,0x40,0x40,0x7C,0x40,0x40,0x7E,0x00],
  'Ж': [0x42,0x42,0x24,0x18,0x24,0x42,0x42,0x00],
  'З': [0x3C,0x42,0x02,0x1C,0x02,0x42,0x3C,0x00],
  'И': [0x42,0x46,0x4A,0x52,0x62,0x42,0x42,0x00],
  'Й': [0x42,0x46,0x4A,0x52,0x62,0x42,0x42,0x24],
  'К': [0x42,0x44,0x48,0x70,0x48,0x44,0x42,0x00],
  'Л': [0x3E,0x42,0x42,0x42,0x42,0x42,0x42,0x00],
  'М': [0x42,0x66,0x5A,0x42,0x42,0x42,0x42,0x00],
  'Н': [0x42,0x42,0x42,0x7E,0x42,0x42,0x42,0x00],
  'О': [0x3C,0x42,0x42,0x42,0x42,0x42,0x3C,0x00],
  'П': [0x7E,0x42,0x42,0x42,0x42,0x42,0x42,0x00],
  'Р': [0x7C,0x42,0x42,0x7C,0x40,0x40,0x40,0x00],
  'С': [0x3C,0x42,0x40,0x40,0x40,0x42,0x3C,0x00],
  'Т': [0x7E,0x18,0x18,0x18,0x18,0x18,0x18,0x00],
  'У': [0x42,0x42,0x42,0x3C,0x18,0x30,0x40,0x00],
  'Ф': [0x18,0x24,0x24,0x18,0x24,0x24,0x18,0x00],
  'Х': [0x42,0x42,0x24,0x18,0x24,0x42,0x42,0x00],
  'Ц': [0x42,0x42,0x42,0x42,0x42,0x42,0x7E,0x02],
  'Ч': [0x42,0x42,0x42,0x3E,0x02,0x02,0x02,0x00],
  'Ш': [0x42,0x42,0x42,0x42,0x42,0x42,0x7E,0x00],
  'Щ': [0x42,0x42,0x42,0x42,0x42,0x42,0x7E,0x02],
  'Ъ': [0x70,0x20,0x20,0x3C,0x22,0x22,0x3C,0x00],
  'Ы': [0x42,0x42,0x42,0x7A,0x46,0x46,0x7A,0x00],
  'Ь': [0x40,0x40,0x40,0x7C,0x42,0x42,0x7C,0x00],
  'Э': [0x3C,0x42,0x02,0x1E,0x02,0x42,0x3C,0x00],
  'Ю': [0x4C,0x52,0x52,0x72,0x52,0x52,0x4C,0x00],
  'Я': [0x3E,0x42,0x42,0x3E,0x0A,0x12,0x62,0x00],
  
  // Цифры
  '0': [0x3C,0x42,0x46,0x4A,0x52,0x62,0x3C,0x00],
  '1': [0x08,0x18,0x28,0x08,0x08,0x08,0x3E,0x00],
  '2': [0x3C,0x42,0x02,0x0C,0x30,0x40,0x7E,0x00],
  '3': [0x3C,0x42,0x02,0x1C,0x02,0x42,0x3C,0x00],
  '4': [0x04,0x0C,0x14,0x24,0x7E,0x04,0x04,0x00],
  '5': [0x7E,0x40,0x7C,0x02,0x02,0x42,0x3C,0x00],
  '6': [0x3C,0x40,0x40,0x7C,0x42,0x42,0x3C,0x00],
  '7': [0x7E,0x02,0x04,0x08,0x10,0x10,0x10,0x00],
  '8': [0x3C,0x42,0x42,0x3C,0x42,0x42,0x3C,0x00],
  '9': [0x3C,0x42,0x42,0x3E,0x02,0x02,0x3C,0x00],
  
  // Пробел
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
};

// ==================== КОНЕЦ ШРИФТА ====================

// ==================== ФУНКЦИИ ====================

/**
 * Рисует текст ВЕРТИКАЛЬНО (повёрнутый на 90° по часовой стрелке)
 * Текст читается сверху вниз
 */
function drawVerticalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  let currentY = startY;
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = fontData[char] || fontData["?"] || {w: 8, d: [0x3C00, 0x4200, 0x8100, 0x8100, 0x8100, 0x8100, 0x4200, 0x3C00]};
    
    // Каждый символ имеет разную ширину (пропорциональный шрифт)
    const width = glyph.w;
    const height = glyph.d.length; // высота = количество элементов в массиве
    
    // Рисуем каждый столбец глифа
    for (let col = 0; col < width; col++) {
      const colData = glyph.d[col] || 0;
      
      // Проверяем каждый бит в столбце (16-битные данные)
      for (let bit = 0; bit < 16; bit++) {
        if (colData & (1 << bit)) {
          // ПОВОРОТ НА 90° ПО ЧАСОВОЙ СТРЕЛКЕ:
          // bit -> X координата (вертикаль вниз)
          // col -> Y координата (горизонталь вправо)
          const x = startX + bit;
          const y = currentY + col;
          
          if (x >= 0 && x < CONFIG.HEIGHT && y >= 0 && y < CONFIG.WIDTH) {
            const idx = (x * CONFIG.WIDTH + y) * 4;
            buffer[idx] = 0;     // R - чёрный
            buffer[idx + 1] = 0; // G
            buffer[idx + 2] = 0; // B
          }
        }
      }
    }
    
    // Переходим к следующей букве с небольшим отступом
    currentY += width + 1; // +1 пиксель пробел между буквами
  }
}

/**
 * Рисует текст ГОРИЗОНТАЛЬНО (для отладки и сравнения)
 */
function drawHorizontalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  let currentX = startX;
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = fontData[char] || fontData["?"] || {w: 8, d: [0x3C00, 0x4200, 0x8100, 0x8100, 0x8100, 0x8100, 0x4200, 0x3C00]};
    
    const width = glyph.w;
    const height = glyph.d.length;
    
    for (let col = 0; col < width; col++) {
      const colData = glyph.d[col] || 0;
      
      for (let bit = 0; bit < 16; bit++) {
        if (colData & (1 << bit)) {
          const x = currentX + col;
          const y = startY + bit;
          
          if (x >= 0 && x < CONFIG.WIDTH && y >= 0 && y < CONFIG.HEIGHT) {
            const idx = (y * CONFIG.WIDTH + x) * 4;
            buffer[idx] = 0;
            buffer[idx + 1] = 0;
            buffer[idx + 2] = 0;
          }
        }
      }
    }
    
    currentX += width + 1;
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
  try {
    console.log('=== ГЕНЕРАЦИЯ ЭТИКЕТКИ ===');
    
    // Получаем параметры
    const text = req.query.text || 'ПРИВЕТ';
    console.log('Текст:', text);
    
    // 1. Создаём белый холст
    const buffer = createWhiteCanvas();
    
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
    
    // 3. ВЕРТИКАЛЬНЫЙ ТЕКСТ СЛЕВА (основной)
    console.log('Рисуем вертикальный текст...');
    drawVerticalText(buffer, text, CONFIG.TEXT_OFFSET_X, CONFIG.TEXT_OFFSET_Y);
    
    // 4. ГОРИЗОНТАЛЬНЫЙ ТЕКСТ ВНИЗУ (для сравнения)
    console.log('Рисуем горизонтальный текст для сравнения...');
    drawHorizontalText(buffer, text, 50, 200);
    
    // 5. ОТЛАДОЧНЫЕ МЕТКИ
    // Синяя точка в начале текста
    const startIdx = (CONFIG.TEXT_OFFSET_X * CONFIG.WIDTH + CONFIG.TEXT_OFFSET_Y) * 4;
    buffer[startIdx] = 0; buffer[startIdx+1] = 0; buffer[startIdx+2] = 255;
    
    // Зелёная точка через 50px от начала
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
    
    // Буква "Q" в центре QR
    for (let y = qrY + 60; y < qrY + 90; y++) {
      for (let x = qrX + 60; x < qrX + 90; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 0;
        buffer[idx+1] = 0;
        buffer[idx+2] = 0;
      }
    }
    
    // Белый круг внутри Q
    for (let y = qrY + 65; y < qrY + 85; y++) {
      for (let x = qrX + 65; x < qrX + 85; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 255;
        buffer[idx+1] = 255;
        buffer[idx+2] = 255;
      }
    }
    
    // 7. ПОДПИСЬ В ПРАВОМ НИЖНЕМ УГЛУ
    drawHorizontalText(buffer, "384x260", CONFIG.WIDTH - 100, CONFIG.HEIGHT - 20);
    
    // 8. СОЗДАЁМ PNG
    const png = new PNG({
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT
    });
    png.data = Buffer.from(buffer);
    
    // 9. ОТПРАВЛЯЕМ
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('=== ЭТИКЕТКА ГОТОВА ===');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('=== ОШИБКА ===', error);
    
    // Создаём простую ошибку как изображение
    const errorPng = new PNG({ width: 384, height: 260 });
    for (let i = 0; i < errorPng.data.length; i += 4) {
      errorPng.data[i] = 255;
      errorPng.data[i+1] = 200;
      errorPng.data[i+2] = 200;
      errorPng.data[i+3] = 255;
    }
    
    res.setHeader('Content-Type', 'image/png');
    res.end(PNG.sync.write(errorPng));
  }
};


// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
  WIDTH: 384,           // Ширина этикетки
  HEIGHT: 260,          // Высота этикетки
  TEXT_X: 30,           // Отступ текста слева
  TEXT_Y: 50,           // Отступ текста сверху
  QR_SIZE: 150,         // Размер QR-кода
  QR_X: 384 - 150 - 40, // Позиция QR справа (384 - размер - отступ)
  QR_Y: 55              // Позиция QR сверху
};

// ==================== ШРИФТ 8x8 ====================
const FONT_8x8 = {
  'А': [0x18,0x24,0x42,0x42,0x7E,0x42,0x42,0x00],
  'Б': [0xFE,0x80,0x80,0xFC,0x82,0x82,0xFC,0x00],
  'В': [0xFF,0x81,0x81,0xFF,0x81,0x81,0xFF,0x00],
  'Г': [0xFF,0x80,0x80,0x80,0x80,0x80,0x80,0x00],
  'Д': [0x0C,0x12,0x22,0x22,0x22,0x22,0x7F,0x41],
  'Е': [0xFF,0xC0,0xC0,0xFC,0xC0,0xC0,0xFF,0x00],
  'Ё': [0x66,0x00,0xFF,0xC0,0xFC,0xC0,0xFF,0x00],
  'Ж': [0x91,0x91,0x91,0x7C,0x54,0x92,0x92,0x00],
  'З': [0x7C,0x82,0x02,0x1C,0x02,0x82,0x7C,0x00],
  'И': [0x81,0x83,0x85,0x89,0x91,0xA1,0xC1,0x00],
  'Й': [0x24,0x18,0x81,0x83,0x85,0x89,0xC1,0x00],
  'К': [0x81,0x82,0x84,0xF8,0x84,0x82,0x81,0x00],
  'Л': [0x0F,0x10,0x10,0x10,0x10,0x10,0x1F,0x10],
  'М': [0x81,0xC3,0xA5,0x99,0x81,0x81,0x81,0x00],
  'Н': [0x81,0x81,0x81,0xFF,0x81,0x81,0x81,0x00],
  'О': [0x3C,0x42,0x81,0x81,0x81,0x42,0x3C,0x00],
  'П': [0xFF,0x81,0x81,0x81,0x81,0x81,0x81,0x00],
  'Р': [0xFF,0x81,0x81,0xFF,0x80,0x80,0x80,0x00],
  'С': [0x3C,0x42,0x80,0x80,0x80,0x42,0x3C,0x00],
  'Т': [0xFF,0x18,0x18,0x18,0x18,0x18,0x18,0x00],
  'У': [0x81,0x42,0x24,0x18,0x18,0x10,0x60,0x00],
  'Ф': [0x18,0x24,0x24,0x18,0x24,0x24,0x18,0x00],
  'Х': [0x81,0x42,0x24,0x18,0x24,0x42,0x81,0x00],
  'Ц': [0x82,0x82,0x82,0x82,0x82,0x82,0x7F,0x01],
  'Ч': [0x81,0x81,0x81,0x7F,0x01,0x01,0x01,0x00],
  'Ш': [0x81,0x81,0x81,0x81,0x81,0x81,0xFF,0x00],
  'Щ': [0x92,0x92,0x92,0x92,0x92,0x92,0xFF,0x01],
  'Ъ': [0xE0,0x40,0x40,0x7C,0x42,0x42,0x7C,0x00],
  'Ы': [0x81,0x81,0x81,0xF9,0x85,0x85,0xF9,0x00],
  'Ь': [0x80,0x80,0x80,0xFC,0x82,0x82,0xFC,0x00],
  'Э': [0x7C,0x82,0x01,0x1F,0x01,0x82,0x7C,0x00],
  'Ю': [0x86,0x89,0x91,0xF1,0x91,0x89,0x86,0x00],
  'Я': [0x3F,0x41,0x41,0x3F,0x05,0x09,0x71,0x00],
  
  // Цифры
  '0': [0x3C,0x42,0x81,0x81,0x81,0x42,0x3C,0x00],
  '1': [0x08,0x18,0x28,0x08,0x08,0x08,0x3E,0x00],
  '2': [0x3C,0x42,0x02,0x0C,0x30,0x40,0x7E,0x00],
  '3': [0x3C,0x42,0x02,0x1C,0x02,0x42,0x3C,0x00],
  '4': [0x04,0x0C,0x14,0x24,0x7E,0x04,0x04,0x00],
  '5': [0x7E,0x40,0x7C,0x02,0x02,0x42,0x3C,0x00],
  '6': [0x1C,0x20,0x40,0x7C,0x42,0x42,0x3C,0x00],
  '7': [0x7E,0x02,0x04,0x08,0x10,0x20,0x40,0x00],
  '8': [0x3C,0x42,0x42,0x3C,0x42,0x42,0x3C,0x00],
  '9': [0x3C,0x42,0x42,0x3E,0x02,0x04,0x38,0x00],
  
  // Специальные символы
  '?': [0x3C,0x42,0x02,0x0C,0x10,0x00,0x10,0x00],
  '!': [0x18,0x18,0x18,0x18,0x00,0x00,0x18,0x00],
  '.': [0x00,0x00,0x00,0x00,0x00,0x00,0x18,0x00],
  ',': [0x00,0x00,0x00,0x00,0x18,0x18,0x30,0x00],
  '-': [0x00,0x00,0x00,0x7E,0x00,0x00,0x00,0x00],
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
};

// ==================== ФУНКЦИИ ====================

/**
 * Рисует текст ГОРИЗОНТАЛЬНО (слева направо)
 */
function drawText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    // Каждая буква 8x8 пикселей
    for (let row = 0; row < 8; row++) {
      const rowData = glyph[row];
      
      for (let col = 0; col < 8; col++) {
        // Проверяем бит (справа налево)
        if (rowData & (1 << (7 - col))) {
          const x = startX + i * 9 + col; // 9 = 8 пикселей + 1 пробел
          const y = startY + row;
          
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

/**
 * Рисует рамку для отладки
 */
function drawDebugFrame(buffer) {
  // Красная рамка
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
  
  // Зелёный крест в центре
  const centerX = Math.floor(CONFIG.WIDTH / 2);
  const centerY = Math.floor(CONFIG.HEIGHT / 2);
  for (let i = -5; i <= 5; i++) {
    // Горизонталь
    let idx = (centerY * CONFIG.WIDTH + (centerX + i)) * 4;
    if (idx >= 0 && idx < buffer.length) {
      buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
    }
    // Вертикаль
    idx = ((centerY + i) * CONFIG.WIDTH + centerX) * 4;
    if (idx >= 0 && idx < buffer.length) {
      buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
    }
  }
}

// ==================== ОСНОВНОЙ КОД ====================

// Используем require вместо import для совместимости
const { PNG } = require('pngjs');

module.exports = async (req, res) => {
  try {
    console.log('=== ГЕНЕРАЦИЯ ЭТИКЕТКИ ===');
    
    // Получаем параметры
    const text = req.query.text || 'ПРИВЕТ';
    console.log('Текст:', text);
    
    // 1. Создаём белый холст
    const buffer = createWhiteCanvas();
    
    // 2. Рисуем отладочную рамку
    drawDebugFrame(buffer);
    
    // 3. Рисуем текст слева (горизонтально)
    console.log('Рисуем текст по координатам:', CONFIG.TEXT_X, CONFIG.TEXT_Y);
    drawText(buffer, text, CONFIG.TEXT_X, CONFIG.TEXT_Y);
    
    // 4. Рисуем заглушку QR-кода справа
    console.log('Рисуем QR по координатам:', CONFIG.QR_X, CONFIG.QR_Y);
    
    // Внешний чёрный квадрат
    for (let y = CONFIG.QR_Y; y < CONFIG.QR_Y + CONFIG.QR_SIZE; y++) {
      for (let x = CONFIG.QR_X; x < CONFIG.QR_X + CONFIG.QR_SIZE; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
      }
    }
    
    // Внутренний белый квадрат (рамка)
    const innerMargin = 10;
    for (let y = CONFIG.QR_Y + innerMargin; y < CONFIG.QR_Y + CONFIG.QR_SIZE - innerMargin; y++) {
      for (let x = CONFIG.QR_X + innerMargin; x < CONFIG.QR_X + CONFIG.QR_SIZE - innerMargin; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 255;
        buffer[idx + 1] = 255;
        buffer[idx + 2] = 255;
      }
    }
    
    // Буква "Q" в центре QR
    const qCenterX = CONFIG.QR_X + Math.floor(CONFIG.QR_SIZE / 2);
    const qCenterY = CONFIG.QR_Y + Math.floor(CONFIG.QR_SIZE / 2);
    for (let y = qCenterY - 15; y < qCenterY + 15; y++) {
      for (let x = qCenterX - 15; x < qCenterX + 15; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
      }
    }
    
    // Белый круг внутри Q
    for (let y = qCenterY - 10; y < qCenterY + 10; y++) {
      for (let x = qCenterX - 10; x < qCenterX + 10; x++) {
        const idx = (y * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 255;
        buffer[idx + 1] = 255;
        buffer[idx + 2] = 255;
      }
    }
    
    // 5. Отладочные маркеры
    // Синяя точка в начале текста
    const textStartIdx = (CONFIG.TEXT_Y * CONFIG.WIDTH + CONFIG.TEXT_X) * 4;
    buffer[textStartIdx] = 0; buffer[textStartIdx+1] = 0; buffer[textStartIdx+2] = 255;
    
    // Жёлтая точка в центре QR
    const qrCenterIdx = (qCenterY * CONFIG.WIDTH + qCenterX) * 4;
    buffer[qrCenterIdx] = 255; buffer[qrCenterIdx+1] = 255; buffer[qrCenterIdx+2] = 0;
    
    // 6. Создаём PNG
    const png = new PNG({
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT
    });
    png.data = Buffer.from(buffer);
    
    // 7. Отправляем
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Label-Generator', '1.0');
    
    console.log('=== ЭТИКЕТКА ГОТОВА ===');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('=== ОШИБКА ===', error);
    
    // Простой ответ об ошибке
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Используем require вместо import для совместимости
const QRCode = require('qrcode');
const { PNG } = require('pngjs');

const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  QR_SIZE: 180,
  TEXT_OFFSET_X: 20,  // отступ сверху для текста
  TEXT_OFFSET_Y: 30   // отступ слева для текста
};

// Простой шрифт 8x8 (только нужные буквы)
const FONT_8x8 = {
  'П': [0xFF,0x81,0x81,0x81,0x81,0x81,0x81,0x00],
  'Р': [0xFF,0x81,0x81,0xFF,0x80,0x80,0x80,0x00],
  'И': [0x81,0x83,0x85,0x89,0x91,0xA1,0xC1,0x00],
  'В': [0xFF,0x81,0x81,0xFF,0x81,0x81,0xFF,0x00],
  'Е': [0xFF,0xC0,0xC0,0xFC,0xC0,0xC0,0xFF,0x00],
  'Т': [0xFF,0x18,0x18,0x18,0x18,0x18,0x18,0x00],
  '1': [0x08,0x18,0x28,0x08,0x08,0x08,0x3E,0x00],
  '2': [0x3C,0x42,0x02,0x0C,0x30,0x40,0x7E,0x00],
  '3': [0x3C,0x42,0x02,0x1C,0x02,0x42,0x3C,0x00],
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
};

// Текст БЕЗ поворота - рисуем слева вертикально
function drawVerticalText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  
  // Каждая буква рисуется под предыдущей
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    if (!glyph) continue; // пропускаем символы без глифа
    
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
            buffer[idx] = 0;     // R - чёрный
            buffer[idx + 1] = 0; // G
            buffer[idx + 2] = 0; // B
            // A остаётся 255
          }
        }
      }
    }
  }
}

// Главная функция
module.exports = async (req, res) => {
  try {
    console.log('=== НАЧАЛО ГЕНЕРАЦИИ ===');
    
    // Получаем параметры
    const text = req.query.text || 'ПРИВЕТ';
    const qr = req.query.qr || 'https://example.com';
    
    console.log('Параметры:', { text, qr });
    
    // 1. Создаём белый холст
    const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;     // R
      buffer[i + 1] = 255; // G
      buffer[i + 2] = 255; // B
      buffer[i + 3] = 255; // A
    }
    
    // 2. ОТЛАДОЧНАЯ ИНФОРМАЦИЯ НА САМОМ ИЗОБРАЖЕНИИ
    
    // Красная рамка по краям
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
    for (let i = -10; i <= 10; i++) {
      // Горизонтальная линия
      let idx = (centerY * CONFIG.WIDTH + (centerX + i)) * 4;
      if (idx >= 0 && idx < buffer.length) {
        buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
      }
      // Вертикальная линия
      idx = ((centerY + i) * CONFIG.WIDTH + centerX) * 4;
      if (idx >= 0 && idx < buffer.length) {
        buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
      }
    }
    
    // 3. РИСУЕМ ТЕКСТ (просто вертикально, без сложного поворота)
    console.log('Рисуем текст:', text);
    drawVerticalText(buffer, text, CONFIG.TEXT_OFFSET_Y, CONFIG.TEXT_OFFSET_X);
    
    // Синяя точка в начале текста
    const textStartIdx = (CONFIG.TEXT_OFFSET_X * CONFIG.WIDTH + CONFIG.TEXT_OFFSET_Y) * 4;
    if (textStartIdx < buffer.length) {
      buffer[textStartIdx] = 0;
      buffer[textStartIdx + 1] = 0;
      buffer[textStartIdx + 2] = 255;
    }
    
    // 4. ГЕНЕРИРУЕМ QR-КОД
    console.log('Генерируем QR код для:', qr);
    const qrBuffer = await QRCode.toBuffer(qr, {
      width: CONFIG.QR_SIZE,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    const qrImage = PNG.sync.read(qrBuffer);
    
    // Позиция QR: справа
    const qrX = CONFIG.WIDTH - CONFIG.QR_SIZE - 40; // отступ справа 40px
    const qrY = Math.floor((CONFIG.HEIGHT - CONFIG.QR_SIZE) / 2);
    
    console.log('QR позиция:', { qrX, qrY });
    
    // Копируем QR-код в изображение
    for (let y = 0; y < CONFIG.QR_SIZE; y++) {
      for (let x = 0; x < CONFIG.QR_SIZE; x++) {
        const srcIdx = (y * CONFIG.QR_SIZE + x) * 4;
        const dstX = qrX + x;
        const dstY = qrY + y;
        
        if (dstX >= 0 && dstX < CONFIG.WIDTH && dstY >= 0 && dstY < CONFIG.HEIGHT) {
          const dstIdx = (dstY * CONFIG.WIDTH + dstX) * 4;
          
          // Если пиксель QR тёмный
          if (qrImage.data[srcIdx] < 128) {
            buffer[dstIdx] = 0;
            buffer[dstIdx + 1] = 0;
            buffer[dstIdx + 2] = 0;
          }
        }
      }
    }
    
    // 5. ПОДПИСЬ (для отладки)
    const debugText = `${CONFIG.WIDTH}x${CONFIG.HEIGHT}`;
    for (let i = 0; i < debugText.length; i++) {
      const char = debugText[i];
      if (FONT_8x8[char]) {
        const glyph = FONT_8x8[char];
        for (let col = 0; col < 8; col++) {
          for (let row = 0; row < 8; row++) {
            if (glyph[col] & (1 << (7 - row))) {
              const x = CONFIG.HEIGHT - 30 + row;
              const y = CONFIG.WIDTH - 100 + i * 10 + col;
              if (x < CONFIG.HEIGHT && y < CONFIG.WIDTH) {
                const idx = (x * CONFIG.WIDTH + y) * 4;
                buffer[idx] = 100;
                buffer[idx+1] = 100;
                buffer[idx+2] = 100;
              }
            }
          }
        }
      }
    }
    
    // 6. СОЗДАЁМ И ОТПРАВЛЯЕМ PNG
    const png = new PNG({
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT
    });
    png.data = Buffer.from(buffer);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('Изображение готово, отправляем...');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('ОШИБКА:', error);
    
    // Создаём простую картинку с ошибкой
    const errorPng = new PNG({ width: 384, height: 260 });
    for (let i = 0; i < errorPng.data.length; i += 4) {
      errorPng.data[i] = 255;     // R
      errorPng.data[i+1] = 200;   // G
      errorPng.data[i+2] = 200;   // B
      errorPng.data[i+3] = 255;   // A
    }
    
    res.setHeader('Content-Type', 'image/png');
    res.end(PNG.sync.write(errorPng));
  }
};

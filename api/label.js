import { PNG } from 'pngjs';

// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
  WIDTH: 384,     // Ширина изображения
  HEIGHT: 260,    // Высота изображения
  FONT_SIZE: 8    // Размер шрифта 8x8
};

// ==================== ШРИФТ 8x8 ====================
const FONT_8x8 = {
  // Русские буквы
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

// ==================== ФУНКЦИЯ РИСОВАНИЯ ТЕКСТА ====================
function drawText(buffer, text, startX, startY) {
  const chars = text.toUpperCase().split('');
  console.log(`Рисуем текст: "${text}" (${chars.length} символов)`);
  console.log(`Позиция: x=${startX}, y=${startY}`);
  
  for (let letterIndex = 0; letterIndex < chars.length; letterIndex++) {
    const char = chars[letterIndex];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    console.log(`Символ ${letterIndex}: "${char}"`);
    
    // Рисуем символ 8x8
    for (let row = 0; row < 8; row++) {
      const rowData = glyph[row];
      
      for (let col = 0; col < 8; col++) {
        // Проверяем бит в строке
        if (rowData & (1 << (7 - col))) {
          // Координаты пикселя
          const x = startX + (letterIndex * 9) + col; // 9 = 8 + 1 пробел
          const y = startY + row;
          
          // Проверяем границы
          if (x >= 0 && x < CONFIG.WIDTH && y >= 0 && y < CONFIG.HEIGHT) {
            // Индекс в буфере
            const idx = (y * CONFIG.WIDTH + x) * 4;
            
            // Чёрный пиксель
            buffer[idx] = 0;     // R
            buffer[idx + 1] = 0; // G
            buffer[idx + 2] = 0; // B
            // A уже 255
          } else {
            console.warn(`Пиксель вне границ: x=${x}, y=${y}`);
          }
        }
      }
    }
  }
}

// ==================== СОЗДАНИЕ ХОЛСТА ====================
function createCanvas() {
  const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
  console.log(`Создаём холст: ${CONFIG.WIDTH}x${CONFIG.HEIGHT}, буфер: ${buffer.length} байт`);
  
  // Белый фон
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = 255;     // R
    buffer[i + 1] = 255; // G
    buffer[i + 2] = 255; // B
    buffer[i + 3] = 255; // A
  }
  
  return buffer;
}

// ==================== ДЕБАГ РАМКА ====================
function drawDebugFrame(buffer) {
  console.log('Рисуем отладочную рамку...');
  
  // Красная рамка по краям
  for (let x = 0; x < CONFIG.WIDTH; x++) {
    // Верхняя граница
    let idx = (0 * CONFIG.WIDTH + x) * 4;
    buffer[idx] = 255;     // R
    buffer[idx + 1] = 0;   // G
    buffer[idx + 2] = 0;   // B
    
    // Нижняя граница
    idx = ((CONFIG.HEIGHT - 1) * CONFIG.WIDTH + x) * 4;
    buffer[idx] = 255;
    buffer[idx + 1] = 0;
    buffer[idx + 2] = 0;
  }
  
  for (let y = 0; y < CONFIG.HEIGHT; y++) {
    // Левая граница
    let idx = (y * CONFIG.WIDTH + 0) * 4;
    buffer[idx] = 255;
    buffer[idx + 1] = 0;
    buffer[idx + 2] = 0;
    
    // Правая граница
    idx = (y * CONFIG.WIDTH + (CONFIG.WIDTH - 1)) * 4;
    buffer[idx] = 255;
    buffer[idx + 1] = 0;
    buffer[idx + 2] = 0;
  }
  
  // Зелёный крест в центре
  const centerX = Math.floor(CONFIG.WIDTH / 2);
  const centerY = Math.floor(CONFIG.HEIGHT / 2);
  console.log(`Центр изображения: x=${centerX}, y=${centerY}`);
  
  for (let i = -10; i <= 10; i++) {
    // Горизонтальная линия
    let idx = (centerY * CONFIG.WIDTH + (centerX + i)) * 4;
    if (idx >= 0 && idx < buffer.length) {
      buffer[idx] = 0;
      buffer[idx + 1] = 255;
      buffer[idx + 2] = 0;
    }
    
    // Вертикальная линия
    idx = ((centerY + i) * CONFIG.WIDTH + centerX) * 4;
    if (idx >= 0 && idx < buffer.length) {
      buffer[idx] = 0;
      buffer[idx + 1] = 255;
      buffer[idx + 2] = 0;
    }
  }
}

// ==================== ОСНОВНОЙ ОБРАБОТЧИК ====================
export default async function handler(req, res) {
  console.log('=== НАЧАЛО ГЕНЕРАЦИИ ИЗОБРАЖЕНИЯ ===');
  
  try {
    // Получаем текст из параметров
    const text = req.query.text || 'ТЕСТ';
    const decodedText = decodeURIComponent(text);
    
    console.log('Параметры запроса:', { 
      text: decodedText,
      rawQuery: req.query 
    });
    
    // Создаём холст
    const buffer = createCanvas();
    
    // Рисуем отладочную рамку
    drawDebugFrame(buffer);
    
    // Рисуем текст в нескольких местах для теста
    console.log('\nРисуем текст в разных позициях:');
    
    // 1. Текст в левом верхнем углу
    drawText(buffer, decodedText, 30, 30);
    
    // 2. Текст по центру
    const centerTextX = Math.floor(CONFIG.WIDTH / 2) - (decodedText.length * 9 / 2);
    drawText(buffer, 'ЦЕНТР', centerTextX, Math.floor(CONFIG.HEIGHT / 2) - 4);
    
    // 3. Текст в правом нижнем углу
    const bottomTextX = CONFIG.WIDTH - (decodedText.length * 9) - 30;
    drawText(buffer, decodedText, bottomTextX, CONFIG.HEIGHT - 40);
    
    // 4. Небольшой текст сверху
    drawText(buffer, 'ВЕРХ', 150, 10);
    
    // Создаём PNG изображение
    console.log('\nСоздаём PNG...');
    const png = new PNG({ 
      width: CONFIG.WIDTH, 
      height: CONFIG.HEIGHT 
    });
    png.data = Buffer.from(buffer);
    
    // Отправляем ответ
    console.log('Отправляем изображение...');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const imageBuffer = PNG.sync.write(png);
    console.log(`Размер PNG: ${imageBuffer.length} байт`);
    console.log('=== ЗАВЕРШЕНО УСПЕШНО ===\n');
    
    res.end(imageBuffer);
    
  } catch (error) {
    console.error('=== ОШИБКА ===', error);
    
    // Простой текстовый ответ об ошибке
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      message: 'Ошибка генерации изображения'
    });
  }
}

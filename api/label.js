import QRCode from 'qrcode';
import { PNG } from 'pngjs';

const CONFIG = {
  WIDTH: 384,     // Ширина (пикселей)
  HEIGHT: 260,    // Высота (пикселей)
  QR_SIZE: 180,   // Размер QR-кода
  TEXT_OFFSET_X: 20,  // Отступ текста сверху
  TEXT_OFFSET_Y: 30   // Отступ текста слева
};

// Шрифт 8x8 (расширенный)
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

/**
 * Рисует текст, повёрнутый на 90° по часовой стрелке
 * (читается сверху вниз, слева)
 */
function drawRotatedText90(buffer, text, offsetX, offsetY) {
  const chars = text.toUpperCase().split('');
  console.log(`Рисуем повёрнутый текст: "${text}" (${chars.length} символов)`);
  console.log(`Позиция: offsetX=${offsetX}, offsetY=${offsetY}`);
  
  for (let letterIndex = 0; letterIndex < chars.length; letterIndex++) {
    const char = chars[letterIndex];
    const glyph = FONT_8x8[char] || FONT_8x8['?'];
    
    // Каждая буква - 8 колонок в ширину
    for (let col = 0; col < 8; col++) {
      const colData = glyph[col];
      
      // Каждая колонка - 8 строк в высоту
      for (let row = 0; row < 8; row++) {
        // Проверяем, должен ли пиксель быть чёрным
        if (colData & (1 << (7 - row))) {
          // ПОВОРОТ на 90° по часовой стрелке:
          // - row становится X координатой (вертикаль)
          // - offsetY + letterIndex*9 + col становится Y координатой (горизонталь)
          const x = offsetX + row;  // вертикальная позиция (вниз от верха)
          const y = offsetY + (letterIndex * 9) + col;  // горизонтальная позиция (вправо)
          
          // Проверяем границы: x < HEIGHT, y < WIDTH
          if (x >= 0 && x < CONFIG.HEIGHT && y >= 0 && y < CONFIG.WIDTH) {
            // ИНДЕКС: (строка * ширина + столбец) * 4
            const idx = (x * CONFIG.WIDTH + y) * 4;
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
    
    console.log('=== ГЕНЕРАЦИЯ ЭТИКЕТКИ ===');
    console.log('Текст:', decodedText);
    console.log('QR URL:', decodedQR);
    console.log('Размеры:', `${CONFIG.WIDTH}x${CONFIG.HEIGHT}`);
    
    // Создаём белый холст
    const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;     // R
      buffer[i + 1] = 255; // G
      buffer[i + 2] = 255; // B
      buffer[i + 3] = 255; // A
    }
    
    // === 1. ОТЛАДОЧНАЯ РАМКА ===
    console.log('Рисуем отладочную рамку...');
    for (let x = 0; x < CONFIG.WIDTH; x++) {
      // Верх (красный)
      let idx = (0 * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
      // Низ (красный)
      idx = ((CONFIG.HEIGHT-1) * CONFIG.WIDTH + x) * 4;
      buffer[idx] = 255; buffer[idx+1] = 0; buffer[idx+2] = 0;
    }
    for (let y = 0; y < CONFIG.HEIGHT; y++) {
      // Лево (синий) - где будет текст
      let idx = (y * CONFIG.WIDTH + 0) * 4;
      buffer[idx] = 0; buffer[idx+1] = 0; buffer[idx+2] = 255;
      // Право (зелёный) - где будет QR
      idx = (y * CONFIG.WIDTH + (CONFIG.WIDTH-1)) * 4;
      buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
    }
    
    // === 2. ТЕКСТ СЛЕВА (повёрнутый на 90°) ===
    console.log('\nРисуем текст слева...');
    drawRotatedText90(buffer, decodedText, CONFIG.TEXT_OFFSET_X, CONFIG.TEXT_OFFSET_Y);
    
    // === 3. ТОЧКИ ДЛЯ ОТЛАДКИ ===
    // Красная точка в начале текста
    const startIdx = (CONFIG.TEXT_OFFSET_X * CONFIG.WIDTH + CONFIG.TEXT_OFFSET_Y) * 4;
    buffer[startIdx] = 255; buffer[startIdx+1] = 0; buffer[startIdx+2] = 0;
    
    // Жёлтая точка через 50px от начала
    const midIdx = (CONFIG.TEXT_OFFSET_X * CONFIG.WIDTH + (CONFIG.TEXT_OFFSET_Y + 50)) * 4;
    buffer[midIdx] = 255; buffer[midIdx+1] = 255; buffer[midIdx+2] = 0;
    
    // === 4. QR-КОД СПРАВА ===
    console.log('\nГенерируем QR-код...');
    const qrBuffer = await QRCode.toBuffer(decodedQR, {
      width: CONFIG.QR_SIZE,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    const qrImage = PNG.sync.read(qrBuffer);
    
    // Позиция QR: справа, по центру вертикали
    const qrX = 40;  // отступ слева для QR
    const qrY = Math.floor((CONFIG.HEIGHT - CONFIG.QR_SIZE) / 2);
    
    console.log('QR позиция:', { qrX, qrY, QR_SIZE: CONFIG.QR_SIZE });
    
    for (let y = 0; y < CONFIG.QR_SIZE; y++) {
      for (let x = 0; x < CONFIG.QR_SIZE; x++) {
        const srcIdx = (y * CONFIG.QR_SIZE + x) * 4;
        const dstX = qrX + x;
        const dstY = qrY + y;
        
        if (dstX >= 0 && dstX < CONFIG.WIDTH && dstY >= 0 && dstY < CONFIG.HEIGHT) {
          const dstIdx = (dstY * CONFIG.WIDTH + dstX) * 4;
          
          // Копируем чёрные пиксели QR
          if (qrImage.data[srcIdx] < 128) {
            buffer[dstIdx] = 0;
            buffer[dstIdx+1] = 0;
            buffer[dstIdx+2] = 0;
          }
        }
      }
    }
    
    // === 5. ПОДПИСЬ РАЗМЕРОВ (для отладки) ===
    const sizeText = `${CONFIG.WIDTH}x${CONFIG.HEIGHT}`;
    for (let i = 0; i < sizeText.length; i++) {
      const char = sizeText[i];
      const glyph = FONT_8x8[char] || FONT_8x8['?'];
      
      for (let col = 0; col < 8; col++) {
        for (let row = 0; row < 8; row++) {
          if (glyph[col] & (1 << (7 - row))) {
            const x = CONFIG.HEIGHT - 20 + row;
            const y = CONFIG.WIDTH - 100 + i * 10 + col;
            if (x < CONFIG.HEIGHT && y < CONFIG.WIDTH) {
              const idx = (x * CONFIG.WIDTH + y) * 4;
              buffer[idx] = 200;
              buffer[idx+1] = 200;
              buffer[idx+2] = 200;
            }
          }
        }
      }
    }
    
    // === 6. СОЗДАЁМ PNG ===
    console.log('\nСоздаём PNG изображение...');
    const png = new PNG({ 
      width: CONFIG.WIDTH, 
      height: CONFIG.HEIGHT 
    });
    png.data = Buffer.from(buffer);
    
    // === 7. ОТПРАВЛЯЕМ ===
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Label-Generator', 'v1.0');
    
    console.log('Изображение готово, отправляем...');
    console.log('=== ЗАВЕРШЕНО ===\n');
    
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('=== ОШИБКА ===', error);
    
    res.status(500).json({
      error: error.message,
      message: 'Ошибка генерации этикетки',
      timestamp: new Date().toISOString()
    });
  }
}

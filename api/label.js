import QRCode from 'qrcode';
import { PNG } from 'pngjs';

// ==================== ПРАВИЛЬНЫЙ ШРИФТ 8x8 ====================
const FONT_8x8 = {
  // Только нужные буквы для "ТЕСТ"
  'Т': [0xFF,0x18,0x18,0x18,0x18,0x18,0x18,0x00], // Т
  'Е': [0xFF,0xC0,0xC0,0xFC,0xC0,0xC0,0xFF,0x00], // Е  
  'С': [0x3C,0x42,0x80,0x80,0x80,0x42,0x3C,0x00], // С
  'П': [0xFF,0x81,0x81,0x81,0x81,0x81,0x81,0x00], // П
  'Р': [0xFF,0x81,0x81,0xFF,0x80,0x80,0x80,0x00], // Р
  'И': [0x81,0x83,0x85,0x89,0x91,0xA1,0xC1,0x00], // И
  'В': [0xFF,0x81,0x81,0xFF,0x81,0x81,0xFF,0x00], // В
  'А': [0x18,0x24,0x42,0x42,0x7E,0x42,0x42,0x00], // А
  'Б': [0xFE,0x80,0x80,0xFC,0x82,0x82,0xFC,0x00], // Б
  '0': [0x3C,0x42,0x81,0x81,0x81,0x42,0x3C,0x00],
  '1': [0x08,0x18,0x28,0x08,0x08,0x08,0x3E,0x00],
  '2': [0x3C,0x42,0x02,0x0C,0x30,0x40,0x7E,0x00],
  '3': [0x3C,0x42,0x02,0x1C,0x02,0x42,0x3C,0x00],
  '4': [0x04,0x0C,0x14,0x24,0x7E,0x04,0x04,0x00],
  '5': [0x7E,0x40,0x7C,0x02,0x02,0x42,0x3C,0x00],
  '6': [0x1C,0x20,0x40,0x7C,0x42,0x42,0x3C,0x00],
  '7': [0x7E,0x02,0x04,0x08,0x10,0x20,0x40,0x00],
  '8': [0x3C,0x42,0x42,0x3C,0x42,0x42,0x3C,0x00],
  '9': [0x3C,0x42,0x42,0x3E,0x02,0x04,0x38,0x00]
};

/**
 * Рисует текст, повёрнутый на 90° ПО ЧАСОВОЙ СТРЕЛКЕ
 * (читается сверху вниз, слева)
 */
function drawRotatedText90(buffer, width, height, text, offsetX, offsetY) {
  const chars = String(text).toUpperCase().split('');
  
  // Для каждой буквы
  for (let letterIndex = 0; letterIndex < chars.length; letterIndex++) {
    const char = chars[letterIndex];
    const glyph = FONT_8x8[char] || FONT_8x8['?'] || Array(8).fill(0x00);
    
    // Рисуем 8 столбцов (ширина буквы)
    for (let col = 0; col < 8; col++) {
      const colData = glyph[col];
      
      // Рисуем 8 строк (высота буквы)
      for (let row = 0; row < 8; row++) {
        // Если пиксель должен быть чёрным
        if (colData & (1 << (7 - row))) {
          // ПОВОРОТ НА 90° ПО ЧАСОВОЙ СТРЕЛКЕ:
          // Исходный X становится Y
          // Исходный Y становится (width - 1 - X)
          const x = offsetX + row;                   // Горизонталь
          const y = offsetY + letterIndex * 9 + col; // Вертикаль (9 = 8+1 пробел)
          
          // Проверяем границы
          if (x >= 0 && x < height && y >= 0 && y < width) {
            // ИНДЕКСАЦИЯ: (строка * ширина + столбец) * 4
            const idx = (x * width + y) * 4;
            buffer[idx] = 0;     // R
            buffer[idx + 1] = 0; // G
            buffer[idx + 2] = 0; // B
            buffer[idx + 3] = 255; // A
          }
        }
      }
    }
  }
}

export default async function handler(req, res) {
  try {
    // Параметры
    const text = decodeURIComponent(req.query.text || 'ТЕСТ');
    const qr = decodeURIComponent(req.query.qr || 'https://ya.ru');
    
    console.log('Генерация этикетки:', { text, qr });
    
    // Размеры (ВАЖНО: 384x260 - это ШИРИНА x ВЫСОТА)
    const WIDTH = 384;   // Ширина изображения (пикселей)
    const HEIGHT = 260;  // Высота изображения (пикселей)
    
    // Создаём белый холст
    const buffer = new Uint8Array(WIDTH * HEIGHT * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;   // R
      buffer[i+1] = 255; // G
      buffer[i+2] = 255; // B
      buffer[i+3] = 255; // A
    }
    
    // === 1. ОТЛАДОЧНАЯ РАМКА (зелёная) ===
    for (let x = 0; x < WIDTH; x++) {
      // Верх
      let idx = (0 * WIDTH + x) * 4;
      buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
      // Низ
      idx = ((HEIGHT-1) * WIDTH + x) * 4;
      buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
    }
    for (let y = 0; y < HEIGHT; y++) {
      // Лево
      let idx = (y * WIDTH + 0) * 4;
      buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
      // Право
      idx = (y * WIDTH + (WIDTH-1)) * 4;
      buffer[idx] = 0; buffer[idx+1] = 255; buffer[idx+2] = 0;
    }
    
    // === 2. ТЕКСТ СЛЕВА (вертикальный) ===
    // offsetX = отступ сверху (20px)
    // offsetY = отступ слева (30px)
    console.log('Рисуем текст:', text, 'по координатам (20, 30)');
    drawRotatedText90(buffer, WIDTH, HEIGHT, text, 20, 30);
    
    // === 3. ОТЛАДОЧНЫЕ МЕТКИ ===
    // Красный пиксель в начале текста
    const startIdx = (20 * WIDTH + 30) * 4;
    buffer[startIdx] = 255; buffer[startIdx+1] = 0; buffer[startIdx+2] = 0;
    
    // Синий пиксель в конце текста
    const endIdx = (100 * WIDTH + 30) * 4;
    buffer[endIdx] = 0; buffer[endIdx+1] = 0; buffer[endIdx+2] = 255;
    
    // === 4. QR-КОД СПРАВА ===
    const QR_SIZE = 180;
    const qrBuffer = await QRCode.toBuffer(qr, {
      width: QR_SIZE,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    const qrImage = PNG.sync.read(qrBuffer);
    
    // Позиция QR: справа, по центру вертикали
    const qrX = Math.floor((HEIGHT - QR_SIZE) / 2);  // центрируем по вертикали
    const qrY = WIDTH - QR_SIZE - 40;                // отступ справа 40px
    
    console.log('QR позиция:', { qrX, qrY, QR_SIZE });
    
    for (let y = 0; y < QR_SIZE; y++) {
      for (let x = 0; x < QR_SIZE; x++) {
        const srcIdx = (y * QR_SIZE + x) * 4;
        const dstX = qrX + x;
        const dstY = qrY + y;
        
        if (dstX >= 0 && dstX < HEIGHT && dstY >= 0 && dstY < WIDTH) {
          const dstIdx = (dstX * WIDTH + dstY) * 4;
          
          // Копируем чёрные пиксели
          if (qrImage.data[srcIdx] < 128) {
            buffer[dstIdx] = 0;
            buffer[dstIdx+1] = 0;
            buffer[dstIdx+2] = 0;
          }
        }
      }
    }
    
    // === 5. ПОДПИСЬ КООРДИНАТ (для отладки) ===
    // В левом нижнем углу пишем размер
    const sizeText = `${WIDTH}x${HEIGHT}`;
    for (let i = 0; i < sizeText.length; i++) {
      const char = sizeText[i];
      for (let col = 0; col < 8; col++) {
        for (let row = 0; row < 8; row++) {
          const x = HEIGHT - 20 + row;
          const y = 20 + i * 10 + col;
          if (x < HEIGHT && y < WIDTH) {
            const idx = (x * WIDTH + y) * 4;
            buffer[idx] = 200;
            buffer[idx+1] = 200;
            buffer[idx+2] = 200;
          }
        }
      }
    }
    
    // === 6. СОЗДАЁМ PNG ===
    const png = new PNG({ width: WIDTH, height: HEIGHT });
    png.data = Buffer.from(buffer);
    
    // === 7. ОТПРАВЛЯЕМ ===
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    console.log('Изображение готово, отправляем...');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('ФАТАЛЬНАЯ ОШИБКА:', error);
    
    // Создаём изображение с текстом ошибки
    const errorPng = new PNG({ width: 384, height: 260 });
    
    // Розовый фон
    for (let i = 0; i < errorPng.data.length; i += 4) {
      errorPng.data[i] = 255;
      errorPng.data[i+1] = 220;
      errorPng.data[i+2] = 220;
      errorPng.data[i+3] = 255;
    }
    
    // Чёрный текст
    const errorMsg = `ERR: ${error.message.substring(0, 20)}`;
    for (let i = 0; i < errorMsg.length; i++) {
      const char = errorMsg[i];
      for (let col = 0; col < 8; col++) {
        for (let row = 0; row < 8; row++) {
          const x = 50 + row;
          const y = 50 + i * 10 + col;
          if (x < 260 && y < 384) {
            const idx = (x * 384 + y) * 4;
            errorPng.data[idx] = 0;
            errorPng.data[idx+1] = 0;
            errorPng.data[idx+2] = 0;
          }
        }
      }
    }
    
    res.setHeader('Content-Type', 'image/png');
    res.end(PNG.sync.write(errorPng));
  }
}

import QRCode from 'qrcode';
import { PNG } from 'pngjs';

// ==================== 5x7 Bitmap Font с КИРИЛЛИЦЕЙ ====================
const FONT_5X7 = {
  // Русские буквы (основные)
  'А': [0x7C,0x12,0x11,0x12,0x7C,0x00,0x00],
  'Б': [0x7F,0x49,0x49,0x49,0x36,0x00,0x00],
  'В': [0x7F,0x49,0x49,0x49,0x36,0x00,0x00],
  'Г': [0x7F,0x01,0x01,0x01,0x01,0x00,0x00],
  'Д': [0x60,0x1E,0x11,0x1E,0x60,0x00,0x00],
  'Е': [0x7F,0x49,0x49,0x49,0x41,0x00,0x00],
  'Ё': [0x7F,0x49,0x49,0x49,0x41,0x00,0x00],
  'Ж': [0x77,0x08,0x7F,0x08,0x77,0x00,0x00],
  'З': [0x22,0x41,0x49,0x49,0x36,0x00,0x00],
  'И': [0x7F,0x10,0x08,0x04,0x7F,0x00,0x00],
  'Й': [0x7F,0x10,0x09,0x05,0x7F,0x00,0x00],
  'К': [0x7F,0x08,0x14,0x22,0x41,0x00,0x00],
  'Л': [0x40,0x3F,0x01,0x01,0x7F,0x00,0x00],
  'М': [0x7F,0x02,0x0C,0x02,0x7F,0x00,0x00],
  'Н': [0x7F,0x08,0x08,0x08,0x7F,0x00,0x00],
  'О': [0x3E,0x41,0x41,0x41,0x3E,0x00,0x00],
  'П': [0x7F,0x01,0x01,0x01,0x7F,0x00,0x00],
  'Р': [0x7F,0x09,0x09,0x09,0x06,0x00,0x00],
  'С': [0x3E,0x41,0x41,0x41,0x22,0x00,0x00],
  'Т': [0x01,0x01,0x7F,0x01,0x01,0x00,0x00],
  'У': [0x47,0x48,0x48,0x48,0x3F,0x00,0x00],
  'Ф': [0x0E,0x11,0x7F,0x11,0x0E,0x00,0x00],
  'Х': [0x63,0x14,0x08,0x14,0x63,0x00,0x00],
  'Ц': [0x7F,0x40,0x40,0x40,0x7F,0x40,0x00],
  'Ч': [0x07,0x08,0x08,0x08,0x7F,0x00,0x00],
  'Ш': [0x7F,0x40,0x38,0x40,0x7F,0x00,0x00],
  'Щ': [0x7F,0x40,0x3E,0x40,0x7F,0x40,0x00],
  'Ъ': [0x01,0x7F,0x48,0x48,0x30,0x00,0x00],
  'Ы': [0x7F,0x48,0x30,0x48,0x7F,0x00,0x00],
  'Ь': [0x7F,0x48,0x48,0x48,0x30,0x00,0x00],
  'Э': [0x46,0x49,0x49,0x49,0x3E,0x00,0x00],
  'Ю': [0x7F,0x08,0x36,0x41,0x3E,0x00,0x00],
  'Я': [0x47,0x48,0x48,0x48,0x7F,0x00,0x00],
  
  // Латинские буквы для совместимости
  'A': [0x7C,0x12,0x11,0x12,0x7C,0x00,0x00],
  'B': [0x7F,0x49,0x49,0x49,0x36,0x00,0x00],
  'C': [0x3E,0x41,0x41,0x41,0x22,0x00,0x00],
  'D': [0x7F,0x41,0x41,0x41,0x3E,0x00,0x00],
  'E': [0x7F,0x49,0x49,0x49,0x41,0x00,0x00],
  'F': [0x7F,0x09,0x09,0x09,0x01,0x00,0x00],
  
  // Цифры
  '0': [0x3E,0x45,0x49,0x51,0x3E,0x00,0x00],
  '1': [0x00,0x21,0x7F,0x01,0x00,0x00,0x00],
  '2': [0x23,0x45,0x49,0x49,0x31,0x00,0x00],
  '3': [0x22,0x49,0x49,0x49,0x36,0x00,0x00],
  '4': [0x78,0x08,0x08,0x7F,0x08,0x00,0x00],
  '5': [0x79,0x49,0x49,0x49,0x46,0x00,0x00],
  '6': [0x3E,0x49,0x49,0x49,0x26,0x00,0x00],
  '7': [0x01,0x01,0x79,0x05,0x03,0x00,0x00],
  '8': [0x36,0x49,0x49,0x49,0x36,0x00,0x00],
  '9': [0x32,0x49,0x49,0x49,0x3E,0x00,0x00],
  
  // Специальные символы
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00],
  '-': [0x08,0x08,0x08,0x08,0x08,0x00,0x00],
  '_': [0x40,0x40,0x40,0x40,0x40,0x00,0x00],
  '?': [0x02,0x01,0x51,0x09,0x06,0x00,0x00]
};

function drawRotatedText(buffer, width, text, startX, startY, color = [0, 0, 0]) {
  const chars = String(text).toUpperCase().split('');
  let yOffset = startY;
  
  for (const char of chars) {
    const glyph = FONT_5X7[char] || FONT_5X7['?'] || [0x00,0x00,0x00,0x00,0x00,0x00,0x00];
    
    // Рисуем каждый столбец глифа (ширина 7 пикселей)
    for (let col = 0; col < 7; col++) {
      const colByte = glyph[col] || 0;
      
      // Рисуем 7 строк глифа (высота 7 пикселей)
      for (let row = 0; row < 7; row++) {
        // Проверяем бит в столбце (поворот на 90° уже учтён координатами)
        if (colByte & (1 << row)) {
          const x = startX + row;
          const y = yOffset + col;
          
          if (x >= 0 && x < 260 && y >= 0 && y < 384) {
            const idx = (x * width + y) * 4;
            buffer[idx] = color[0];     // R
            buffer[idx + 1] = color[1]; // G
            buffer[idx + 2] = color[2]; // B
            buffer[idx + 3] = 255;      // A
          }
        }
      }
    }
    yOffset += 8; // Межбуквенный интервал (7 пикселей буква + 1 пустой)
  }
}

function createPng(buffer, width, height) {
  const png = new PNG({ width, height });
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pngIdx = (y * width + x) * 4;
      
      png.data[pngIdx] = buffer[idx];
      png.data[pngIdx + 1] = buffer[idx + 1];
      png.data[pngIdx + 2] = buffer[idx + 2];
      png.data[pngIdx + 3] = buffer[idx + 3];
    }
  }
  
  return png;
}

export default async function handler(req, res) {
  try {
    const { text = 'ТЕСТ', qr = 'https://ya.ru' } = req.query;
    
    // Размер этикетки: 384x260 пикселей (58x39 мм @ 203 DPI)
    const width = 384;
    const height = 260;
    
    // Создаём белый холст (RGBA)
    const buffer = new Uint8Array(width * height * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;     // R
      buffer[i + 1] = 255; // G
      buffer[i + 2] = 255; // B
      buffer[i + 3] = 255; // A
    }
    
    // 1. Рисуем повёрнутый текст слева
    // startX = 20 (отступ от верхнего края), startY = 220 (отступ от правого края)
    drawRotatedText(buffer, width, decodeURIComponent(text), 20, 220, [0, 0, 0]);
    
    // 2. Генерируем QR-код
    const qrSize = 180;
    const qrDataUrl = await QRCode.toDataURL(decodeURIComponent(qr), {
      width: qrSize,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Конвертируем DataURL в буфер
    const qrBase64 = qrDataUrl.split(',')[1];
    const qrBuffer = Buffer.from(qrBase64, 'base64');
    const qrImage = PNG.sync.read(qrBuffer);
    
    // 3. Вставляем QR-код справа
    const qrX = 40;    // отступ сверху (пиксели)
    const qrY = 160;   // отступ слева (пиксели)
    
    for (let y = 0; y < qrImage.height; y++) {
      for (let x = 0; x < qrImage.width; x++) {
        const qrIdx = (y * qrImage.width + x) * 4;
        
        // Позиция в целевом изображении
        const dstX = qrX + y;
        const dstY = qrY + x;
        
        if (dstX < height && dstY < width) {
          const dstIdx = (dstX * width + dstY) * 4;
          
          // Копируем только чёрные пиксели QR (темнее 50%)
          if (qrImage.data[qrIdx] < 128) {
            buffer[dstIdx] = 0;     // R
            buffer[dstIdx + 1] = 0; // G
            buffer[dstIdx + 2] = 0; // B
            buffer[dstIdx + 3] = 255; // A
          }
        }
      }
    }
    
    // 4. Добавим рамку для отладки (опционально)
    // Рамка вокруг всей этикетки
    for (let x = 0; x < width; x++) {
      const topIdx = (0 * width + x) * 4;
      const bottomIdx = ((height-1) * width + x) * 4;
      buffer[topIdx] = buffer[topIdx+1] = buffer[topIdx+2] = 200;
      buffer[bottomIdx] = buffer[bottomIdx+1] = buffer[bottomIdx+2] = 200;
    }
    
    // 5. Создаём PNG и отправляем
    const png = createPng(buffer, width, height);
    const pngBuffer = PNG.sync.write(png);
    
    // Настраиваем заголовки
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    // Отправляем изображение
    res.end(pngBuffer);
    
  } catch (error) {
    console.error('Error generating label:', error);
    
    // Возвращаем простую картинку с ошибкой для отладки
    const errorPng = new PNG({ width: 384, height: 260 });
    for (let i = 0; i < errorPng.data.length; i += 4) {
      errorPng.data[i] = 255;     // R
      errorPng.data[i+1] = 200;   // G
      errorPng.data[i+2] = 200;   // B
      errorPng.data[i+3] = 255;   // A
    }
    
    const errorBuffer = PNG.sync.write(errorPng);
    res.setHeader('Content-Type', 'image/png');
    res.end(errorBuffer);
  }
}

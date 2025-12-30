import QRCode from 'qrcode';
import { PNG } from 'pngjs';

// ==================== 8x8 Bitmap Font (упрощённый) ====================
const FONT_8X8 = {
  // РУССКИЕ БУКВЫ (заглавные)
  'А': [0x18,0x3C,0x66,0x66,0x7E,0x66,0x66,0x00],
  'Б': [0x7E,0x60,0x7C,0x66,0x66,0x66,0x7C,0x00],
  'В': [0x7C,0x66,0x66,0x7C,0x66,0x66,0x7C,0x00],
  'Г': [0x7E,0x60,0x60,0x60,0x60,0x60,0x60,0x00],
  'Д': [0x3C,0x6C,0x6C,0x6C,0x6C,0x6C,0xFE,0xC6],
  'Е': [0x7E,0x60,0x7C,0x60,0x60,0x60,0x7E,0x00],
  'Ё': [0x7E,0x60,0x7C,0x60,0x60,0x60,0x7E,0x00],
  'Ж': [0x66,0x66,0x3C,0x18,0x3C,0x66,0x66,0x00],
  'З': [0x3C,0x66,0x06,0x1C,0x06,0x66,0x3C,0x00],
  'И': [0x66,0x66,0x76,0x7E,0x6E,0x66,0x66,0x00],
  'Й': [0x66,0x66,0x76,0x7E,0x6E,0x66,0x66,0x00],
  'К': [0x66,0x6C,0x78,0x70,0x78,0x6C,0x66,0x00],
  'Л': [0x1E,0x36,0x66,0x66,0x66,0x66,0x66,0x00],
  'М': [0x63,0x77,0x7F,0x6B,0x6B,0x63,0x63,0x00],
  'Н': [0x66,0x66,0x66,0x7E,0x66,0x66,0x66,0x00],
  'О': [0x3C,0x66,0x66,0x66,0x66,0x66,0x3C,0x00],
  'П': [0x7E,0x66,0x66,0x66,0x66,0x66,0x66,0x00],
  'Р': [0x7C,0x66,0x66,0x7C,0x60,0x60,0x60,0x00],
  'С': [0x3C,0x66,0x60,0x60,0x60,0x66,0x3C,0x00],
  'Т': [0x7E,0x18,0x18,0x18,0x18,0x18,0x18,0x00],
  'У': [0x66,0x66,0x66,0x3C,0x18,0x30,0x60,0x00],
  'Ф': [0x18,0x3C,0x66,0x66,0x66,0x3C,0x18,0x00],
  'Х': [0x66,0x66,0x3C,0x18,0x3C,0x66,0x66,0x00],
  'Ц': [0x66,0x66,0x66,0x66,0x66,0x66,0x7F,0x03],
  'Ч': [0x66,0x66,0x66,0x3E,0x06,0x06,0x06,0x00],
  'Ш': [0x6B,0x6B,0x6B,0x6B,0x6B,0x6B,0x7F,0x00],
  'Щ': [0x6B,0x6B,0x6B,0x6B,0x6B,0x6B,0x7F,0x03],
  'Ъ': [0x70,0x30,0x3E,0x33,0x33,0x33,0x1E,0x00],
  'Ы': [0x67,0x66,0x76,0x7E,0x6E,0x66,0x67,0x00],
  'Ь': [0x60,0x60,0x7C,0x66,0x66,0x66,0x7C,0x00],
  'Э': [0x3C,0x66,0x06,0x1E,0x06,0x66,0x3C,0x00],
  'Ю': [0x66,0x6E,0x7E,0x76,0x66,0x66,0x66,0x00],
  'Я': [0x3E,0x66,0x66,0x3E,0x1E,0x36,0x66,0x00],
  
  // ЛАТИНИЦА
  'A': [0x18,0x3C,0x66,0x66,0x7E,0x66,0x66,0x00],
  'B': [0x7C,0x66,0x66,0x7C,0x66,0x66,0x7C,0x00],
  'C': [0x3C,0x66,0x60,0x60,0x60,0x66,0x3C,0x00],
  'D': [0x78,0x6C,0x66,0x66,0x66,0x6C,0x78,0x00],
  'E': [0x7E,0x60,0x7C,0x60,0x60,0x60,0x7E,0x00],
  'F': [0x7E,0x60,0x7C,0x60,0x60,0x60,0x60,0x00],
  
  // ЦИФРЫ
  '0': [0x3C,0x66,0x6E,0x76,0x66,0x66,0x3C,0x00],
  '1': [0x18,0x38,0x18,0x18,0x18,0x18,0x7E,0x00],
  '2': [0x3C,0x66,0x06,0x0C,0x18,0x30,0x7E,0x00],
  '3': [0x3C,0x66,0x06,0x1C,0x06,0x66,0x3C,0x00],
  '4': [0x0C,0x1C,0x3C,0x6C,0x7E,0x0C,0x0C,0x00],
  '5': [0x7E,0x60,0x7C,0x06,0x06,0x66,0x3C,0x00],
  '6': [0x3C,0x66,0x60,0x7C,0x66,0x66,0x3C,0x00],
  '7': [0x7E,0x06,0x0C,0x18,0x30,0x30,0x30,0x00],
  '8': [0x3C,0x66,0x66,0x3C,0x66,0x66,0x3C,0x00],
  '9': [0x3C,0x66,0x66,0x3E,0x06,0x66,0x3C,0x00],
  
  // СПЕЦСИМВОЛЫ
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
  '-': [0x00,0x00,0x00,0x7E,0x00,0x00,0x00,0x00],
  '_': [0x00,0x00,0x00,0x00,0x00,0x00,0x7E,0x00],
  '.': [0x00,0x00,0x00,0x00,0x00,0x18,0x18,0x00],
  '?': [0x3C,0x66,0x06,0x0C,0x18,0x00,0x18,0x00]
};

/**
 * Рисует текст, повёрнутый на 90° против часовой стрелки
 * (текст идёт снизу вверх слева)
 */
function drawRotatedText(buffer, width, height, text, startX, startY, color = [0, 0, 0]) {
  const chars = String(text).toUpperCase().split('');
  let currentY = startY;
  
  for (const char of chars) {
    const glyph = FONT_8X8[char] || FONT_8X8['?'] || Array(8).fill(0x00);
    
    // Для каждого столбца глифа (8 столбцов)
    for (let col = 0; col < 8; col++) {
      const colData = glyph[col];
      
      // Для каждого ряда в столбце (8 рядов = 8 пикселей высотой)
      for (let row = 0; row < 8; row++) {
        // Проверяем бит (старший бит = верхний пиксель)
        if (colData & (1 << (7 - row))) {
          // Координаты с поворотом на 90°
          // startX - отступ слева (ось Y после поворота)
          // currentY - текущая позиция по вертикали (ось X после поворота)
          const x = startX + row;           // Горизонталь после поворота
          const y = currentY + (7 - col);   // Вертикаль после поворота
          
          if (x >= 0 && x < height && y >= 0 && y < width) {
            const idx = (x * width + y) * 4;
            buffer[idx] = color[0];
            buffer[idx + 1] = color[1];
            buffer[idx + 2] = color[2];
            buffer[idx + 3] = 255;
          }
        }
      }
    }
    
    currentY += 10; // Межбуквенный интервал (8 + 2)
    
    // Если текст слишком длинный - обрезаем
    if (currentY > width - 10) break;
  }
}

/**
 * Рисует рамку вокруг всей этикетки
 */
function drawBorder(buffer, width, height, color = [200, 200, 200]) {
  // Верхняя и нижняя границы
  for (let x = 0; x < width; x++) {
    // Верх
    let idx = (0 * width + x) * 4;
    buffer[idx] = color[0]; buffer[idx+1] = color[1]; buffer[idx+2] = color[2];
    
    // Низ
    idx = ((height-1) * width + x) * 4;
    buffer[idx] = color[0]; buffer[idx+1] = color[1]; buffer[idx+2] = color[2];
  }
  
  // Левая и правая границы
  for (let y = 0; y < height; y++) {
    // Лево
    let idx = (y * width + 0) * 4;
    buffer[idx] = color[0]; buffer[idx+1] = color[1]; buffer[idx+2] = color[2];
    
    // Право
    idx = (y * width + (width-1)) * 4;
    buffer[idx] = color[0]; buffer[idx+1] = color[1]; buffer[idx+2] = color[2];
  }
}

export default async function handler(req, res) {
  try {
    // Получаем параметры
    let { text = 'ТЕСТ', qr = 'https://ya.ru' } = req.query;
    
    // Декодируем URL-параметры
    text = decodeURIComponent(text);
    qr = decodeURIComponent(qr);
    
    console.log('Generating label:', { text, qr });
    
    // Размер этикетки: 384x260 пикселей
    // ОРИЕНТАЦИЯ: ширина = 384, высота = 260
    // После поворота на 90°: ширина = 260, высота = 384
    const width = 384;   // Ширина изображения (пиксели)
    const height = 260;  // Высота изображения (пиксели)
    
    // Создаём белый холст (RGBA)
    const buffer = new Uint8Array(width * height * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 255;     // R
      buffer[i + 1] = 255; // G
      buffer[i + 2] = 255; // B
      buffer[i + 3] = 255; // A
    }
    
    // 1. Рисуем рамку для отладки
    drawBorder(buffer, width, height, [220, 220, 220]);
    
    // 2. Рисуем повёрнутый текст СЛЕВА
    // Текст будет вертикальным, читается снизу вверх
    // startX = 30 (отступ от верха после поворота)
    // startY = 30 (отступ от левого края после поворота)
    drawRotatedText(buffer, width, height, text, 30, 30, [0, 0, 0]);
    
    // 3. Генерируем QR-код СПРАВА
    const qrSize = 180;
    const qrDataUrl = await QRCode.toDataURL(qr, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Конвертируем DataURL в буфер
    const qrBase64 = qrDataUrl.split(',')[1];
    const qrBuffer = Buffer.from(qrBase64, 'base64');
    const qrImage = PNG.sync.read(qrBuffer);
    
    // 4. Вставляем QR-код (справа, по центру по вертикали)
    const qrX = Math.floor((height - qrSize) / 2);  // Центрируем по вертикали
    const qrY = width - qrSize - 40;                // Отступ справа
    
    console.log('QR position:', { qrX, qrY, qrSize, width, height });
    
    for (let y = 0; y < qrImage.height; y++) {
      for (let x = 0; x < qrImage.width; x++) {
        const qrIdx = (y * qrImage.width + x) * 4;
        
        // Позиция в целевом изображении
        const dstY = qrY + y;
        const dstX = qrX + x;
        
        if (dstX >= 0 && dstX < height && dstY >= 0 && dstY < width) {
          const dstIdx = (dstX * width + dstY) * 4;
          
          // Если пиксель QR тёмный (не белый)
          if (qrImage.data[qrIdx] < 200) {
            buffer[dstIdx] = 0;     // R
            buffer[dstIdx + 1] = 0; // G
            buffer[dstIdx + 2] = 0; // B
            buffer[dstIdx + 3] = 255; // A
          }
        }
      }
    }
    
    // 5. Добавим отладочные линии
    // Линия, разделяющая текст и QR
    for (let y = 0; y < height; y++) {
      const x = 150; // Примерная граница
      if (x < width) {
        const idx = (y * width + x) * 4;
        buffer[idx] = 255;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
      }
    }
    
    // 6. Создаём PNG
    const png = new PNG({ width, height });
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = (y * width + x) * 4;
        
        png.data[dstIdx] = buffer[srcIdx];
        png.data[dstIdx + 1] = buffer[srcIdx + 1];
        png.data[dstIdx + 2] = buffer[srcIdx + 2];
        png.data[dstIdx + 3] = buffer[srcIdx + 3];
      }
    }
    
    const pngBuffer = PNG.sync.write(png);
    
    // 7. Отправляем
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.end(pngBuffer);
    
  } catch (error) {
    console.error('ERROR:', error);
    
    // Создаём изображение с ошибкой
    const errorPng = new PNG({ width: 384, height: 260 });
    const errorMsg = `Error: ${error.message}`;
    
    // Красный фон
    for (let i = 0; i < errorPng.data.length; i += 4) {
      errorPng.data[i] = 255;
      errorPng.data[i+1] = 200;
      errorPng.data[i+2] = 200;
      errorPng.data[i+3] = 255;
    }
    
    // Белый текст ошибки
    const ctx = {
      data: errorPng.data,
      width: 384
    };
    
    res.setHeader('Content-Type', 'image/png');
    res.end(PNG.sync.write(errorPng));
  }
}

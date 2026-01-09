const QRCode = require('qrcode');
const { PNG } = require('pngjs');
const FONT_8x8 = require('./font');

// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  HEADER_HEIGHT_RATIO: 0.1, // 10% под заголовок
  LOGO_WIDTH_RATIO: 0.5,    // Левая половина под логотип
  QR_MARGIN: 20,
  TEXT_X_PADDING: 10,
  TEXT_Y_PADDING: 5
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

/**
 * Создаёт белый холст RGBA
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
 * Рисует текст шрифтом 8x8 в заданной области (горизонтально)
 * @param {Uint8Array} buffer — буфер изображения
 * @param {string} text — текст для отрисовки
 * @param {number} startX — X начала текста
 * @param {number} startY — Y начала текста
 * @param {number} maxWidth — максимальная ширина (в пикселях)
 */
function drawText(buffer, text, startX, startY, maxWidth = Infinity) {
  const chars = text.toUpperCase().split('');
  let currentX = startX;

  for (const char of chars) {
    const glyph = FONT_8x8[char] || FONT_8x8['?'] || Array(8).fill(0);

    // Проверяем, помещается ли символ
    if (currentX + 8 > startX + maxWidth) break;

    for (let row = 0; row < 8; row++) {
      const rowData = glyph[row] || 0;
      for (let col = 0; col < 8; col++) {
        if (rowData & (1 << (7 - col))) {
          const x = currentX + col;
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

    currentX += 9; // 8 пикселей + 1 пробел
  }
}

/**
 * Рисует прямоугольник (например, рамку или фон)
 */
function fillRect(buffer, x, y, w, h, r = 0, g = 0, b = 0) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px >= 0 && px < CONFIG.WIDTH && py >= 0 && py < CONFIG.HEIGHT) {
        const idx = (py * CONFIG.WIDTH + px) * 4;
        buffer[idx] = r;
        buffer[idx + 1] = g;
        buffer[idx + 2] = b;
      }
    }
  }
}

// ==================== ОСНОВНОЙ ЭКСПОРТНЫЙ ХЕНДЛЕР ====================

module.exports = async (req, res) => {
  console.log('🚀 Запуск генератора этикеток');

  try {
    // === Параметры запроса ===
    const headerText = (req.query.header || 'ЗАГОЛОВОК').toString();
    const logoText = (req.query.logo || 'ЛОГОТИП').toString();
    const qrContent = (req.query.qr || 'https://ya.ru').toString();

    console.log('Параметры:', { headerText, logoText, qrContent });

    // === Шаг 1: Создаём холст ===
    const buffer = createWhiteCanvas();

    // === Шаг 2: Вычисляем зоны ===
    const headerHeight = Math.floor(CONFIG.HEIGHT * CONFIG.HEADER_HEIGHT_RATIO);
    const contentY = headerHeight;
    const contentHeight = CONFIG.HEIGHT - headerHeight;
    const halfWidth = Math.floor(CONFIG.WIDTH * CONFIG.LOGO_WIDTH_RATIO);

    // === Шаг 3: Заголовок (верхняя полоса) ===
    fillRect(buffer, 0, 0, CONFIG.WIDTH, headerHeight, 240, 240, 240); // светло-серый фон
    drawText(
      buffer,
      headerText,
      CONFIG.TEXT_X_PADDING,
      CONFIG.TEXT_Y_PADDING,
      CONFIG.WIDTH - 2 * CONFIG.TEXT_X_PADDING
    );

    // === Шаг 4: Логотип слева (текст как заглушка) ===
    const logoStartX = CONFIG.TEXT_X_PADDING;
    const logoStartY = contentY + CONFIG.TEXT_Y_PADDING;
    drawText(buffer, logoText, logoStartX, logoStartY, halfWidth - 2 * CONFIG.TEXT_X_PADDING);

    // === Шаг 5: QR-код справа ===
    const qrSize = Math.min(contentHeight - 20, halfWidth - 2 * CONFIG.QR_MARGIN);
    const qrX = CONFIG.WIDTH - qrSize - CONFIG.QR_MARGIN;
    const qrY = contentY + Math.floor((contentHeight - qrSize) / 2);

    try {
      console.log('Генерация QR...');
      const qrBuffer = await QRCode.toBuffer(qrContent, {
        width: qrSize,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
        type: 'png'
      });

      const qrImage = PNG.sync.read(qrBuffer);

      for (let y = 0; y < qrImage.height; y++) {
        for (let x = 0; x < qrImage.width; x++) {
          const srcIdx = (y * qrImage.width + x) * 4;
          const dstX = qrX + x;
          const dstY = qrY + y;

          if (dstX >= 0 && dstX < CONFIG.WIDTH && dstY >= 0 && dstY < CONFIG.HEIGHT) {
            const dstIdx = (dstY * CONFIG.WIDTH + dstX) * 4;
            if (qrImage.data[srcIdx] < 128) {
              buffer[dstIdx] = 0;
              buffer[dstIdx + 1] = 0;
              buffer[dstIdx + 2] = 0;
            }
          }
        }
      }

      console.log('✅ QR готов');
    } catch (qrError) {
      console.error('Ошибка генерации QR:', qrError.message);
      // Рисуем заглушку вместо QR
      fillRect(buffer, qrX, qrY, qrSize, qrSize, 200, 200, 200);
      drawText(buffer, 'QR ERR', qrX + 5, qrY + qrSize / 2 - 4, qrSize - 10);
    }

    // === Шаг 6: Формируем и отправляем PNG ===
    const png = new PNG({ width: CONFIG.WIDTH, height: CONFIG.HEIGHT });
    png.data = Buffer.from(buffer);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.end(PNG.sync.write(png));

    console.log('✅ Этикетка успешно сгенерирована');
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
    res.status(500).json({
      error: error.message || 'Неизвестная ошибка',
      message: 'Ошибка генерации этикетки'
    });
  }
};

const QRCode = require('qrcode');
const { PNG } = require('pngjs');
const FONT_8x8 = require('./font');

// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  HEADER_HEIGHT_RATIO: 0.12, // чуть больше под заголовок (12%)
  LOGO_WIDTH_RATIO: 0.5,
  QR_MARGIN: 15,
  TEXT_TOP_PADDING: 10,      // отступ от верха для текста
  TEXT_LEFT_PADDING: 12,
  FONT_SCALE: 2              // масштаб шрифта: 8x8 → 16x16
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function createWhiteCanvas() {
  const buffer = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = 255;
    buffer[i + 1] = 255;
    buffer[i + 2] = 255;
    buffer[i + 3] = 255;
  }
  return buffer;
}

/**
 * Рисует текст с масштабированием шрифта
 */
function drawScaledText(buffer, text, startX, startY, maxWidth = Infinity) {
  const chars = text.toUpperCase().split('');
  let currentX = startX;

  for (const char of chars) {
    const glyph = FONT_8x8[char] || FONT_8x8['?'] || Array(8).fill(0);

    if (currentX + 8 * CONFIG.FONT_SCALE > startX + maxWidth) break;

    for (let row = 0; row < 8; row++) {
      const rowData = glyph[row] || 0;
      for (let col = 0; col < 8; col++) {
        if (rowData & (1 << (7 - col))) {
          // Масштабируем каждый пиксель в блок CONFIG.FONT_SCALE × CONFIG.FONT_SCALE
          for (let sy = 0; sy < CONFIG.FONT_SCALE; sy++) {
            for (let sx = 0; sx < CONFIG.FONT_SCALE; sx++) {
              const x = currentX + col * CONFIG.FONT_SCALE + sx;
              const y = startY + row * CONFIG.FONT_SCALE + sy;
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

    currentX += (8 + 1) * CONFIG.FONT_SCALE; // символ + пробел
  }
}

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

// ==================== ОСНОВНОЙ ХЕНДЛЕР ====================

module.exports = async (req, res) => {
  console.log('🚀 Запуск генератора этикеток');

  try {
    const headerText = (req.query.header || 'ЗАГОЛОВОК').toString();
    const logoText = (req.query.logo || 'ЛОГОТИП').toString();
    const qrContent = (req.query.qr || 'https://ya.ru').toString();

    console.log('Параметры:', { headerText, logoText, qrContent });

    const buffer = createWhiteCanvas();

    // === Расчёт зон ===
    const headerHeight = Math.floor(CONFIG.HEIGHT * CONFIG.HEADER_HEIGHT_RATIO);
    const contentY = headerHeight;
    const contentHeight = CONFIG.HEIGHT - headerHeight;
    const halfWidth = Math.floor(CONFIG.WIDTH * CONFIG.LOGO_WIDTH_RATIO);

    // === Заголовок ===
    fillRect(buffer, 0, 0, CONFIG.WIDTH, headerHeight, 245, 245, 245);
    drawScaledText(
      buffer,
      headerText,
      CONFIG.TEXT_LEFT_PADDING,
      CONFIG.TEXT_TOP_PADDING,
      CONFIG.WIDTH - 2 * CONFIG.TEXT_LEFT_PADDING
    );

    // === Логотип слева ===
    const logoStartX = CONFIG.TEXT_LEFT_PADDING;
    const logoStartY = contentY + 10; // небольшой отступ от разделителя
    drawScaledText(buffer, logoText, logoStartX, logoStartY, halfWidth - 2 * CONFIG.TEXT_LEFT_PADDING);

    // === QR-код справа (увеличен на 10%) ===
    const baseQrSize = Math.min(contentHeight - 20, halfWidth - 2 * CONFIG.QR_MARGIN);
    const qrSize = Math.floor(baseQrSize * 1.1); // +10%
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
      fillRect(buffer, qrX, qrY, qrSize, qrSize, 220, 220, 220);
      drawScaledText(buffer, 'QR ERR', qrX + 10, qrY + qrSize / 2 - 8, qrSize - 20);
    }

    // === Отправка изображения ===
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

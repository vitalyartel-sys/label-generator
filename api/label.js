const { createCanvas, loadImage, registerFont } = require('canvas');
const QRCode = require('qrcode');
const path = require('path');

// ==================== РЕГИСТРАЦИЯ КАСТОМНОГО ШРИФТА ====================
// Путь к TTF-файлу (относительно этого файла)
const fontPath = path.join(__dirname, '..', 'font', 'roboto-condensed-light.ttf');
registerFont(fontPath, { family: 'Roboto Condensed Light' });

// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  HEADER_RATIO: 0.14,
  LOGO_WIDTH_RATIO: 0.5,
  QR_MARGIN: 15,
  FONT_FAMILY: 'Roboto Condensed Light' // ← именно так, как указано в registerFont
};

// ==================== ОСНОВНОЙ ХЕНДЛЕР ====================
module.exports = async (req, res) => {
  try {
    const headerText = (req.query.header || 'ЗАГОЛОВОК').toString();
    const logoText = (req.query.logo || 'ЛОГОТИП').toString();
    const qrContent = (req.query.qr || 'https://ya.ru').toString();

    console.log('🎨 Генерация этикетки с Roboto Condensed Light');

    // Создаём холст
    const canvas = createCanvas(CONFIG.WIDTH, CONFIG.HEIGHT);
    const ctx = canvas.getContext('2d');

    // Белый фон
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // === ЗАГОЛОВОК ===
    const headerHeight = Math.floor(CONFIG.HEIGHT * CONFIG.HEADER_RATIO);
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, CONFIG.WIDTH, headerHeight);

    ctx.font = `20px "${CONFIG.FONT_FAMILY}"`;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    wrapText(ctx, headerText, 12, 8, CONFIG.WIDTH - 24, headerHeight - 16);

    // === ЛОГОТИП СЛЕВА ===
    const contentY = headerHeight;
    const contentHeight = CONFIG.HEIGHT - headerHeight;
    const halfWidth = Math.floor(CONFIG.WIDTH * CONFIG.LOGO_WIDTH_RATIO);

    ctx.font = `18px "${CONFIG.FONT_FAMILY}"`;
    wrapText(ctx, logoText, 12, contentY + 10, halfWidth - 24, contentHeight - 20);

    // === QR-КОД СПРАВА ===
    const baseQrSize = Math.min(contentHeight - 20, halfWidth - 2 * CONFIG.QR_MARGIN);
    const qrSize = Math.floor(baseQrSize * 1.1);
    const qrX = CONFIG.WIDTH - qrSize - CONFIG.QR_MARGIN;
    const qrY = contentY + Math.floor((contentHeight - qrSize) / 2);

    try {
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        width: qrSize,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      const qrImage = await loadImage(qrDataUrl);
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    } catch (qrErr) {
      console.error('QR ошибка:', qrErr.message);
      ctx.fillStyle = '#EEEEEE';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      ctx.fillStyle = '#999999';
      ctx.font = `14px "${CONFIG.FONT_FAMILY}"`;
      ctx.textAlign = 'center';
      ctx.fillText('QR ERR', qrX + qrSize / 2, qrY + qrSize / 2 - 7);
    }

    // === ОТПРАВКА ===
    const buffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.end(buffer);

    console.log('✅ Этикетка успешно сгенерирована');
  } catch (error) {
    console.error('💥 Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== ФУНКЦИЯ ПЕРЕНОСА ТЕКСТА ====================
function wrapText(ctx, text, x, y, maxWidth, maxHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  const lineHeight = parseInt(ctx.font.match(/\d+/)[0], 10) + 4;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + (line ? ' ' : '') + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
      if (currentY > y + maxHeight) break;
    } else {
      line = testLine;
    }
  }

  if (line && currentY <= y + maxHeight) {
    ctx.fillText(line, x, currentY);
  }
}

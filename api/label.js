const QRCode = require('qrcode');
const { PNG } = require('pngjs');
const FONT_8x8 = require('../font'); // ← путь зависит от структуры!

const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  HEADER_RATIO: 0.14,
  LOGO_WIDTH_RATIO: 0.5,
  QR_MARGIN: 15,
  TEXT_PADDING: 10
};

function createWhiteCanvas() {
  const buf = new Uint8Array(CONFIG.WIDTH * CONFIG.HEIGHT * 4);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = 255; buf[i+1] = 255; buf[i+2] = 255; buf[i+3] = 255;
  }
  return buf;
}

function drawChar(buffer, glyph, x, y) {
  for (let row = 0; row < 8; row++) {
    const rowData = glyph[row] || 0;
    for (let col = 0; col < 8; col++) {
      if (rowData & (1 << (7 - col))) {
        const px = x + col;
        const py = y + row;
        if (px >= 0 && px < CONFIG.WIDTH && py >= 0 && py < CONFIG.HEIGHT) {
          const idx = (py * CONFIG.WIDTH + px) * 4;
          buffer[idx] = 0; buffer[idx+1] = 0; buffer[idx+2] = 0;
        }
      }
    }
  }
}

function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (test.length * 8 <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawText(buffer, text, x, y, maxWidth, maxLines = 2) {
  const lines = wrapText(text, Math.floor(maxWidth / 8));
  for (let i = 0; i < lines.length && i < maxLines; i++) {
    const line = lines[i].toUpperCase();
    let cx = x;
    for (const ch of line) {
      const glyph = FONT_8x8[ch] || FONT_8x8['?'];
      drawChar(buffer, glyph, cx, y + i * 10);
      cx += 9;
    }
  }
}

module.exports = async (req, res) => {
  try {
    const header = req.query.header || 'ЗАГОЛОВОК';
    const logo = req.query.logo || 'ЛОГОТИП';
    const qr = req.query.qr || 'https://ya.ru';

    const buffer = createWhiteCanvas();
    const headerHeight = Math.floor(CONFIG.HEIGHT * CONFIG.HEADER_RATIO);
    const contentY = headerHeight;
    const contentHeight = CONFIG.HEIGHT - headerHeight;
    const halfWidth = Math.floor(CONFIG.WIDTH * CONFIG.LOGO_WIDTH_RATIO);

    // Заголовок
    for (let x = 0; x < CONFIG.WIDTH; x++) {
      for (let dy = 0; dy < headerHeight; dy++) {
        const idx = (dy * CONFIG.WIDTH + x) * 4;
        buffer[idx] = 245; buffer[idx+1] = 245; buffer[idx+2] = 245;
      }
    }
    drawText(buffer, header, CONFIG.TEXT_PADDING, 4, CONFIG.WIDTH - 2 * CONFIG.TEXT_PADDING, 2);

    // Логотип слева
    drawText(buffer, logo, CONFIG.TEXT_PADDING, contentY + 6, halfWidth - 2 * CONFIG.TEXT_PADDING, 3);

    // QR справа
    const qrSize = Math.min(contentHeight - 20, halfWidth - 2 * CONFIG.QR_MARGIN) * 1.1;
    const size = Math.floor(qrSize);
    const qrX = CONFIG.WIDTH - size - CONFIG.QR_MARGIN;
    const qrY = contentY + Math.floor((contentHeight - size) / 2);

    try {
      const qrBuf = await QRCode.toBuffer(qr, { width: size, margin: 1 });
      const qrImg = PNG.sync.read(qrBuf);
      for (let y = 0; y < qrImg.height; y++) {
        for (let x = 0; x < qrImg.width; x++) {
          const src = (y * qrImg.width + x) * 4;
          const dstX = qrX + x;
          const dstY = qrY + y;
          if (dstX < CONFIG.WIDTH && dstY < CONFIG.HEIGHT && qrImg.data[src] < 128) {
            const dst = (dstY * CONFIG.WIDTH + dstX) * 4;
            buffer[dst] = 0; buffer[dst+1] = 0; buffer[dst+2] = 0;
          }
        }
      }
    } catch (e) {
      // Заглушка QR
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          const px = qrX + dx, py = qrY + dy;
          if (px < CONFIG.WIDTH && py < CONFIG.HEIGHT) {
            const idx = (py * CONFIG.WIDTH + px) * 4;
            buffer[idx] = 220; buffer[idx+1] = 220; buffer[idx+2] = 220;
          }
        }
      }
      drawText(buffer, 'QR ERR', qrX + 5, qrY + size / 2 - 4, size - 10, 1);
    }

    const png = new PNG({ width: CONFIG.WIDTH, height: CONFIG.HEIGHT });
    png.data = Buffer.from(buffer);
    res.setHeader('Content-Type', 'image/png');
    res.end(PNG.sync.write(png));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

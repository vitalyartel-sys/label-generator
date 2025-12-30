import QRCode from 'qrcode';
import { PNG } from 'pngjs';

// Простой 5x7 шрифт (ASCII 32–126)
const FONT_5X7 = [
  // Пробел
  [0, 0, 0, 0, 0],
  // !
  [0, 0, 23, 0, 0],
  // "
  [3, 0, 3, 0, 0],
  // #
  [10, 31, 10, 31, 10],
  // $
  [7, 10, 7, 10, 7],
  // %
  [18, 21, 8, 5, 18],
  // &
  [10, 21, 21, 10, 10],
  // '
  [2, 1, 0, 0, 0],
  // (
  [4, 2, 2, 2, 4],
  // )
  [2, 4, 4, 4, 2],
  // *
  [0, 10, 4, 10, 0],
  // +
  [0, 4, 31, 4, 0],
  // ,
  [0, 0, 0, 2, 1],
  // -
  [0, 0, 31, 0, 0],
  // .
  [0, 0, 0, 0, 3],
  // /
  [16, 8, 4, 2, 1],
  // 0
  [14, 17, 17, 17, 14],
  // 1
  [4, 6, 4, 4, 15],
  // 2
  [15, 1, 15, 16, 31],
  // 3
  [15, 1, 15, 1, 15],
  // 4
  [9, 9, 31, 1, 1],
  // 5
  [31, 16, 31, 1, 31],
  // 6
  [14, 16, 31, 17, 14],
  // 7
  [31, 1, 2, 4, 8],
  // 8
  [14, 17, 14, 17, 14],
  // 9
  [14, 17, 15, 1, 14],
  // :
  [0, 10, 0, 10, 0],
  // ;
  [0, 10, 0, 2, 1],
  // <
  [4, 2, 1, 2, 4],
  // =
  [0, 31, 0, 31, 0],
  // >
  [1, 2, 4, 2, 1],
  // ?
  [15, 1, 2, 0, 2],
  // @
  [14, 17, 25, 17, 14],
  // A
  [4, 10, 31, 10, 10],
  // B
  [30, 17, 30, 17, 30],
  // C
  [14, 17, 17, 17, 17],
  // D
  [30, 17, 17, 17, 30],
  // E
  [31, 16, 31, 16, 31],
  // F
  [31, 16, 31, 16, 16],
  // G
  [14, 17, 17, 25, 14],
  // H
  [17, 17, 31, 17, 17],
  // I
  [31, 8, 8, 8, 31],
  // J
  [17, 17, 17, 17, 14],
  // K
  [17, 18, 28, 18, 17],
  // L
  [16, 16, 16, 16, 31],
  // M
  [17, 27, 21, 17, 17],
  // N
  [17, 19, 21, 25, 17],
  // O
  [14, 17, 17, 17, 14],
  // P
  [30, 17, 30, 16, 16],
  // Q
  [14, 17, 25, 18, 15],
  // R
  [30, 17, 30, 18, 17],
  // S
  [14, 16, 14, 1, 14],
  // T
  [31, 8, 8, 8, 8],
  // U
  [17, 17, 17, 17, 14],
  // V
  [17, 17, 17, 10, 4],
  // W
  [17, 17, 21, 21, 10],
  // X
  [17, 10, 4, 10, 17],
  // Y
  [17, 17, 14, 8, 8],
  // Z
  [31, 2, 4, 8, 31],
  // [
  [14, 8, 8, 8, 14],
  // \
  [1, 2, 4, 8, 16],
  // ]
  [14, 2, 2, 2, 14],
  // ^
  [4, 10, 17, 0, 0],
  // _
  [0, 0, 0, 0, 31],
  // `
  [1, 2, 0, 0, 0],
  // a
  [0, 14, 1, 15, 17],
  // b
  [16, 30, 17, 17, 30],
  // c
  [0, 14, 17, 17, 14],
  // d
  [1, 14, 17, 17, 14],
  // e
  [0, 14, 17, 31, 16],
  // f
  [28, 18, 28, 16, 16],
  // g
  [0, 14, 17, 15, 1, 14],
  // h
  [16, 30, 17, 17, 17],
  // i
  [8, 0, 24, 8, 8],
  // j
  [1, 0, 1, 9, 9, 6],
  // k
  [16, 17, 18, 28, 18],
  // l
  [24, 8, 8, 8, 28],
  // m
  [0, 21, 21, 21, 21],
  // n
  [0, 30, 17, 17, 17],
  // o
  [0, 14, 17, 17, 14],
  // p
  [0, 30, 17, 30, 16, 16],
  // q
  [0, 14, 17, 15, 1, 14],
  // r
  [0, 30, 17, 16, 16],
  // s
  [0, 14, 16, 14, 1],
  // t
  [16, 28, 16, 16, 15],
  // u
  [0, 17, 17, 17, 15],
  // v
  [0, 17, 17, 10, 4],
  // w
  [0, 17, 21, 21, 10],
  // x
  [0, 17, 10, 10, 17],
  // y
  [0, 17, 17, 15, 1, 14],
  // z
  [0, 31, 2, 4, 31],
  // {
  [14, 8, 8, 8, 4, 8, 14],
  // |
  [8, 8, 8, 8, 8],
  // }
  [14, 2, 2, 2, 4, 2, 14],
  // ~
  [0, 10, 5, 0, 0]
];

// Рисуем повёрнутый текст на буфере
function drawRotatedText(buffer, width, text, startX, startY) {
  const chars = text.split('');
  let currentX = startX;
  for (const char of chars) {
    const code = char.charCodeAt(0);
    let charData;
    if (code >= 32 && code <= 126) {
      charData = FONT_5X7[code - 32];
    } else {
      charData = FONT_5X7[0]; // пробел
    }
    for (let dy = 0; dy < charData.length; dy++) {
      const col = charData[dy];
      for (let dx = 0; dx < 7; dx++) {
        if (col & (1 << (6 - dx))) {
          const px = currentX + dx;
          const py = startY + dy;
          if (px >= 0 && px < 260 && py >= 0 && py < 384) {
            const idx = (px * width + py) * 4;
            buffer[idx] = 0;     // R
            buffer[idx + 1] = 0; // G
            buffer[idx + 2] = 0; // B
            buffer[idx + 3] = 255; // A
          }
        }
      }
    }
    currentX += 6; // ширина символа + отступ
  }
}

// Создаём PNG из буфера
function createPng(buffer, width, height) {
  const png = new PNG({ width, height });
  png.data = Buffer.from(buffer);
  return png;
}

// Основной обработчик
export default async function handler(req, res) {
  const { text = 'NO TEXT', qr = 'https://example.com' } = req.query;

  // Холст 384x260 (ширина x высота)
  const width = 384;
  const height = 260;
  const buffer = new Uint8Array(width * height * 4).fill(255); // белый фон

  // Рисуем повёрнутый текст (слева, ~20px от края)
  drawRotatedText(buffer, width, text, 20, 220);

  // Генерируем QR как Data URL
  const qrDataUrl = await QRCode.toDataURL(qr, { width: 180 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = PNG.sync.read(qrBuffer);

  // Вставляем QR справа (160, 40)
  for (let y = 0; y < qrImage.height; y++) {
    for (let x = 0; x < qrImage.width; x++) {
      const qrIdx = (y * qrImage.width + x) * 4;
      const dstX = 40 + y;
      const dstY = 160 + x;
      if (dstX < height && dstY < width) {
        const dstIdx = (dstX * width + dstY) * 4;
        buffer[dstIdx] = qrImage.data[qrIdx];
        buffer[dstIdx + 1] = qrImage.data[qrIdx + 1];
        buffer[dstIdx + 2] = qrImage.data[qrIdx + 2];
        buffer[dstIdx + 3] = qrImage.data[qrIdx + 3];
      }
    }
  }

  // Отправка PNG
  const png = createPng(buffer, width, height);
  const pngBuffer = PNG.sync.write(png);

  res.setHeader('Content-Type', 'image/png');
  res.end(pngBuffer);
}

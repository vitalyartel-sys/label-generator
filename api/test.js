const { PNG } = require('pngjs');

module.exports = (req, res) => {
  const png = new PNG({ width: 384, height: 260 });
  
  // Заливаем жёлтым
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 255;     // R
    png.data[i+1] = 255;   // G
    png.data[i+2] = 0;     // B
    png.data[i+3] = 255;   // A
  }
  
  // Рисуем красный квадрат
  for (let y = 50; y < 100; y++) {
    for (let x = 50; x < 100; x++) {
      const idx = (y * 384 + x) * 4;
      png.data[idx] = 255;
      png.data[idx+1] = 0;
      png.data[idx+2] = 0;
    }
  }
  
  // Текст "ТЕСТ" простыми пикселями
  const text = "ТЕСТ";
  for (let i = 0; i < text.length; i++) {
    for (let j = 0; j < 5; j++) {
      const x = 150 + i * 8;
      const y = 100 + j;
      const idx = (y * 384 + x) * 4;
      png.data[idx] = 0;
      png.data[idx+1] = 0;
      png.data[idx+2] = 0;
    }
  }
  
  res.setHeader('Content-Type', 'image/png');
  res.end(PNG.sync.write(png));
};

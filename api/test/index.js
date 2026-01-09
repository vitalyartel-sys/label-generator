const { PNG } = require('pngjs');

module.exports = (req, res) => {
  const png = new PNG({ width: 384, height: 260 });
  
  // Зелёный фон
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i+1] = 255;
    png.data[i+2] = 0;
    png.data[i+3] = 255;
  }
  
  // Белый текст "TEST"
  for (let i = 0; i < 4; i++) {
    for (let y = 100; y < 120; y++) {
      for (let x = 100 + i*30; x < 120 + i*30; x++) {
        const idx = (y * 384 + x) * 4;
        png.data[idx] = 255;
        png.data[idx+1] = 255;
        png.data[idx+2] = 255;
      }
    }
  }
  
  res.setHeader('Content-Type', 'image/png');
  res.end(PNG.sync.write(png));
};

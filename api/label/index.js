const { PNG } = require('pngjs');

module.exports = async (req, res) => {
  const png = new PNG({ width: 384, height: 260 });
  
  // Заливаем синим для теста
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i+1] = 0;
    png.data[i+2] = 255;
    png.data[i+3] = 255;
  }
  
  // Красный квадрат
  for (let y = 50; y < 150; y++) {
    for (let x = 50; x < 150; x++) {
      const idx = (y * 384 + x) * 4;
      png.data[idx] = 255;
      png.data[idx+1] = 0;
      png.data[idx+2] = 0;
    }
  }
  
  res.setHeader('Content-Type', 'image/png');
  res.end(PNG.sync.write(png));
};

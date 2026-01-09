const { PNG } = require('pngjs');

module.exports = async (req, res) => {
  try {
    // 1. Получаем параметры
    const text = req.query.text || 'ПРИВЕТ';
    console.log('Получен текст:', text);
    
    // 2. Создаём изображение 384x260
    const WIDTH = 384;
    const HEIGHT = 260;
    const png = new PNG({ width: WIDTH, height: HEIGHT });
    
    // 3. Заливаем БЕЛЫМ фоном
    for (let i = 0; i < png.data.length; i += 4) {
      png.data[i] = 255;     // R
      png.data[i+1] = 255;   // G
      png.data[i+2] = 255;   // B
      png.data[i+3] = 255;   // A
    }
    
    // 4. Рисуем КРАСНУЮ РАМКУ (чтобы видеть границы)
    // Верх
    for (let x = 0; x < WIDTH; x++) {
      let idx = (0 * WIDTH + x) * 4;
      png.data[idx] = 255;
      png.data[idx+1] = 0;
      png.data[idx+2] = 0;
    }
    // Низ
    for (let x = 0; x < WIDTH; x++) {
      let idx = ((HEIGHT-1) * WIDTH + x) * 4;
      png.data[idx] = 255;
      png.data[idx+1] = 0;
      png.data[idx+2] = 0;
    }
    // Лево
    for (let y = 0; y < HEIGHT; y++) {
      let idx = (y * WIDTH + 0) * 4;
      png.data[idx] = 255;
      png.data[idx+1] = 0;
      png.data[idx+2] = 0;
    }
    // Право
    for (let y = 0; y < HEIGHT; y++) {
      let idx = (y * WIDTH + (WIDTH-1)) * 4;
      png.data[idx] = 255;
      png.data[idx+1] = 0;
      png.data[idx+2] = 0;
    }
    
    // 5. Рисуем текст "ПРИВЕТ" ЧЁРНЫМИ БУКВАМИ
    // Просто рисуем 6 чёрных прямоугольников (каждая буква)
    
    // П (первая буква)
    for (let y = 50; y < 80; y++) {
      for (let x = 30; x < 60; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // Р (вторая буква)
    for (let y = 50; y < 80; y++) {
      for (let x = 70; x < 100; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // И (третья буква)
    for (let y = 50; y < 80; y++) {
      for (let x = 110; x < 140; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // В (четвёртая буква)
    for (let y = 50; y < 80; y++) {
      for (let x = 150; x < 180; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // Е (пятая буква)
    for (let y = 50; y < 80; y++) {
      for (let x = 190; x < 220; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // Т (шестая буква)
    for (let y = 50; y < 80; y++) {
      for (let x = 230; x < 260; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // 6. Рисуем ЗЕЛЁНУЮ ТОЧКУ в центре (чтобы видеть, что код работает)
    const centerX = Math.floor(WIDTH / 2);
    const centerY = Math.floor(HEIGHT / 2);
    const centerIdx = (centerY * WIDTH + centerX) * 4;
    png.data[centerIdx] = 0;
    png.data[centerIdx+1] = 255;
    png.data[centerIdx+2] = 0;
    
    // 7. Отправляем изображение
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('Изображение готово!');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('ОШИБКА:', error);
    
    // Отправляем простой текст об ошибке
    res.status(500).json({
      error: error.message,
      message: 'Произошла ошибка при генерации изображения'
    });
  }
};

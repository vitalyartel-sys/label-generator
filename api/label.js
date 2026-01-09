const { PNG } = require('pngjs');

module.exports = async (req, res) => {
  try {
    console.log('=== СТАРТ ГЕНЕРАЦИИ ===');
    
    // Параметры
    const text = req.query.text || 'ПРИВЕТ';
    console.log('Текст:', text);
    
    // Размеры
    const WIDTH = 384;
    const HEIGHT = 260;
    
    // Создаём PNG
    const png = new PNG({ width: WIDTH, height: HEIGHT });
    
    // 1. БЕЛЫЙ ФОН
    for (let i = 0; i < png.data.length; i += 4) {
      png.data[i] = 255;     // R
      png.data[i+1] = 255;   // G
      png.data[i+2] = 255;   // B
      png.data[i+3] = 255;   // A
    }
    
    // 2. КРАСНАЯ РАМКА (чтобы видеть границы)
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
    
    // 3. ТЕКСТ "ПРИВЕТ" - 6 КВАДРАТОВ
    // Буква П (30x30 пикселей)
    for (let y = 50; y < 80; y++) {
      for (let x = 30; x < 60; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;       // R
        png.data[idx+1] = 0;     // G
        png.data[idx+2] = 0;     // B
      }
    }
    
    // Буква Р (следующая)
    for (let y = 50; y < 80; y++) {
      for (let x = 70; x < 100; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // Буква И
    for (let y = 50; y < 80; y++) {
      for (let x = 110; x < 140; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // Буква В
    for (let y = 50; y < 80; y++) {
      for (let x = 150; x < 180; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // Буква Е
    for (let y = 50; y < 80; y++) {
      for (let x = 190; x < 220; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // Буква Т
    for (let y = 50; y < 80; y++) {
      for (let x = 230; x < 260; x++) {
        const idx = (y * WIDTH + x) * 4;
        png.data[idx] = 0;
        png.data[idx+1] = 0;
        png.data[idx+2] = 0;
      }
    }
    
    // 4. ЗЕЛЁНАЯ ТОЧКА В ЦЕНТРЕ (чтобы знать, что работает)
    const centerX = Math.floor(WIDTH / 2);
    const centerY = Math.floor(HEIGHT / 2);
    const centerIdx = (centerY * WIDTH + centerX) * 4;
    png.data[centerIdx] = 0;      // R
    png.data[centerIdx+1] = 255;  // G
    png.data[centerIdx+2] = 0;    // B
    
    // 5. СИНЯЯ НАДПИСЬ ВНИЗУ "384x260"
    for (let i = 0; i < 7; i++) {
      for (let y = HEIGHT - 30; y < HEIGHT - 20; y++) {
        for (let x = 50 + i*20; x < 60 + i*20; x++) {
          const idx = (y * WIDTH + x) * 4;
          png.data[idx] = 0;
          png.data[idx+1] = 0;
          png.data[idx+2] = 255;
        }
      }
    }
    
    // Отправляем
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('=== УСПЕШНО СГЕНЕРИРОВАНО ===');
    res.end(PNG.sync.write(png));
    
  } catch (error) {
    console.error('=== ОШИБКА ===', error);
    
    // Простая текстовая ошибка
    res.status(500).json({
      success: false,
      message: 'Ошибка генерации: ' + error.message
    });
  }
};

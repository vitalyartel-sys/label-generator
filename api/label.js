// ==================== НАСТРОЙКИ ====================
const CONFIG = {
  WIDTH: 384,
  HEIGHT: 260,
  TEXT_X: 50,      // Отступ текста слева
  TEXT_Y: 30,      // Отступ текста сверху
  FONT_SIZE: 24,   // Размер шрифта
  QR_SIZE: 150,    // Размер QR-кода
  QR_MARGIN: 40    // Отступ QR от края
};

// ==================== ОСНОВНОЙ КОД ====================

// Импортируем библиотеки
const { createCanvas, registerFont } = require('canvas');
const QRCode = require('qrcode');

// Главная функция
async function generateLabel(text, qrUrl) {
  console.log('🔧 Создаём canvas...');
  
  // 1. СОЗДАЁМ ХОЛСТ
  const canvas = createCanvas(CONFIG.WIDTH, CONFIG.HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // 2. БЕЛЫЙ ФОН
  console.log('🎨 Заливаем фон...');
  ctx.fillStyle = '#FFFFFF'; // белый
  ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  
  // 3. КРАСНАЯ РАМКА (для отладки)
  console.log('🟥 Рисуем рамку...');
  ctx.strokeStyle = '#FF0000'; // красный
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, CONFIG.WIDTH - 2, CONFIG.HEIGHT - 2);
  
  // 4. НАСТРАИВАЕМ ШРИФТ
  console.log('🔤 Настраиваем шрифт...');
  ctx.font = `bold ${CONFIG.FONT_SIZE}px Arial`;
  ctx.fillStyle = '#000000'; // чёрный
  ctx.textBaseline = 'top';
  
  // 5. ТЕКСТ СЛЕВА (ВЕРТИКАЛЬНЫЙ)
  console.log('📝 Рисуем текст...');
  const chars = text.toUpperCase().split('');
  
  // Каждую букву рисуем отдельно под предыдущей
  for (let i = 0; i < chars.length; i++) {
    // Сохраняем текущее состояние canvas
    ctx.save();
    
    // Перемещаем в позицию для этой буквы
    ctx.translate(CONFIG.TEXT_X, CONFIG.TEXT_Y + (i * (CONFIG.FONT_SIZE + 5)));
    
    // Поворачиваем на 90° (Math.PI/2 радиан = 90°)
    ctx.rotate(Math.PI / 2);
    
    // Рисуем букву
    ctx.fillText(chars[i], 0, 0);
    
    // Восстанавливаем состояние
    ctx.restore();
  }
  
  // 6. ГЕНЕРИРУЕМ QR-КОД
  console.log('🔳 Генерируем QR...');
  try {
    const qrBuffer = await QRCode.toBuffer(qrUrl, {
      width: CONFIG.QR_SIZE,
      margin: 1,
      color: {
        dark: '#000000',  // чёрные модули
        light: '#FFFFFF'  // белый фон
      }
    });
    
    // Создаём изображение из буфера QR
    const qrImage = new canvas.Image();
    qrImage.src = qrBuffer;
    
    // Позиция QR: справа, по центру вертикали
    const qrX = CONFIG.WIDTH - CONFIG.QR_SIZE - CONFIG.QR_MARGIN;
    const qrY = Math.floor((CONFIG.HEIGHT - CONFIG.QR_SIZE) / 2);
    
    // Рисуем QR на canvas
    ctx.drawImage(qrImage, qrX, qrY, CONFIG.QR_SIZE, CONFIG.QR_SIZE);
    
    console.log('✅ QR нарисован');
    
  } catch (error) {
    console.error('❌ Ошибка QR:', error.message);
    
    // Если QR не получился, рисуем чёрный квадрат
    ctx.fillStyle = '#000000';
    ctx.fillRect(
      CONFIG.WIDTH - CONFIG.QR_SIZE - CONFIG.QR_MARGIN,
      Math.floor((CONFIG.HEIGHT - CONFIG.QR_SIZE) / 2),
      CONFIG.QR_SIZE,
      CONFIG.QR_SIZE
    );
    
    // И букву Q внутри
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'Q',
      CONFIG.WIDTH - CONFIG.QR_SIZE - CONFIG.QR_MARGIN + CONFIG.QR_SIZE / 2,
      CONFIG.HEIGHT / 2
    );
  }
  
  // 7. ПОДПИСЬ ВНИЗУ (для отладки)
  ctx.font = '12px Arial';
  ctx.fillStyle = '#888888'; // серый
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(
    `${CONFIG.WIDTH}x${CONFIG.HEIGHT} | ${text}`,
    CONFIG.WIDTH - 10,
    CONFIG.HEIGHT - 10
  );
  
  // 8. ВОЗВРАЩАЕМ PNG
  console.log('📤 Конвертируем в PNG...');
  return canvas.toBuffer('image/png');
}

// ==================== ОБРАБОТЧИК API ====================

module.exports = async (req, res) => {
  console.log('🚀 === ЗАПУСК ГЕНЕРАЦИИ ЭТИКЕТКИ ===');
  
  try {
    // Получаем параметры из URL
    const text = req.query.text || 'ТЕСТ';
    const qr = req.query.qr || 'https://ya.ru';
    
    console.log('📋 Параметры:', { text, qr });
    
    // Генерируем изображение
    const imageBuffer = await generateLabel(text, qr);
    
    // Настраиваем заголовки ответа
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Label-Generator', 'Canvas v1.0');
    
    console.log('✅ === ЭТИКЕТКА ГОТОВА ===\n');
    
    // Отправляем изображение
    res.end(imageBuffer);
    
  } catch (error) {
    console.error('💥 === КРИТИЧЕСКАЯ ОШИБКА ===', error);
    
    // Отправляем ошибку как JSON
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Ошибка генерации этикетки',
      timestamp: new Date().toISOString()
    });
  }
};

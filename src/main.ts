import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Tạo một instance Logger với tên ngữ cảnh là 'Bootstrap'
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // 2. Cấu hình Port
  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);

  // 3. Thông báo chạy Port thành công
  logger.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  logger.log(`📅 Ngày bắt đầu: ${new Date().toLocaleDateString('vi-VN')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

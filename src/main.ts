import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';

async function bootstrap() {
  // Tạo một instance Logger với tên ngữ cảnh là 'Bootstrap'
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // 2. Cấu hình chạy Global Pipe (PHẢI TRƯỚC app.listen)
  // usePipe custom unique
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  });
  // Đây là 1 Validation
  app.useGlobalPipes(
    new ValidationPipe({
      // 1. Tự động chuyển đổi kiểu dữ liệu (Transform)
      transform: true,

      // 2. Loại bỏ các trường không được định nghĩa trong DTO (Security)
      whitelist: true,
      // 5. Quá trình xác thực dừng lại ở lỗi đầu tiên
      stopAtFirstError: true,

      // 3. Chặn đứng request nếu gửi lên trường lạ (Strict)
      forbidNonWhitelisted: true,

      // 4. Tùy chỉnh thông báo lỗi trả về cho Frontend (Exception Factory) , ở API , status 400
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: Object.values(error.constraints)[0],
        }));
        return new BadRequestException(result);
      },
    }),
  );
  /////// Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('QLNV API')
    .setDescription('Tai lieu API cho he thong quan ly nhan vien')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhap access token de goi cac API duoc bao ve',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 3. Cấu hình Port
  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);

  // 4. Thông báo chạy Port thành công
  logger.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  logger.log(`📘 Swagger docs: http://localhost:${PORT}/api-docs`);
  logger.log(`📅 Ngày bắt đầu: ${new Date().toLocaleDateString('vi-VN')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

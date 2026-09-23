// cloudinary.module.ts
import { Module } from '@nestjs/common';
import { UploadImageController } from '../controllers/upload-image.controller';
import { CloudinaryProvider } from '../providers/cloudinary.provider';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [UploadImageController],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class UploadImageModule {}

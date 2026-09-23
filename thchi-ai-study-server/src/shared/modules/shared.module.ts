import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from '../services/cloudinary.service';
import { HashingService } from '../services/hashing.service';
import { MediaGenerationService } from '../services/media-generation.service';
import { PrismaService } from '../services/prisma.service';
import { RedisService } from '../services/redis.service';
import { StreakService } from '../services/streak.service';
import { MailModule } from './mail.module';
import { OtpModule } from './otp.module';
@Global()
@Module({
  imports: [MailModule, OtpModule],
  providers: [
    PrismaService,
    HashingService,
    StreakService,
    MediaGenerationService,
    CloudinaryService,
    RedisService,
  ],
  exports: [
    PrismaService,
    HashingService,
    StreakService,
    MediaGenerationService,
    CloudinaryService,
    RedisService,
  ],
})
export class SharedModule {}

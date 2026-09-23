import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as googleTTS from 'google-tts-api';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class MediaGenerationService {
  private readonly logger = new Logger(MediaGenerationService.name);
  private readonly unsplashKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.unsplashKey = this.configService.get<string>(
      'UNSPLASH_ACCESS_KEY',
    ) as string;
  }

  async generateAudioUrl(text: string): Promise<string | null> {
    try {
      const ttsUrl = googleTTS.getAudioUrl(text, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });

      const response = await axios.get(ttsUrl, {
        responseType: 'arraybuffer',
      });
      const buffer = Buffer.from(response.data);

      const uploaded = await this.cloudinaryService.uploadImageAndAudio(
        buffer,
        {
          resource_type: 'video', 
          folder: 'vocabulary/audio',
        },
      );
      // @ts-ignore
      return uploaded.secure_url;
    } catch (error) {
      this.logger.error(`Lỗi sinh audio cho "${text}": ${error.message}`);
      return null; 
    }
  }

  // ─── IMAGE ───
  async searchImageUrl(query: string): Promise<string | null> {
    try {
      const res = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, per_page: 1, orientation: 'squarish' },
        headers: { Authorization: `Client-ID ${this.unsplashKey}` },
      });
      return res.data.results?.[0]?.urls?.regular ?? null;
    } catch (error) {
      this.logger.error(`Lỗi tìm ảnh cho "${query}": ${error.message}`);
      return null;
    }
  }
}

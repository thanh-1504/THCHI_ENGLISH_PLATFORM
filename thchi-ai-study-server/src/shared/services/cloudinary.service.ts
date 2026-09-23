// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { CloudinaryResponse } from '../schemas/cloudinary.schema';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      cloudinary.uploader.upload(
        base64File,
        { folder: 'thchi-ai', resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result?.secure_url as string,
            publicId: result?.public_id as string,
          });
        },
      );
    });
  }

  async uploadImageAndAudio(
    buffer: Buffer,
    options: { resource_type: 'image' | 'video'; folder: string },
  ) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  

  deleteImage(publicId: string) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryResponse);
      });
    });
  }
}

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as path from 'path';
@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) throw new BadRequestException('FIle không hợp lệ');
    const ext = path.extname(value.originalname).toLowerCase();
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const allowedExt = ['.csv', '.xls', '.xlsx'];
    const validMimeTypes = allowedMimeTypes.includes(value.mimetype);
    const validExt = allowedExt.includes(ext);
    if (!validMimeTypes || !validExt)
      throw new BadRequestException('Chỉ chấp nhận file CSV hoặc file Excel');

    return value;
  }
}

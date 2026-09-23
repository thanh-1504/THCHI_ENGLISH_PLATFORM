import { Injectable } from '@nestjs/common';
import Papa from 'papaparse';
import { FileCsvSchema, FileCsvType } from '../schemas/file.schema';
@Injectable()
export class FileService {
  constructor() {}
  parseCsv(buffer: Buffer) {
    const fileCsv = buffer.toString();
    return Papa.parse(fileCsv, {
      header: true,
      skipEmptyLines: true,
    });
  }

  validateRow(row: FileCsvType): boolean {
    const validRow = FileCsvSchema.safeParse(row);
    if (!validRow.success) return false;
    return true;
  }
}

import { createZodDto } from 'nestjs-zod';
import { FileCsvSchema } from '../schemas/file.schema';

export class FileCsvDTO extends createZodDto(FileCsvSchema) {}

import { createZodDto } from 'nestjs-zod';
import { CreateNoteBookSchema } from '../schemas/notebook.schema';

export class CreateNoteBookDTO extends createZodDto(CreateNoteBookSchema) {}

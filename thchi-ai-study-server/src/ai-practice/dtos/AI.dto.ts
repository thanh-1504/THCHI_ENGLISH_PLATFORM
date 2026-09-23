import { createZodDto } from 'nestjs-zod';
import { GenerateSentenceSchema, GradeSpeakingSchema, GradeWritingSchema } from '../schemas/AI.schema';

export class GenerateSentenceDTO extends createZodDto(GenerateSentenceSchema) {}
export class GradeWritingDTO extends createZodDto(GradeWritingSchema) {}
export class GradeSpeakingDTO extends createZodDto(GradeSpeakingSchema) {}
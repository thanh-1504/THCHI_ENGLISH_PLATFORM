import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

export const MyZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    const formatError = error.issues.map((e: any) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return new BadRequestException({
      status: 400,
      error: 'Validation Failed',
      message: formatError,
    });
  },
});

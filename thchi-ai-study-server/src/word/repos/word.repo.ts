import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/browser';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Word } from '../schemas/word.schema';

@Injectable()
export class WordRepo {
  constructor(private readonly prismaService: PrismaService) {}
  findByTerm(term: string) {
    return this.prismaService.word.findFirst({
      where: { term },
    });
  }

  findOne(id: string) {
    return this.prismaService.word.findUnique({
      where: { id },
      include: {
        definitions: true,
        examples: true,
      },
    });
  }

  createWordWithDefinitionsAndExamples(
    tx: Prisma.TransactionClient,
    payload: Word,
  ) {
    const { term, phonetic, audioUrl, definitions, examples } = payload;
    return tx.word.create({
      data: {
        term,
        phonetic,
        audioUrl,
        definitions: {
          create: definitions,
        },
        examples: {
          create: examples,
        },
      },
      include: {
        definitions: true,
        examples: true,
      },
    });
  }
}

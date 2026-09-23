import { Injectable } from '@nestjs/common';

@Injectable()
export class WordService {
  create(createWordDto: any) {
    return 'This action adds a new word';
  }

  findAll() {
    return `This action returns all word`;
  }

  findOne(id: string) {
    return `This action returns a #${id} word`;
  }

  update(id: number, updateWordDto: any) {
    return `This action updates a #${id} word`;
  }

  remove(id: number) {
    return `This action removes a #${id} word`;
  }
}

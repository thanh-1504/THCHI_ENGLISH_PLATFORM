import { Module } from '@nestjs/common';
import { MailModule } from 'src/shared/modules/mail.module';
import { NotebookController } from './notebook.controller';
import { NotebookService } from './notebook.service';
import { NoteBookRepo } from './repos/notebook.repo';

@Module({
  imports: [MailModule],
  controllers: [NotebookController],
  providers: [NotebookService, NoteBookRepo],
})
export class NotebookModule {}

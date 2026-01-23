import { Module } from '@nestjs/common';
import { RegistrationDocsService } from './registration-docs.service';
import { RegistrationDocsController } from './registration-docs.controller';

@Module({
  providers: [RegistrationDocsService],
  controllers: [RegistrationDocsController],
  exports: [RegistrationDocsService],
})
export class RegistrationDocsModule {}

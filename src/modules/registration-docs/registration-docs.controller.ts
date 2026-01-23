import { Controller, Post, UseInterceptors, UploadedFiles, Body } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RegistrationDocsService } from './registration-docs.service';

@Controller('registration-docs')
export class RegistrationDocsController {
  constructor(private readonly docsService: RegistrationDocsService) {}

  /**
   * Upload registration documents: fotoProfile (1), fotoCarnet (1), fotoPago (1-2, can be photo or PDF)
   */
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fotoProfile', maxCount: 1 },
      { name: 'fotoCarnet', maxCount: 1 },
      { name: 'fotoPago', maxCount: 2 },
    ]),
  )
  async upload(
    @UploadedFiles()
    files: { [fieldname: string]: Express.Multer.File[] },
    @Body() body: { uuid: string; nick: string },
  ) {
    return await this.docsService.uploadDocuments(files, body.uuid, body.nick);
  }
}
